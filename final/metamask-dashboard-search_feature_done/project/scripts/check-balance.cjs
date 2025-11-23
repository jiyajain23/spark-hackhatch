// Script to check your wallet balance on Base Goerli
const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey || privateKey === "your_private_key_here") {
    console.log("\n❌ ERROR: PRIVATE_KEY not set in .env file!");
    console.log("Run: node scripts/generate-wallet.cjs to generate a new wallet\n");
    process.exit(1);
  }
  
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const address = wallet.address;
  const balance = await provider.getBalance(address);
  
  console.log("\n=================================");
  console.log("Wallet Address:", address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log("=================================\n");
  
  if (balance < ethers.parseEther("0.05")) {
    console.log("⚠️  WARNING: Low balance!");
    console.log("You need at least 0.05 ETH to deploy contracts.");
    console.log("Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet");
    console.log("\nYour wallet address to request ETH for:");
    console.log(address);
  } else {
    console.log("✅ You have enough ETH to deploy!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
