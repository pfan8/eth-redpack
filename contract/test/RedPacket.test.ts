import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

const ONE_ETH = ethers.parseEther("1");

describe("RedPacket", function () {
  async function deployFixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    const RedPacket = await ethers.getContractFactory("RedPacket");
    const contract = await RedPacket.deploy();
    await contract.waitForDeployment();
    return { contract, owner, user1, user2 };
  }

  describe("createRedPacket", function () {
    it("stores metadata and emits event", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await expect(contract.createRedPacket(ONE_ETH, 3, { value: ONE_ETH }))
        .to.emit(contract, "RedPacketCreated")
        .withArgs(1, owner.address, ONE_ETH, 3);

      const packet = await contract.getRedPacket(1);
      expect(packet.creator).to.equal(owner.address);
      expect(packet.remainingAmount).to.equal(ONE_ETH);
      expect(packet.packetCount).to.equal(3);
      expect(packet.claimedCount).to.equal(0);
    });
  });

  describe("claimRedPacket", function () {
    it("allows unique users to claim once", async function () {
      const { contract, user1, user2 } = await loadFixture(deployFixture);
      await contract.createRedPacket(ONE_ETH, 2, { value: ONE_ETH });

      await expect(contract.connect(user1).claimRedPacket(1))
        .to.emit(contract, "RedPacketClaimed")
        .withArgs(1, user1.address, anyValue, anyValue);

      await expect(contract.connect(user1).claimRedPacket(1))
        .to.emit(contract, "AlreadyClaimed")
        .withArgs(1, user1.address);

      await expect(contract.connect(user2).claimRedPacket(1))
        .to.emit(contract, "RedPacketEmpty");

      const packet = await contract.getRedPacket(1);
      expect(packet.claimedCount).to.equal(2);
      expect(packet.remainingAmount).to.equal(0);
      expect(await contract.hasClaimed(1, user1.address)).to.equal(true);
    });

    it("returns early when packet empty", async function () {
      const { contract, user1, user2 } = await loadFixture(deployFixture);
      await contract.createRedPacket(ONE_ETH, 1, { value: ONE_ETH });

      await contract.connect(user1).claimRedPacket(1);

      await expect(contract.connect(user2).claimRedPacket(1))
        .to.emit(contract, "RedPacketEmpty")
        .withArgs(1);
    });
  });
});
