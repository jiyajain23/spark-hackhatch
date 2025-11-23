// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Base Sepolia Testnet (NEW - Goerli is deprecated)
  baseSepolia: {
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    platformTreasury: "0x384401EE4cB249471e25F7c020D49F1013AB5572",
    creatorTokenImpl: "0xb4B83eD4088f3ed9c506b0c88ba1C7133593b687",
    factory: "0x4a27c5b2e55C55AEf40D288be0eAcAa9180CAfcE",
    accessController: "0x5e0A68332d9044931BE327BEebe6d274af4D315c",
    forwarder: "0xe7aeDbF56850eA0987a9999C3898E503748D2582",
    chainId: 84532,
  },
  // Base Mainnet
  base: {
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    platformTreasury: import.meta.env.VITE_TREASURY_ADDRESS || "",
    creatorTokenImpl: import.meta.env.VITE_TOKEN_IMPL_ADDRESS || "",
    factory: import.meta.env.VITE_FACTORY_ADDRESS || "",
    accessController: import.meta.env.VITE_ACCESS_CONTROLLER_ADDRESS || "",
    forwarder: import.meta.env.VITE_FORWARDER_ADDRESS || "",
    chainId: 8453,
  },
  // Local Hardhat
  localhost: {
    usdc: "", // Will be deployed
    platformTreasury: "",
    creatorTokenImpl: "",
    factory: "",
    accessController: "",
    forwarder: "",
    chainId: 31337,
  },
};

export const NETWORK_NAMES = {
  84532: "Base Sepolia",
  8453: "Base",
  31337: "Localhost",
  43113: "Avalanche Fuji (Unsupported)",
  1: "Ethereum Mainnet (Unsupported)",
  5: "Goerli (Unsupported)",
};

export function getContractAddresses(chainId: number) {
  switch (chainId) {
    case 84532:
      return CONTRACT_ADDRESSES.baseSepolia;
    case 8453:
      return CONTRACT_ADDRESSES.base;
    case 31337:
      return CONTRACT_ADDRESSES.localhost;
    default:
      const networkName = NETWORK_NAMES[chainId as keyof typeof NETWORK_NAMES] || `Chain ID ${chainId}`;
      throw new Error(
        `Wrong Network! Please switch to Base Sepolia (Chain ID: 84532). Currently on: ${networkName}`
      );
  }
}

// Default configuration values
export const DEFAULT_CONFIG = {
  platformFeeBps: 100, // 1%
  creatorBuyFeeBps: 300, // 3%
  creatorSellFeeBps: 300, // 3%
  maxSellPercentBps: 1500, // 15%
  sellWindowSeconds: 600, // 10 minutes
  sellWindowThresholdBps: 500, // 5%
  minTokensForAccess: "100", // 100 tokens
  vestingPeriodDays: 30,
};

// Scaling constants
export const SCALING = {
  FIXED_1: "1000000000000000000", // 1e18
  USDC_DECIMALS: 6,
  TOKEN_DECIMALS: 18,
};
