const hre = require("hardhat");
const dotenv = require("dotenv");

dotenv.config();

async function main() {
  console.log("🚀 Starting Creator-Tok deployment to Base chain...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Get USDC address for the network
  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId;
  
  let usdcAddress;
  if (chainId === 84532n) {
    // Base Sepolia
    usdcAddress = process.env.USDC_BASE_SEPOLIA || "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  } else if (chainId === 8453n) {
    // Base Mainnet
    usdcAddress = process.env.USDC_BASE_MAINNET || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  } else {
    // Local/Hardhat - deploy mock USDC
    console.log("Deploying mock USDC for local testing...");
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const mockUsdc = await MockERC20.deploy("USD Coin", "USDC", 6);
    await mockUsdc.waitForDeployment();
    usdcAddress = await mockUsdc.getAddress();
    console.log("Mock USDC deployed to:", usdcAddress, "\n");
  }

  console.log("Using USDC at:", usdcAddress, "\n");

  // 1. Deploy PlatformTreasury
  console.log("📦 Deploying PlatformTreasury...");
  const PlatformTreasury = await hre.ethers.getContractFactory("PlatformTreasury");
  const treasury = await PlatformTreasury.deploy(
    usdcAddress,
    deployer.address // Fee recipient (can be changed to multisig later)
  );
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("✅ PlatformTreasury deployed to:", treasuryAddress, "\n");

  // 2. Deploy BondingCurveAMM Library
  console.log("📦 Deploying BondingCurveAMM Library...");
  const BondingCurveAMM = await hre.ethers.getContractFactory("BondingCurveAMM");
  const bondingCurveLib = await BondingCurveAMM.deploy();
  await bondingCurveLib.waitForDeployment();
  const bondingCurveLibAddress = await bondingCurveLib.getAddress();
  console.log("✅ BondingCurveAMM Library deployed to:", bondingCurveLibAddress, "\n");

  // 3. Deploy CreatorToken Implementation (with library linked)
  console.log("📦 Deploying CreatorToken Implementation...");
  const CreatorToken = await hre.ethers.getContractFactory("CreatorToken", {
    libraries: {
      BondingCurveAMM: bondingCurveLibAddress,
    },
  });
  const creatorTokenImpl = await CreatorToken.deploy(
    "Creator Token", // Dummy name
    "CRT",          // Dummy symbol
    deployer.address, // Dummy creator
    usdcAddress,
    treasuryAddress
  );
  await creatorTokenImpl.waitForDeployment();
  const implAddress = await creatorTokenImpl.getAddress();
  console.log("✅ CreatorToken Implementation deployed to:", implAddress, "\n");

  // 4. Deploy MetaTransactionForwarder
  console.log("📦 Deploying MetaTransactionForwarder...");
  const MetaTransactionForwarder = await hre.ethers.getContractFactory("MetaTransactionForwarder");
  const forwarder = await MetaTransactionForwarder.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddress = await forwarder.getAddress();
  console.log("✅ MetaTransactionForwarder deployed to:", forwarderAddress, "\n");

  // 5. Deploy CreatorTokenFactory
  console.log("📦 Deploying CreatorTokenFactory...");
  const platformFeeBps = process.env.PLATFORM_FEE_BPS || "100"; // 1%
  const CreatorTokenFactory = await hre.ethers.getContractFactory("CreatorTokenFactory");
  const factory = await CreatorTokenFactory.deploy(
    implAddress,
    treasuryAddress,
    usdcAddress,
    forwarderAddress,
    platformFeeBps
  );
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ CreatorTokenFactory deployed to:", factoryAddress, "\n");

  // 6. Deploy AccessController
  console.log("📦 Deploying AccessController...");
  const AccessController = await hre.ethers.getContractFactory("AccessController");
  const accessController = await AccessController.deploy(forwarderAddress);
  await accessController.waitForDeployment();
  const accessControllerAddress = await accessController.getAddress();
  console.log("✅ AccessController deployed to:", accessControllerAddress, "\n");

  // 7. Setup roles
  console.log("⚙️  Setting up roles...");
  
  // Grant CREATOR_TOKEN_ROLE to factory in treasury
  const CREATOR_TOKEN_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("CREATOR_TOKEN_ROLE"));
  await treasury.grantRole(CREATOR_TOKEN_ROLE, factoryAddress);
  console.log("✅ Granted CREATOR_TOKEN_ROLE to factory in treasury\n");

  // Summary
  console.log("=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📝 Contract Addresses:");
  console.log("├─ USDC Token:", usdcAddress);
  console.log("├─ BondingCurveAMM Library:", bondingCurveLibAddress);
  console.log("├─ PlatformTreasury:", treasuryAddress);
  console.log("├─ CreatorToken Implementation:", implAddress);
  console.log("├─ MetaTransactionForwarder:", forwarderAddress);
  console.log("├─ CreatorTokenFactory:", factoryAddress);
  console.log("└─ AccessController:", accessControllerAddress);
  console.log("\n💾 Save these addresses to your .env file:");
  console.log(`PLATFORM_TREASURY_ADDRESS=${treasuryAddress}`);
  console.log(`CREATOR_TOKEN_IMPLEMENTATION_ADDRESS=${implAddress}`);
  console.log(`META_TRANSACTION_FORWARDER_ADDRESS=${forwarderAddress}`);
  console.log(`CREATOR_TOKEN_FACTORY_ADDRESS=${factoryAddress}`);
  console.log(`ACCESS_CONTROLLER_ADDRESS=${accessControllerAddress}`);
  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
