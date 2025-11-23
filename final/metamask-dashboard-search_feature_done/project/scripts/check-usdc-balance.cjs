const { ethers } = require("ethers");

// Base Sepolia Configuration
const RPC_URL = "https://sepolia.base.org";
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// Replace with your wallet address
const YOUR_WALLET = process.argv[2] || "YOUR_WALLET_ADDRESS_HERE";

// Minimal ERC20 ABI - just need balanceOf and decimals
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

async function checkUSDCBalance() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║          USDC Balance Checker - Base Sepolia          ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  if (YOUR_WALLET === "YOUR_WALLET_ADDRESS_HERE") {
    console.log("❌ Please provide your wallet address!");
    console.log("\nUsage:");
    console.log("  node scripts/check-usdc-balance.cjs YOUR_WALLET_ADDRESS");
    console.log("\nExample:");
    console.log("  node scripts/check-usdc-balance.cjs 0x1234567890123456789012345678901234567890");
    process.exit(1);
  }

  try {
    console.log("🔗 Connecting to Base Sepolia...");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    console.log("📄 Loading USDC contract...");
    const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
    
    console.log(`👤 Checking balance for: ${YOUR_WALLET}\n`);
    
    // Get balance
    const balance = await usdcContract.balanceOf(YOUR_WALLET);
    const decimals = await usdcContract.decimals();
    const symbol = await usdcContract.symbol();
    
    // Format balance
    const formattedBalance = ethers.formatUnits(balance, decimals);
    
    console.log("═══════════════════════════════════════════════════════");
    console.log(`💰 ${symbol} Balance: ${formattedBalance} ${symbol}`);
    console.log("═══════════════════════════════════════════════════════\n");
    
    if (parseFloat(formattedBalance) === 0) {
      console.log("⚠️  You have 0 USDC!");
      console.log("\n🎁 Get free testnet USDC:");
      console.log("   1. Visit: https://faucet.circle.com/");
      console.log("   2. Connect MetaMask");
      console.log("   3. Select 'Base Sepolia'");
      console.log("   4. Click 'Get Test USDC'");
      console.log("   5. Wait ~30 seconds");
      console.log("   6. Run this script again to verify!\n");
    } else if (parseFloat(formattedBalance) < 1) {
      console.log("⚠️  Low USDC balance!");
      console.log("   Consider getting more from: https://faucet.circle.com/\n");
    } else {
      console.log("✅ You have enough USDC to test token purchases!");
      console.log(`   You can buy tokens worth up to ${formattedBalance} USDC\n`);
    }
    
    console.log("📊 USDC Contract Address:");
    console.log(`   ${USDC_ADDRESS}\n`);
    
  } catch (error) {
    console.error("\n❌ Error checking balance:");
    console.error(error.message);
    console.log("\nTroubleshooting:");
    console.log("  • Make sure the wallet address is valid");
    console.log("  • Check your internet connection");
    console.log("  • Verify Base Sepolia RPC is accessible\n");
  }
}

checkUSDCBalance();
