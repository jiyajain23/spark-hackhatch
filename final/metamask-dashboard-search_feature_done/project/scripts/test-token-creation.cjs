#!/usr/bin/env node
const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing Token Creation\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);

  const factoryAddress = "0x4a27c5b2e55C55AEf40D288be0eAcAa9180CAfcE";
  const factory = await hre.ethers.getContractAt("CreatorTokenFactory", factoryAddress);

  console.log("\n📝 Preparing createCreatorToken parameters...");
  
  const params = {
    creator: deployer.address,
    name: "Test Creator Token",
    symbol: "TCT",
    basePrice: hre.ethers.parseEther("0.0001"),  // 0.0001 ETH
    k: hre.ethers.parseEther("0.01"),
    initialSupplyLimit: 1000000,
    minTokensForAccess: 100,
    creatorBuyFeeBps: 300,  // 3%
    creatorSellFeeBps: 300, // 3%
    maxSellPercentBps: 1000, // 10%
    sellWindowSeconds: 3600,
    sellWindowThresholdBps: 500 // 5%
  };

  console.log("Parameters:");
  console.log("  Creator:", params.creator);
  console.log("  Name:", params.name);
  console.log("  Symbol:", params.symbol);
  console.log("  Base Price:", hre.ethers.formatEther(params.basePrice), "ETH");
  console.log("  K:", hre.ethers.formatEther(params.k));
  console.log("  Initial Supply Limit:", params.initialSupplyLimit);
  
  console.log("\n🚀 Calling factory.createCreatorToken...");
  
  try {
    // Try to estimate gas first
    console.log("Estimating gas...");
    const gasEstimate = await factory.createCreatorToken.estimateGas(params);
    console.log("Gas estimate:", gasEstimate.toString());
    
    console.log("\nSending transaction...");
    const tx = await factory.createCreatorToken(params);
    console.log("Transaction hash:", tx.hash);
    
    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Find the token address from events
    const event = receipt.logs.find(log => {
      try {
        const parsed = factory.interface.parseLog(log);
        return parsed.name === "CreatorTokenCreated";
      } catch (e) {
        return false;
      }
    });
    
    if (event) {
      const parsed = factory.interface.parseLog(event);
      console.log("\n🎉 Token created successfully!");
      console.log("Token address:", parsed.args.token);
      console.log("Creator:", parsed.args.creator);
      console.log("Name:", parsed.args.name);
      console.log("Symbol:", parsed.args.symbol);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    
    if (error.data) {
      console.log("\nError data:", error.data);
    }
    
    // Try to decode the revert reason
    if (error.reason) {
      console.log("Revert reason:", error.reason);
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
