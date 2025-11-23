#!/usr/bin/env node
/**
 * Update the CreatorTokenFactory to use the new implementation
 */

const hre = require("hardhat");
const dotenv = require("dotenv");

dotenv.config();

async function main() {
  console.log("🔄 Updating CreatorTokenFactory Implementation...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Updating with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  const factoryAddress = process.env.CREATOR_TOKEN_FACTORY_ADDRESS;
  const newImplAddress = process.env.NEW_CREATOR_TOKEN_IMPLEMENTATION;

  if (!factoryAddress || !newImplAddress) {
    console.error("❌ Missing addresses in .env");
    console.error("   CREATOR_TOKEN_FACTORY_ADDRESS:", factoryAddress);
    console.error("   NEW_CREATOR_TOKEN_IMPLEMENTATION:", newImplAddress);
    process.exit(1);
  }

  console.log("Factory address:", factoryAddress);
  console.log("New implementation:", newImplAddress);
  console.log();

  // Get the factory contract
  const factory = await hre.ethers.getContractAt("CreatorTokenFactory", factoryAddress);

  // Check current implementation
  console.log("📋 Current implementation:", await factory.implementation());

  // Update the implementation
  console.log("\n🔄 Calling setImplementation...");
  const tx = await factory.setImplementation(newImplAddress);
  console.log("Transaction hash:", tx.hash);

  console.log("Waiting for confirmation...");
  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed!");
  console.log("Gas used:", receipt.gasUsed.toString());

  // Verify the update
  const updatedImpl = await factory.implementation();
  console.log("\n📋 Updated implementation:", updatedImpl);
  console.log("Match:", updatedImpl.toLowerCase() === newImplAddress.toLowerCase() ? "✅" : "❌");

  console.log("\n🎉 Factory updated successfully!");
  console.log("\n💰 Remaining balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
  
  console.log("\n📝 Next step: Test token creation");
  console.log("   npx hardhat run scripts/test-token-creation.cjs --network baseSepolia");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
