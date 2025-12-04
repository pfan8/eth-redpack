import {
  AlreadyClaimed as AlreadyClaimedEvent,
  RedPacketClaimed as RedPacketClaimedEvent,
  RedPacketCreated as RedPacketCreatedEvent,
  RedPacketEmpty as RedPacketEmptyEvent
} from "../generated/RedPacket/RedPacket";
import { Claim, RedPacket, User } from "../generated/schema";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";

function getOrCreateUser(address: Bytes): User {
  const id = address.toHexString();
  let user = User.load(id);
  if (user === null) {
    user = new User(id);
    user.totalClaimed = BigInt.zero();
    user.claimCount = 0;
  }
  return user as User;
}

export function handleRedPacketCreated(event: RedPacketCreatedEvent): void {
  const id = event.params.id.toString();
  let redPacket = RedPacket.load(id);
  if (redPacket === null) {
    redPacket = new RedPacket(id);
  }

  redPacket.creator = event.params.creator;
  redPacket.totalAmount = event.params.totalAmount;
  redPacket.remainingAmount = event.params.totalAmount;
  redPacket.packetCount = event.params.packetCount.toI32();
  redPacket.claimedCount = 0;
  redPacket.createdAt = event.block.timestamp;
  redPacket.isEmpty = false;

  redPacket.save();
}

export function handleRedPacketClaimed(event: RedPacketClaimedEvent): void {
  const id = event.params.id.toString();
  let redPacket = RedPacket.load(id);
  if (redPacket === null) {
    redPacket = new RedPacket(id);
    redPacket.creator = event.transaction.from;
    redPacket.totalAmount = event.params.amount.plus(event.params.remainingAmount);
    redPacket.packetCount = 0;
    redPacket.claimedCount = 0;
    redPacket.createdAt = event.block.timestamp;
    redPacket.isEmpty = false;
    redPacket.remainingAmount = event.params.remainingAmount;
  }

  redPacket.remainingAmount = event.params.remainingAmount;
  redPacket.claimedCount = redPacket.claimedCount + 1;
  redPacket.isEmpty = redPacket.remainingAmount.equals(BigInt.zero());
  redPacket.save();

  const claimId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  const claim = new Claim(claimId);
  claim.redPacket = redPacket.id;
  claim.claimer = event.params.claimer;
  const user = getOrCreateUser(event.params.claimer);
  claim.claimerUser = user.id;
  claim.amount = event.params.amount;
  claim.timestamp = event.block.timestamp;
  claim.txHash = event.transaction.hash;
  claim.save();

  user.totalClaimed = user.totalClaimed.plus(event.params.amount);
  user.claimCount = user.claimCount + 1;
  user.save();
}

export function handleRedPacketEmpty(event: RedPacketEmptyEvent): void {
  const id = event.params.id.toString();
  const redPacket = RedPacket.load(id);
  if (redPacket === null) {
    return;
  }
  redPacket.isEmpty = true;
  redPacket.remainingAmount = BigInt.zero();
  redPacket.save();
}

export function handleAlreadyClaimed(event: AlreadyClaimedEvent): void {
  getOrCreateUser(event.params.claimer).save();
}
