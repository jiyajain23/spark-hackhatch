#!/usr/bin/env node
/**
 * Deploy the FIXED CreatorToken implementation
 * This version uses upgradeable OpenZeppelin contracts
 */

const hre = require("hardhat");
const fs = require('fs');
const path = require('path');
const dotenv = require("dotenv");

dotenv.config();

async function main() {
  console.log("🚀 Deploying FIXED CreatorToken Implementation...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance < hre.ethers.parseEther("0.005")) {
    console.error("❌ Insufficient balance. Need at least 0.005 ETH");
    process.exit(1);
  }

  // Get the BondingCurveAMM library address from .env
  const bondingCurveLibAddress = process.env.BONDING_CURVE_AMM_ADDRESS;
  if (!bondingCurveLibAddress) {
    console.error("❌ BONDING_CURVE_AMM_ADDRESS not found in .env");
    process.exit(1);
  }

  console.log("Using BondingCurveAMM Library at:", bondingCurveLibAddress, "\n");

  // Deploy the NEW CreatorToken implementation
  console.log("📦 Deploying CreatorToken Implementation (Upgradeable version)...");
  const CreatorToken = await hre.ethers.getContractFactory("CreatorToken", {
    libraries: {
      BondingCurveAMM: bondingCurveLibAddress,
    },
  });

  const creatorTokenImpl = await CreatorToken.deploy();
  await creatorTokenImpl.waitForDeployment();
  const newImplAddress = await creatorTokenImpl.getAddress();
  
  console.log("✅ NEW CreatorToken Implementation deployed to:", newImplAddress);
  console.log("\n🎉 Deployment successful!\n");

  // Update .env file
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update or add the new implementation address
  if (envContent.includes('NEW_CREATOR_TOKEN_IMPLEMENTATION=')) {
    envContent = envContent.replace(
      /NEW_CREATOR_TOKEN_IMPLEMENTATION=.*/,
      `NEW_CREATOR_TOKEN_IMPLEMENTATION=${newImplAddress}`
    );
  } else {
    envContent += `\nNEW_CREATOR_TOKEN_IMPLEMENTATION=${newImplAddress}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log("✅ Updated .env with NEW_CREATOR_TOKEN_IMPLEMENTATION\n");

  console.log("📝 Next steps:");
  console.log("1. Run: npx hardhat run scripts/update-factory-impl.cjs --network baseSepolia");
  console.log("2. Test token creation");
  console.log("\n💰 Remaining balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
