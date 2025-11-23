// Script to verify which network you're connected to
const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const privateKey = process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // Get network info
  const network = await provider.getNetwork();
  const balance = await provider.getBalance(wallet.address);
  
  console.log("\n========================================");
  console.log("📍 NETWORK VERIFICATION");
  console.log("========================================");
  console.log("Network Name:", network.name || "Base Sepolia");
  console.log("Chain ID:", network.chainId.toString());
  console.log("RPC URL:", rpcUrl);
  console.log("========================================");
  console.log("Your Wallet:", wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log("========================================\n");
  
  if (network.chainId.toString() === "84532") {
    console.log("✅ CONFIRMED: You are on BASE SEPOLIA TESTNET");
    console.log("✅ This is the Base L2 blockchain (testnet)");
    console.log("✅ This ETH is TEST ETH (no real value)");
    console.log("✅ Safe to deploy and experiment!");
  } else {
    console.log("⚠️  Unexpected Chain ID:", network.chainId.toString());
  }
  
  console.log("\n🔗 View your wallet on Base Sepolia explorer:");
  console.log(`https://sepolia.basescan.org/address/${wallet.address}`);
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
