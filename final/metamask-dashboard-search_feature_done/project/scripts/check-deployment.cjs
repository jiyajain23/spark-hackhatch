// Script to verify contract deployment
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("\n=================================");
  console.log("📋 CHECKING CONTRACT DEPLOYMENT");
  console.log("=================================\n");
  
  const addresses = {
    "Platform Treasury": process.env.PLATFORM_TREASURY_ADDRESS,
    "Creator Token Implementation": process.env.CREATOR_TOKEN_IMPLEMENTATION_ADDRESS,
    "Creator Token Factory": process.env.CREATOR_TOKEN_FACTORY_ADDRESS,
    "Meta Transaction Forwarder": process.env.META_TRANSACTION_FORWARDER_ADDRESS,
    "Access Controller": process.env.ACCESS_CONTROLLER_ADDRESS
  };
  
  let allDeployed = true;
  
  for (const [name, address] of Object.entries(addresses)) {
    if (!address || address === "") {
      console.log(`❌ ${name}: NOT DEPLOYED`);
      allDeployed = false;
    } else {
      const code = await hre.ethers.provider.getCode(address);
      if (code === "0x") {
        console.log(`❌ ${name}: INVALID ADDRESS (${address})`);
        allDeployed = false;
      } else {
        console.log(`✅ ${name}: ${address}`);
      }
    }
  }
  
  console.log("\n=================================");
  if (allDeployed) {
    console.log("✅ All contracts deployed successfully!");
  } else {
    console.log("⚠️  Some contracts are missing.");
    console.log("Run: npx hardhat run scripts/deploy.ts --network baseGoerli");
  }
  console.log("=================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
