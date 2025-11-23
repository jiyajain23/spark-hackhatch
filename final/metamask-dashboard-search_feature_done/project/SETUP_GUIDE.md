# 🚀 Creator-Tok Setup & Installation Guide

## Quick Start

Follow these steps to get Creator-Tok up and running with smart contracts on Base chain.

---

## Part 1: Smart Contract Setup

### Step 1: Install Hardhat Dependencies

```bash
cd project

# Install Hardhat and dependencies
npm install --save-dev \
  hardhat \
  @nomicfoundation/hardhat-toolbox \
  @nomicfoundation/hardhat-ethers \
  @nomicfoundation/hardhat-verify \
  @typechain/hardhat \
  @typechain/ethers-v6 \
  hardhat-gas-reporter \
  solidity-coverage \
  @types/chai \
  @types/mocha \
  @types/node \
  ts-node \
  typescript \
  dotenv

# Install OpenZeppelin contracts
npm install @openzeppelin/contracts

# Install Ethers.js
npm install ethers
```

### Step 2: Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit .env and add your values:
# PRIVATE_KEY=your_private_key_here (without 0x prefix)
# BASE_GOERLI_RPC_URL=https://goerli.base.org
# BASESCAN_API_KEY=your_api_key
```

### Step 3: Compile Contracts

```bash
npx hardhat compile
```

This will:
- Compile all Solidity contracts
- Generate artifacts in `artifacts/`
- Generate TypeChain types in `typechain-types/`

### Step 4: Run Tests

```bash
# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run coverage report
npx hardhat coverage
```

### Step 5: Deploy to Base Goerli

```bash
# Make sure you have ETH on Base Goerli for gas
npx hardhat run scripts/deploy.ts --network baseGoerli
```

Save the contract addresses from the output!

### Step 6: Verify Contracts (Optional)

```bash
# Verify on BaseScan
npx hardhat verify --network baseGoerli <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## Part 2: Frontend Integration

### Step 1: Update Contract Addresses

```typescript
// src/config/contracts.ts
export const CONTRACT_ADDRESSES = {
  baseGoerli: {
    usdc: "0xF175520C52418dfE19C8098071a252da48Cd1C19",
    platformTreasury: "0x...", // From deployment
    creatorTokenImpl: "0x...", // From deployment
    factory: "0x...",          // From deployment
    accessController: "0x...", // From deployment
    forwarder: "0x...",        // From deployment
    chainId: 84531,
  },
};
```

### Step 2: Copy ABIs to Frontend

```bash
# Create ABI directory
mkdir -p src/abis

# Copy compiled ABIs
cp artifacts/contracts/CreatorTokenFactory.sol/CreatorTokenFactory.json src/abis/
cp artifacts/contracts/CreatorToken.sol/CreatorToken.json src/abis/
cp artifacts/contracts/PlatformTreasury.sol/PlatformTreasury.json src/abis/
cp artifacts/contracts/AccessController.sol/AccessController.json src/abis/
cp artifacts/contracts/MetaTransactionForwarder.sol/MetaTransactionForwarder.json src/abis/

# Or use TypeChain types directly
cp -r typechain-types src/
```

### Step 3: Update useContracts Hook

Uncomment and update the import statements in `src/hooks/useContracts.ts`:

```typescript
import CreatorTokenFactoryABI from '../abis/CreatorTokenFactory.json';
import CreatorTokenABI from '../abis/CreatorToken.json';
import PlatformTreasuryABI from '../abis/PlatformTreasury.json';

// Then initialize contracts
const factory = new Contract(
  addresses.factory,
  CreatorTokenFactoryABI.abi,
  signer || provider
);
```

### Step 4: Install Frontend Dependencies

```bash
# If not already installed
npm install ethers
```

### Step 5: Test Integration

```bash
npm run dev
```

Navigate to the app and:
1. Connect MetaMask to Base Goerli
2. Try creating a creator token
3. Buy some tokens with USDC
4. Check your balance

---

## Part 3: Testing with Mock USDC

If you don't have testnet USDC, you can:

### Option 1: Use Faucet
Get Base Goerli ETH and USDC from:
- https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### Option 2: Deploy Mock USDC

```bash
# In Hardhat console
npx hardhat console --network baseGoerli

> const MockERC20 = await ethers.getContractFactory("MockERC20");
> const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
> await usdc.deployed();
> console.log("Mock USDC:", usdc.address);

# Mint to your address
> await usdc.mint("YOUR_ADDRESS", ethers.utils.parseUnits("10000", 6));
```

---

## Part 4: Common Issues & Solutions

### Issue: "Cannot find module 'hardhat'"

**Solution:**
```bash
npm install --save-dev hardhat
```

### Issue: "Invalid nonce" or "Transaction underpriced"

**Solution:**
- Reset MetaMask account: Settings → Advanced → Reset Account
- Increase gas price in transaction

### Issue: "Insufficient funds for gas"

**Solution:**
- Get Base Goerli ETH from faucet
- Check you're on the right network

### Issue: TypeScript errors in hooks

**Solution:**
```bash
# Regenerate types
npx hardhat clean
npx hardhat compile
npx hardhat typechain
```

### Issue: "Contract not deployed at address"

**Solution:**
- Verify you're on Base Goerli network in MetaMask
- Check contract addresses in config match deployment output
- Verify contracts were deployed successfully

---

## Part 5: Development Workflow

### Daily Development

```bash
# 1. Start local node (optional)
npx hardhat node

# 2. Run tests continuously
npx hardhat test --watch

# 3. Start frontend dev server
npm run dev

# 4. Deploy changes
npx hardhat run scripts/deploy.ts --network baseGoerli
```

### Before Committing

```bash
# Run full test suite
npx hardhat test

# Check coverage
npx hardhat coverage

# Lint contracts (if configured)
npx hardhat check

# Build frontend
npm run build
```

---

## Part 6: Production Deployment

### Prerequisites

1. **Security Audit**: Get contracts audited by reputable firm
2. **Multisig Setup**: Deploy Gnosis Safe for admin operations
3. **Insurance**: Consider smart contract insurance
4. **Monitoring**: Set up Tenderly/Defender for monitoring

### Mainnet Deployment Steps

```bash
# 1. Update RPC to Base mainnet
BASE_RPC_URL=https://mainnet.base.org

# 2. Deploy to mainnet
npx hardhat run scripts/deploy.ts --network base

# 3. Transfer ownership to multisig
npx hardhat run scripts/transferOwnership.ts --network base

# 4. Verify all contracts
npx hardhat run scripts/verify.ts --network base

# 5. Update frontend config with mainnet addresses
# 6. Deploy frontend to production
```

---

## Part 7: Monitoring & Maintenance

### Set Up Monitoring

1. **Tenderly**: https://tenderly.co
   - Real-time monitoring
   - Transaction simulation
   - Alerts for anomalies

2. **OpenZeppelin Defender**: https://defender.openzeppelin.com
   - Automated operations
   - Security monitoring
   - Incident response

3. **The Graph**: Create subgraph for querying
   ```graphql
   query {
     creatorTokens {
       id
       name
       creator
       totalSupply
       currentPrice
     }
   }
   ```

### Regular Maintenance

- **Weekly**: Check treasury balances
- **Monthly**: Review vesting schedules
- **Quarterly**: Security review
- **Annually**: Re-audit after major changes

---

## Part 8: Advanced Features

### Enable Meta-Transactions

```typescript
// Set up relayer service
import { MetaTransactionForwarder } from './typechain-types';

const forwarder = new MetaTransactionForwarder(FORWARDER_ADDRESS, signer);

// Sign meta-transaction
const metaTx = {
  from: userAddress,
  to: tokenAddress,
  value: 0,
  gas: 300000,
  nonce: await forwarder.getNonce(userAddress),
  data: buyCalldata,
  deadline: Math.floor(Date.now() / 1000) + 300, // 5 min
};

const signature = await user._signTypedData(
  domain,
  types,
  metaTx
);

// Relayer executes
await forwarder.connect(relayer).execute(metaTx, signature);
```

### Set Up Oracle Service

```typescript
// Backend service to verify milestones
import { ethers } from 'ethers';

async function checkMilestones(creatorAddress: string) {
  // Fetch YouTube stats
  const stats = await fetchYouTubeStats(creatorAddress);
  
  // Check if milestone reached
  if (stats.subscribers >= milestone.threshold) {
    // Sign attestation
    const oracleSigner = new ethers.Wallet(ORACLE_PRIVATE_KEY);
    
    // Call unlockSupplyOnMilestone
    const tx = await creatorToken
      .connect(oracleSigner)
      .unlockSupplyOnMilestone(
        newSupplyLimit,
        milestoneId
      );
    
    await tx.wait();
  }
}
```

---

## Part 9: Resources

### Documentation
- [Hardhat Docs](https://hardhat.org/docs)
- [Ethers.js Docs](https://docs.ethers.org)
- [OpenZeppelin Docs](https://docs.openzeppelin.com)
- [Base Docs](https://docs.base.org)

### Tools
- [Remix IDE](https://remix.ethereum.org)
- [Tenderly](https://tenderly.co)
- [Etherscan](https://etherscan.io)
- [BaseScan](https://basescan.org)

### Community
- [Base Discord](https://discord.gg/base)
- [Hardhat Discord](https://discord.gg/hardhat)
- [Ethereum Stack Exchange](https://ethereum.stackexchange.com)

---

## Part 10: Troubleshooting Commands

```bash
# Clean everything
npx hardhat clean
rm -rf artifacts cache typechain-types

# Reinstall
rm -rf node_modules package-lock.json
npm install

# Recompile
npx hardhat compile --force

# Check network
npx hardhat run scripts/checkNetwork.ts --network baseGoerli

# Check balances
npx hardhat run scripts/checkBalances.ts --network baseGoerli

# Emergency pause (if needed)
npx hardhat run scripts/emergencyPause.ts --network baseGoerli
```

---

## 🎉 You're Ready!

Your Creator-Tok platform is now fully set up with:

✅ 6 deployed smart contracts on Base chain
✅ Bonding curve AMM for pricing
✅ Anti-dump protection mechanisms
✅ 30-day vesting schedules
✅ Meta-transaction support
✅ Token-gated access control
✅ Frontend integration ready

**Next Steps:**
1. Test thoroughly on testnet
2. Get security audit
3. Deploy to mainnet
4. Launch! 🚀

---

**Need Help?**
- Check `CONTRACTS_README.md` for detailed documentation
- Review test files in `test/` for examples
- Open an issue on GitHub
- Contact: support@creatortok.io

---

**Built by Team SPARK 💫**
