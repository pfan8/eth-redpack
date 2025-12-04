// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RedPacket is ReentrancyGuard {
    struct RedPacketData {
        address creator;
        uint256 totalAmount;
        uint256 remainingAmount;
        uint256 packetCount;
        uint256 claimedCount;
        uint256 createdAt;
    }

    uint256 private _nextRedPacketId = 1;
    mapping(uint256 => RedPacketData) private _redPackets;
    mapping(uint256 => mapping(address => bool)) private _claimed;

    event RedPacketCreated(
        uint256 indexed id,
        address indexed creator,
        uint256 totalAmount,
        uint256 packetCount
    );

    event RedPacketClaimed(
        uint256 indexed id,
        address indexed claimer,
        uint256 amount,
        uint256 remainingAmount
    );

    event RedPacketEmpty(uint256 indexed id);

    event AlreadyClaimed(uint256 indexed id, address indexed claimer);

    error InvalidParameters();
    error RedPacketNotFound();

    function createRedPacket(uint256 totalAmount, uint256 packetCount) external payable nonReentrant returns (uint256) {
        if (packetCount == 0 || totalAmount == 0 || msg.value != totalAmount) {
            revert InvalidParameters();
        }

        uint256 redPacketId = _nextRedPacketId++;
        RedPacketData storage packet = _redPackets[redPacketId];
        packet.creator = msg.sender;
        packet.totalAmount = totalAmount;
        packet.remainingAmount = totalAmount;
        packet.packetCount = packetCount;
        packet.claimedCount = 0;
        packet.createdAt = block.timestamp;

        emit RedPacketCreated(redPacketId, msg.sender, totalAmount, packetCount);
        return redPacketId;
    }

    function claimRedPacket(uint256 redPacketId) external nonReentrant {
        RedPacketData storage packet = _redPackets[redPacketId];
        if (packet.creator == address(0)) {
            revert RedPacketNotFound();
        }

        if (_claimed[redPacketId][msg.sender]) {
            emit AlreadyClaimed(redPacketId, msg.sender);
            return;
        }

        if (packet.claimedCount >= packet.packetCount || packet.remainingAmount == 0) {
            emit RedPacketEmpty(redPacketId);
            return;
        }

        uint256 amount = _randomAmount(redPacketId, msg.sender, packet);
        packet.remainingAmount -= amount;
        packet.claimedCount += 1;
        _claimed[redPacketId][msg.sender] = true;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "TRANSFER_FAILED");

        emit RedPacketClaimed(redPacketId, msg.sender, amount, packet.remainingAmount);

        if (packet.claimedCount >= packet.packetCount || packet.remainingAmount == 0) {
            emit RedPacketEmpty(redPacketId);
        }
    }

    function hasClaimed(uint256 redPacketId, address account) external view returns (bool) {
        return _claimed[redPacketId][account];
    }

    function getRedPacket(uint256 redPacketId) external view returns (RedPacketData memory) {
        RedPacketData memory packet = _redPackets[redPacketId];
        if (packet.creator == address(0)) {
            revert RedPacketNotFound();
        }
        return packet;
    }

    function nextRedPacketId() external view returns (uint256) {
        return _nextRedPacketId;
    }

    function _randomAmount(
        uint256 redPacketId,
        address claimer,
        RedPacketData storage packet
    ) private view returns (uint256) {
        uint256 remainingPackets = packet.packetCount - packet.claimedCount;
        if (remainingPackets == 1) {
            return packet.remainingAmount;
        }

        uint256 minAmount = 1 wei;
        uint256 maxAmount = packet.remainingAmount - (remainingPackets - 1) * minAmount;
        if (maxAmount <= minAmount) {
            return minAmount;
        }

        uint256 randomness = uint256(
            keccak256(
                abi.encodePacked(
                    redPacketId,
                    packet.creator,
                    claimer,
                    packet.claimedCount,
                    block.timestamp,
                    block.prevrandao
                )
            )
        );

        uint256 range = maxAmount - minAmount + 1;
        uint256 amount = (randomness % range) + minAmount;
        if (amount > packet.remainingAmount) {
            amount = packet.remainingAmount;
        }

        return amount;
    }
}
