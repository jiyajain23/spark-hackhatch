// Script to generate a new wallet for testing
const { ethers } = require("ethers");

async function main() {
  const wallet = ethers.Wallet.createRandom();
  
  console.log("\n=================================");
  console.log("🆕 NEW TEST WALLET GENERATED");
  console.log("=================================");
  console.log("\n📍 Address:", wallet.address);
  console.log("\n🔑 Private Key (add to .env):");
  console.log(wallet.privateKey.slice(2)); // Remove 0x prefix
  console.log("\n⚠️  SAVE THIS PRIVATE KEY SECURELY!");
  console.log("=================================\n");
  
  console.log("Next steps:");
  console.log("1. Add this private key to your .env file (without 0x)");
  console.log("2. Get testnet ETH from faucet:");
  console.log("   https://www.coinbase.com/faucets/base-ethereum-goerli-faucet");
  console.log("3. Deploy contracts:");
  console.log("   npx hardhat run scripts/deploy.ts --network baseGoerli\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
