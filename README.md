# 🚀 Creator-Tok Platform

> **Full-Stack Creator Tokenization Platform on Base Chain**

A decentralized platform where YouTubers and content creators can launch their own tokens with automated bonding curve pricing, enabling fans to invest in their favorite creators.

---

## 📁 Project Location

```
/Users/abuzaid/Downloads/metamask-dashboard-search_feature_done/project/
```

---

## ⚡ Quick Start

**Want to run this project? Start here:**

1. **Read the Quick Start Guide** → [`project/QUICK_START.md`](./project/QUICK_START.md)
2. **Follow the detailed instructions** → [`project/HOW_TO_RUN.md`](./project/HOW_TO_RUN.md)
3. **See the visual flow** → [`project/FLOW_DIAGRAM.md`](./project/FLOW_DIAGRAM.md)

**Or run these commands:**

```bash
cd project/
cp .env.example .env
# Add your PRIVATE_KEY to .env
npx hardhat compile
npx hardhat run scripts/deploy.ts --network baseGoerli
npm run dev
# Open http://localhost:5173
```

---

## 🎯 What is This Project?

Creator-Tok is a **tokenization platform** that allows:

- 🎬 **Creators** to launch their own ERC-20 tokens
- 💰 **Fans** to buy/sell creator tokens at dynamic prices
- 📈 **Everyone** to benefit from bonding curve economics
- 🔒 **Token holders** to access exclusive content

---

## 🏗️ Architecture

### Smart Contracts (Blockchain)
- **CreatorTokenFactory** - Deploy new creator tokens
- **CreatorToken** - ERC-20 with bonding curve AMM
- **PlatformTreasury** - Fee collection & vesting
- **AccessController** - Token-gated access
- **MetaTransactionForwarder** - Gasless transactions

### Frontend (Web App)
- **React + TypeScript** - Modern UI framework
- **Vite** - Fast development server
- **TailwindCSS** - Styling
- **Ethers.js** - Blockchain interaction
- **MetaMask** - Wallet connection

---

## ✨ Features

### For Creators
✅ Launch your token in seconds  
✅ Automatic bonding curve pricing  
✅ Earn fees on every trade  
✅ 30-day vesting for platform fees  
✅ Token-gated content access  
✅ Real-time analytics dashboard  

### For Fans
✅ Buy creator tokens with USDC  
✅ Sell anytime (15% max per transaction)  
✅ Price discovery via bonding curve  
✅ Access exclusive content (≥100 tokens)  
✅ Track portfolio performance  
✅ Trade with minimal fees  

### Technical Features
✅ Linear bonding curve (Price = basePrice + k × supply)  
✅ Anti-dump protection (15% max sell, circuit breaker)  
✅ EIP-1167 minimal proxies (86% gas savings)  
✅ EIP-2771 meta-transactions (gasless txs)  
✅ EIP-712 typed signatures  
✅ Fixed-point arithmetic (1e18 precision)  

---

## 📊 Current Status

### ✅ COMPLETED (100%)

- [x] All 6 smart contracts implemented
- [x] Bonding curve mathematics
- [x] Anti-dump & circuit breaker logic
- [x] 30-day linear vesting
- [x] Meta-transaction support
- [x] Deployment scripts
- [x] Test suite
- [x] Frontend React app
- [x] Contract interaction hooks
- [x] **Successfully compiled all contracts**
- [x] Ready for deployment

### 🎯 Next Steps

- [ ] Deploy to Base Goerli testnet
- [ ] Test full platform functionality
- [ ] Get professional security audit
- [ ] Deploy to Base mainnet
- [ ] Launch to users!

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [`QUICK_START.md`](./project/QUICK_START.md) | ✅ Quick checklist to run project |
| [`HOW_TO_RUN.md`](./project/HOW_TO_RUN.md) | 📖 Complete detailed guide |
| [`FLOW_DIAGRAM.md`](./project/FLOW_DIAGRAM.md) | 🗺️ Visual flowcharts & diagrams |
| [`CONTRACTS_README.md`](./project/CONTRACTS_README.md) | 📜 Smart contract documentation |
| [`SETUP_GUIDE.md`](./project/SETUP_GUIDE.md) | ⚙️ Deployment & configuration |
| [`IMPLEMENTATION_SUMMARY.md`](./project/IMPLEMENTATION_SUMMARY.md) | 📋 Project overview |

---

## 🛠️ Tech Stack

### Blockchain
- **Solidity 0.8.19** - Smart contract language
- **Hardhat 2.22.0** - Development environment
- **OpenZeppelin 4.9.6** - Security libraries
- **Base Chain** - L2 blockchain network
- **USDC** - Reserve token

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Ethers.js 6** - Web3 library
- **Framer Motion** - Animations

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or v20 (LTS)
- npm v9+
- MetaMask browser extension
- Base Goerli testnet ETH

### Installation

```bash
# 1. Navigate to project
cd /Users/abuzaid/Downloads/metamask-dashboard-search_feature_done/project

# 2. Setup environment
cp .env.example .env
# Edit .env and add your PRIVATE_KEY

# 3. Get testnet ETH
# Visit: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

# 4. Compile & deploy contracts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network baseGoerli

# 5. Update frontend config with deployed addresses
# Edit: src/config/contracts.ts

# 6. Start frontend
npm run dev

# 7. Open browser
open http://localhost:5173
```

**For detailed instructions, see: [`HOW_TO_RUN.md`](./project/HOW_TO_RUN.md)**

---

## 📸 Screenshots

### Creator Dashboard
Create and manage your tokens, view analytics, and track performance.

### YouTuber Search
Discover and invest in your favorite creators.

### Token Trading
Buy and sell creator tokens with real-time price updates.

### Analytics
View bonding curves, trade history, and portfolio performance.

---

## 🔒 Security

### Smart Contract Security
✅ OpenZeppelin audited libraries  
✅ ReentrancyGuard on all state changes  
✅ SafeERC20 for token transfers  
✅ Access control on admin functions  
✅ Circuit breakers for suspicious activity  
✅ Fixed-point math (no overflow)  

### Recommended Before Mainnet
- [ ] Professional security audit
- [ ] Bug bounty program
- [ ] Multisig for admin operations
- [ ] Gradual rollout with limits
- [ ] Monitoring & alerting

---

## 🌐 Networks

### Base Goerli (Testnet)
- **Chain ID**: 84531
- **RPC**: https://goerli.base.org
- **Explorer**: https://goerli.basescan.org
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### Base Mainnet (Production)
- **Chain ID**: 8453
- **RPC**: https://mainnet.base.org
- **Explorer**: https://basescan.org
- **Bridge**: https://bridge.base.org

---

## 💡 How It Works

### Bonding Curve Pricing

The platform uses a **linear bonding curve** to automatically price tokens:

```
Price = basePrice + (k × currentSupply)
```

**Example:**
- Base Price: 0.01 USDC
- Curve Parameter (k): 0.0001
- Current Supply: 5,000 tokens

**Current Price** = 0.01 + (0.0001 × 5,000) = **0.51 USDC**

As more tokens are bought, the price increases. When tokens are sold, the price decreases.

### Fee Structure

| Transaction | Platform Fee | Creator Fee | Total |
|-------------|-------------|-------------|-------|
| Buy | 1% | 3% | 4% |
| Sell | 1% | 3% | 4% |

### Vesting Schedule

Creator fees are vested linearly over 30 days:
- Day 0: 0% claimable
- Day 15: 50% claimable
- Day 30: 100% claimable

---

## 🤝 Contributing

This is a learning/demo project. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Use as reference for your own project

---

## 📄 License

MIT License - feel free to use this code for learning or building your own projects.

---

## 🙏 Acknowledgments

- **OpenZeppelin** - Security libraries
- **Hardhat** - Development framework
- **Base** - L2 scaling solution
- **Vite** - Fast build tool
- **Community** - Inspiration & support

---

## 📞 Support

Need help running the project?

1. Check [`HOW_TO_RUN.md`](./project/HOW_TO_RUN.md) for detailed instructions
2. See troubleshooting section in the guide
3. Review smart contract docs in [`CONTRACTS_README.md`](./project/CONTRACTS_README.md)

---

## 🎯 Project Stats

- **Smart Contracts**: 6 core contracts
- **Lines of Solidity**: ~2,500+
- **Lines of TypeScript**: ~1,500+
- **Test Coverage**: Test suite included
- **Gas Optimized**: Via-IR compilation enabled
- **Documentation**: 6 comprehensive guides

---

## 🚧 Roadmap

### Phase 1: Core Platform ✅
- [x] Smart contracts
- [x] Bonding curve AMM
- [x] Frontend interface
- [x] Wallet integration

### Phase 2: Testing 🔄
- [ ] Deploy to testnet
- [ ] User testing
- [ ] Bug fixes
- [ ] Optimization

### Phase 3: Security 📋
- [ ] Professional audit
- [ ] Bug bounty
- [ ] Testnet beta launch

### Phase 4: Mainnet 🚀
- [ ] Deploy to Base mainnet
- [ ] Marketing launch
- [ ] Onboard creators
- [ ] Community building

---

**Built by Team SPARK 💫**

*Making creator tokenization accessible, secure, and fun.*

**Last Updated**: November 22, 2025  
**Status**: ✅ Ready for Deployment

---

### 📂 Directory Structure

```
project/
├── contracts/              # Solidity smart contracts
│   ├── BondingCurveAMM.sol
│   ├── CreatorToken.sol
│   ├── CreatorTokenFactory.sol
│   ├── PlatformTreasury.sol
│   ├── AccessController.sol
│   ├── MetaTransactionForwarder.sol
│   ├── interfaces/
│   └── mocks/
├── scripts/                # Deployment & utility scripts
│   ├── deploy.ts
│   ├── check-balance.js
│   ├── check-deployment.js
│   └── generate-wallet.js
├── test/                   # Test suite
│   └── CreatorTok.test.ts
├── src/                    # React frontend
│   ├── components/
│   ├── config/
│   ├── hooks/
│   └── types.ts
├── hardhat.config.cjs      # Hardhat configuration
├── .env.example            # Environment template
└── Documentation files     # All the guides
```

---

**🎉 Ready to run? Start with [`QUICK_START.md`](./project/QUICK_START.md)!**
