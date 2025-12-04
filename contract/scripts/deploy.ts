import { mkdirSync, existsSync, writeFileSync } from "fs";
import { resolve } from "path";
import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying RedPacket with account: ${deployer.address}`);

  const RedPacket = await ethers.getContractFactory("RedPacket");
  const contract = await RedPacket.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`RedPacket deployed to ${address}`);

  const deploymentsDir = resolve(__dirname, "..", "deployments");
  if (!existsSync(deploymentsDir)) {
    mkdirSync(deploymentsDir, { recursive: true });
  }

  const outputPath = resolve(deploymentsDir, `${network.name}.json`);
  const payload = {
    address,
    network: network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  writeFileSync(outputPath, JSON.stringify(payload, null, 2));
  console.log(`Deployment info written to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
