export interface YouTuber {
  id: number;
  name: string;
  avatarUrl: string;
  subscribers: string;
  views: string;
  avgWatchTime: string;
  growthRate: string;
  category: string;
  // Token-related fields
  hasToken?: boolean;
  tokenAddress?: string;
  tokenSymbol?: string;
  currentPrice?: string;
  marketCap?: string;
  holders?: number;
}

// Smart Contract Types
export interface CreatorTokenParams {
  creator: string;
  name: string;
  symbol: string;
  basePrice: string; // In USDC, will be scaled to 1e18
  k: string; // Slope coefficient, will be scaled to 1e18
  initialSupplyLimit: string; // In tokens (18 decimals)
  minTokensForAccess: string; // In tokens (18 decimals)
  creatorBuyFeeBps: number;
  creatorSellFeeBps: number;
  maxSellPercentBps: number;
  sellWindowSeconds: number;
  sellWindowThresholdBps: number;
}

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  creator: string;
  basePrice: string;
  k: string;
  totalSupply: string;
  totalSupplyLimit: string;
  currentPrice: string;
  reserveBalance: string;
  minTokensForAccess: string;
  circuitBreakerActive: boolean;
  sellsPausedUntil: number;
}

export interface BondingCurveData {
  supply: number[];
  price: number[];
  currentSupply: number;
  currentPrice: number;
  basePrice: number;
  k: number;
}

export interface TransactionQuote {
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  platformFee: string;
  creatorFee: string;
  totalFees: string;
  netAmount: string;
  estimatedGas: string;
}

export interface CircuitBreakerStatus {
  isActive: boolean;
  totalSellsInWindow: string;
  threshold: string;
  windowEndTime: number;
  pausedUntil: number;
}

export interface VestingInfo {
  totalAccrued: string;
  withdrawn: string;
  vested: string;
  unvested: string;
  nextVestDate: number;
  vestingRate: string; // Per day
}

export interface MilestoneInfo {
  id: number;
  metric: string; // "subscribers" | "views" | "videos"
  threshold: number;
  currentValue: number;
  verified: boolean;
  verifiedAt?: number;
  supplyIncrease: string;
  status: "pending" | "achieved" | "verified" | "rejected";
}

export interface AccessInfo {
  hasAccess: boolean;
  userBalance: string;
  minimumRequired: string;
  hasOverride: boolean;
  overrideValue?: boolean;
}
