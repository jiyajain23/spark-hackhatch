# Creator-Tok Smart Contracts 🚀

**Team SPARK** - Building the Future of Creator Economy on Base Chain

## 🎯 Overview

Creator-Tok is a decentralized content ecosystem that allows fans to invest in the success of content creators through tokenization. Built on Base Chain, the platform implements a mathematically sound bonding curve system that ties token value directly to creator performance through verifiable milestones.

###Key Features

- **Linear Bonding Curve AMM**: Price = basePrice + k × supply
- **Proof-of-Performance**: Supply expansion only through verified milestones
- **Anti-Dump Protection**: 15% max sell per transaction + circuit breakers
- **30-Day Vesting**: Creator earnings vest linearly for long-term alignment
- **Gasless Transactions**: Meta-transactions via EIP-2771 trusted forwarder
- **Token-Gated Access**: Minimum balance requirements for exclusive content

---

## 📦 Contract Architecture

### 6 Core Smart Contracts

```
Creator-Tok Platform
├── BondingCurveAMM.sol         (Library for pricing mathematics)
├── CreatorToken.sol            (ERC-20 with bonding curve)
├── CreatorTokenFactory.sol     (EIP-1167 minimal proxy factory)
├── PlatformTreasury.sol        (Fee collection & vesting)
├── AccessController.sol         (Token-gated access control)
└── MetaTransactionForwarder.sol (EIP-2771 gasless transactions)
```

### Contract Interactions

```
User
  │
  ├─> MetaTransactionForwarder (optional, for gasless)
  │         │
  │         ▼
  ├─> CreatorTokenFactory.createCreatorToken()
  │         │
  │         ├─> Deploy CreatorToken (Clone)
  │         └─> Grant roles to Treasury
  │
  ├─> CreatorToken.buyWithUSDC()
  │         │
  │         ├─> BondingCurveAMM.tokensForBuy()
  │         ├─> USDC transfer from user
  │         ├─> PlatformTreasury.depositFees()
  │         └─> Mint tokens to user
  │
  ├─> CreatorToken.sellToUSDC()
  │         │
  │         ├─> Check circuit breaker
  │         ├─> BondingCurveAMM.usdcForSell()
  │         ├─> Burn tokens
  │         ├─> PlatformTreasury.depositFees()
  │         └─> USDC transfer to user
  │
  └─> AccessController.hasAccess()
            │
            └─> Check token balance >= minimum
```

---

## 🔧 Installation & Setup

### Prerequisites

- Node.js v18+ and npm/yarn
- Hardhat
- An Ethereum wallet with funds on Base (testnet or mainnet)

### 1. Install Dependencies

```bash
# Navigate to project directory
cd project

# Install Hardhat dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @typechain/hardhat

# Install OpenZeppelin contracts
npm install @openzeppelin/contracts

# Or use the provided package-hardhat.json
cp package-hardhat.json package.json
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values:
# - PRIVATE_KEY: Your deployer wallet private key
# - BASE_GOERLI_RPC_URL or BASE_RPC_URL
# - BASESCAN_API_KEY (for verification)
```

### 3. Compile Contracts

```bash
npx hardhat compile
```

This generates:
- Artifacts in `artifacts/`
- TypeChain types in `typechain-types/`

### 4. Run Tests

```bash
# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run coverage
npx hardhat coverage
```

### 5. Deploy to Base

```bash
# Deploy to local Hardhat network
npx hardhat run scripts/deploy.ts --network hardhat

# Deploy to Base Goerli testnet
npx hardhat run scripts/deploy.ts --network baseGoerli

# Deploy to Base mainnet
npx hardhat run scripts/deploy.ts --network base
```

### 6. Verify Contracts (Optional)

```bash
npx hardhat verify --network baseGoerli <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## 📐 Bonding Curve Mathematics

### Linear Price Formula

```
P(x) = basePrice + k × x

Where:
- P(x) = Price at supply x
- basePrice = Minimum price (scaled to 1e18)
- k = Slope coefficient (scaled to 1e18)
- x = Current total supply
```

### Buy Calculation

To mint Δ tokens starting from supply S:

```
Cost = ∫[S to S+Δ] (basePrice + k×x) dx
     = basePrice × Δ + k × S × Δ + k × (Δ²)/2
```

Solving for Δ given cost (quadratic formula):

```
(k/2) × Δ² + (k×S + basePrice) × Δ - cost = 0

Δ = [√(b² + 4ac) - b] / 2a
```

### Sell Calculation

Refund for burning Δ tokens:

```
Refund = basePrice × Δ + k × S × Δ - k × (Δ²)/2
```

### Example Parameters

```javascript
basePrice = 1e18;           // 1 USDC (scaled)
k = 1e15;                   // 0.001 USDC per token (scaled)
initialSupply = 0;

// At supply = 0:
Price = 1.000 USDC

// At supply = 1,000 tokens:
Price = 1.000 + 0.001 × 1,000 = 2.000 USDC

// At supply = 10,000 tokens:
Price = 1.000 + 0.001 × 10,000 = 11.000 USDC
```

---

## 💰 Tokenomics

### Fee Structure

| Action | Platform Fee | Creator Fee | Total |
|--------|-------------|-------------|-------|
| Buy    | 1%          | 3%          | 4%    |
| Sell   | 1%          | 3%          | 4%    |

### Fee Distribution Flow

```
Buy/Sell Transaction
      │
      ├─> 1% → PlatformTreasury (platformBalance)
      │        └─> Instantly withdrawable by admins
      │
      └─> 3% → PlatformTreasury (creatorBalances)
               └─> 30-day linear vesting for creator
```

### Vesting Schedule

Creator fees vest linearly over 30 days:

```
Vested Amount = (Total Accrued × Time Elapsed) / 30 days

Example:
- Creator earns 1000 USDC on Day 0
- After 10 days: 333.33 USDC vested
- After 20 days: 666.67 USDC vested
- After 30 days: 1000 USDC vested
```

---

## 🛡️ Anti-Dump Mechanisms

### 1. Per-Transaction Sell Limit

**Rule**: Maximum 15% of holder's balance per transaction

```solidity
maxSellAmount = (userBalance × 1500) / 10000; // 15%
require(sellAmount <= maxSellAmount, "SellTooLarge");
```

**Example**:
- User holds 1,000 tokens
- Max single sell: 150 tokens
- To sell 300 tokens, user must make 2 transactions

### 2. Global Circuit Breaker

**Rule**: If sells exceed 5% of circulating supply in 10 minutes, pause sells for 60 minutes

```solidity
sellWindowThreshold = (circulatingSupply × 500) / 10000; // 5%
if (totalSellsInWindow >= sellWindowThreshold) {
    sellsPausedUntil = block.timestamp + 1 hours;
}
```

**Example**:
- Circulating supply: 100,000 tokens
- Threshold: 5,000 tokens in 10 minutes
- If exceeded: All sells paused for 60 minutes

---

## 🎯 Milestone-Based Supply Expansion

### Oracle Verification Flow

```
1. Creator achieves milestone (e.g., 100K subscribers)
   │
   ▼
2. Off-chain Oracle monitors YouTube API
   │
   ▼
3. Oracle verifies milestone on-chain
   │
   ▼
4. Oracle calls CreatorToken.unlockSupplyOnMilestone()
   │
   ▼
5. totalSupplyLimit increases
   │
   ▼
6. New tokens can now be minted via bonding curve
```

### Example Milestones

| Milestone | Supply Increase | New Limit |
|-----------|----------------|-----------|
| 10K Subs  | +100K tokens   | 100K      |
| 50K Subs  | +400K tokens   | 500K      |
| 100K Subs | +500K tokens   | 1M        |
| 500K Subs | +4M tokens     | 5M        |
| 1M Subs   | +5M tokens     | 10M       |

---

## 🔐 Security Features

### Access Control Roles

```solidity
DEFAULT_ADMIN_ROLE       // Multisig for critical operations
PLATFORM_ADMIN_ROLE      // Platform operations (pause, fees)
CREATOR_ROLE             // Creator-specific controls
ORACLE_ROLE              // Milestone verification
RELAYER_ROLE             // Meta-transaction execution
CREATOR_TOKEN_ROLE       // Token contracts (for treasury deposits)
```

### Best Practices Implemented

✅ **ReentrancyGuard** on all state-changing functions
✅ **SafeERC20** for all token transfers
✅ **Pausable** for emergency stops
✅ **Custom errors** for gas efficiency
✅ **EIP-1167 minimal proxies** for cheap deployment
✅ **EIP-2771 meta-transactions** for gasless UX
✅ **EIP-712 typed signatures** for replay protection
✅ **Fixed-point arithmetic** for precision
✅ **Comprehensive events** for off-chain tracking

---

## ⛽ Gas Estimates

| Operation | Estimated Gas | USD Cost @ 1 gwei |
|-----------|--------------|-------------------|
| Deploy Factory | ~2,500,000 | ~$5.00 |
| Deploy Token (via factory) | ~350,000 | ~$0.70 |
| Buy Tokens | ~180,000 | ~$0.36 |
| Sell Tokens | ~200,000 | ~$0.40 |
| Unlock Supply | ~80,000 | ~$0.16 |
| Withdraw Fees | ~90,000 | ~$0.18 |

*Estimates based on Base mainnet. Actual costs vary with gas prices.*

---

## 🧪 Testing

### Test Coverage

```bash
npx hardhat coverage
```

Our test suite covers:

- ✅ Bonding curve math accuracy (quadratic solver, integrals)
- ✅ Buy/sell flows with fee calculations
- ✅ Anti-dump enforcement (15% limit, circuit breaker)
- ✅ Vesting schedule correctness
- ✅ Oracle milestone unlocking
- ✅ Access control (token gating)
- ✅ Meta-transaction signatures
- ✅ Reentrancy protection
- ✅ Edge cases (zero amounts, overflow, underflow)

---

## 🌐 Frontend Integration

### 1. Generate TypeChain Types

```bash
npx hardhat typechain
```

Types are generated in `typechain-types/` directory.

### 2. Import Contract ABIs

```typescript
import CreatorTokenFactoryABI from './artifacts/contracts/CreatorTokenFactory.sol/CreatorTokenFactory.json';
import CreatorTokenABI from './artifacts/contracts/CreatorToken.sol/CreatorToken.json';
import { ethers } from 'ethers';

// Connect to contract
const provider = new ethers.BrowserProvider(window.ethereum);
const factory = new ethers.Contract(
  FACTORY_ADDRESS,
  CreatorTokenFactoryABI.abi,
  provider
);
```

### 3. Key Frontend Functions

#### Create Token

```typescript
async function createCreatorToken(params: CreateParams) {
  const signer = await provider.getSigner();
  const factoryWithSigner = factory.connect(signer);
  
  const tx = await factoryWithSigner.createCreatorToken({
    creator: params.creator,
    name: params.name,
    symbol: params.symbol,
    basePrice: ethers.parseEther(params.basePrice.toString()),
    k: ethers.parseEther(params.k.toString()),
    initialSupplyLimit: ethers.parseEther(params.supplyLimit.toString()),
    minTokensForAccess: ethers.parseEther("100"),
    creatorBuyFeeBps: 300,
    creatorSellFeeBps: 300,
    maxSellPercentBps: 1500,
    sellWindowSeconds: 600,
    sellWindowThresholdBps: 500,
  });
  
  await tx.wait();
}
```

#### Buy Tokens

```typescript
async function buyTokens(tokenAddress: string, usdcAmount: string) {
  const token = new ethers.Contract(tokenAddress, CreatorTokenABI.abi, signer);
  const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
  
  // Approve USDC
  const amount = ethers.parseUnits(usdcAmount, 6);
  await usdc.approve(tokenAddress, amount);
  
  // Get quote
  const quote = await token.getBuyQuote(amount);
  const minTokens = quote * 95n / 100n; // 5% slippage
  
  // Buy
  const tx = await token.buyWithUSDC(amount, minTokens, userAddress);
  await tx.wait();
}
```

#### Sell Tokens

```typescript
async function sellTokens(tokenAddress: string, tokenAmount: string) {
  const token = new ethers.Contract(tokenAddress, CreatorTokenABI.abi, signer);
  
  // Get quote
  const amount = ethers.parseEther(tokenAmount);
  const quote = await token.getSellQuote(amount);
  const minUsdc = quote * 95n / 100n; // 5% slippage
  
  // Sell
  const tx = await token.sellToUSDC(amount, minUsdc, userAddress);
  await tx.wait();
}
```

### 4. Real-Time Price Updates

```typescript
async function getCurrentPrice(tokenAddress: string) {
  const token = new ethers.Contract(tokenAddress, CreatorTokenABI.abi, provider);
  const price = await token.getCurrentPrice();
  return ethers.formatUnits(price, 6); // USDC has 6 decimals
}

// Listen for price changes
token.on("Buy", async (buyer, usdcIn, tokensOut, priceAfter) => {
  console.log("New price:", ethers.formatUnits(priceAfter, 6));
  // Update UI
});
```

---

## 📊 Deployment Addresses

### Base Goerli Testnet

```
USDC Token: 0xF175520C52418dfE19C8098071a252da48Cd1C19
PlatformTreasury: <deployed_address>
CreatorToken Implementation: <deployed_address>
MetaTransactionForwarder: <deployed_address>
CreatorTokenFactory: <deployed_address>
AccessController: <deployed_address>
```

### Base Mainnet

```
USDC Token: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
PlatformTreasury: <deployed_address>
CreatorToken Implementation: <deployed_address>
MetaTransactionForwarder: <deployed_address>
CreatorTokenFactory: <deployed_address>
AccessController: <deployed_address>
```

---

## 🔍 Audit Recommendations

### Recommended Audit Firms

1. **OpenZeppelin** - Leaders in smart contract security
2. **Trail of Bits** - Comprehensive security audits
3. **ConsenSys Diligence** - Ethereum-focused audits
4. **Quantstamp** - Automated + manual audits

### Key Areas for Audit Focus

1. **Bonding Curve Math**: Verify quadratic solver, integral calculations, rounding
2. **Fee Distribution**: Ensure fees are correctly forwarded and vested
3. **Circuit Breaker**: Test threshold calculations and pause logic
4. **Access Control**: Verify role-based permissions
5. **Reentrancy**: Confirm all entry points are protected
6. **Overflow/Underflow**: Test edge cases with max values
7. **Meta-Transactions**: Verify signature validation and replay protection

---

## 🚀 Next Steps

### Phase 1: MVP Launch (Complete)
- ✅ Core smart contracts
- ✅ Bonding curve AMM
- ✅ Factory pattern deployment
- ✅ Basic tests

### Phase 2: Integration (In Progress)
- 🔄 Frontend integration
- 🔄 Meta-transaction relayer service
- 🔄 Oracle service for milestones
- 🔄 Comprehensive testing

### Phase 3: Production
- ⏳ Professional audit
- ⏳ Base mainnet deployment
- ⏳ Multisig setup
- ⏳ Documentation & tutorials

### Phase 4: Scaling
- ⏳ Cross-chain bridge
- ⏳ Governance token
- ⏳ Advanced analytics
- ⏳ Mobile app

---

## 📚 Additional Resources

- **Base Chain Docs**: https://docs.base.org
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts
- **Hardhat Docs**: https://hardhat.org/docs
- **EIP-2771**: https://eips.ethereum.org/EIPS/eip-2771
- **EIP-1167**: https://eips.ethereum.org/EIPS/eip-1167

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 👥 Team SPARK

Building the future of creator economy, one token at a time.

**Contact**: support@creatortok.io

---

**⚠️ Disclaimer**: This is experimental software. Smart contracts hold real value. Always conduct thorough testing and professional audits before mainnet deployment. Use at your own risk.
