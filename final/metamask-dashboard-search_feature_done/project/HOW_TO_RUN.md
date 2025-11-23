# 🚀 Complete Guide: How to Run Your Creator-Tok Project

This guide will walk you through **everything** you need to do to run your project from start to finish.

---

## 📋 Table of Contents

1. [Understanding Your Project](#understanding-your-project)
2. [Prerequisites Check](#prerequisites-check)
3. [Setup Environment](#setup-environment)
4. [Deploy Smart Contracts](#deploy-smart-contracts)
5. [Run Frontend](#run-frontend)
6. [Test the Platform](#test-the-platform)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Understanding Your Project

Your project has **TWO main parts**:

### Part 1: Smart Contracts (Blockchain Backend)
- Location: `/project/contracts/`
- Built with: Solidity + Hardhat
- Purpose: Handle all blockchain logic (tokens, trading, fees)
- Deploy to: Base Goerli (testnet) or Base Mainnet

### Part 2: Frontend (Web Interface)
- Location: `/project/src/`
- Built with: React + TypeScript + Vite
- Purpose: User interface for creators and fans
- Runs on: http://localhost:5173

---

## ✅ Prerequisites Check

Before starting, verify you have everything installed:

### 1. Check Node.js Version

```bash
node --version
```

**Expected**: v18.x.x or v20.x.x (LTS versions recommended)  
**Current**: You have v23.11.0 (works but not officially supported by Hardhat)

### 2. Check npm

```bash
npm --version
```

**Expected**: v9.x.x or v10.x.x

### 3. Check if Dependencies are Installed

```bash
cd /Users/abuzaid/Downloads/metamask-dashboard-search_feature_done/project
ls node_modules/
```

**Expected**: You should see folders like `hardhat`, `react`, `vite`, etc.

✅ **Good news**: Your dependencies are already installed!

---

## 🔧 Setup Environment

### Step 1: Create Your .env File

This file stores your private keys and configuration. **NEVER commit this to GitHub!**

```bash
cd /Users/abuzaid/Downloads/metamask-dashboard-search_feature_done/project

# Copy the example file
cp .env.example .env

# Open it in your editor
open .env
```

### Step 2: Fill in Your .env File

You need to add these values:

#### A. Get a Private Key

**Option 1: Create a NEW wallet for testing (Recommended)**
```bash
# Run this command to generate a new wallet
npx hardhat run scripts/generate-wallet.js
```

**Option 2: Use existing MetaMask wallet**
1. Open MetaMask
2. Click the three dots → Account Details → Show Private Key
3. Copy it (WITHOUT the 0x prefix)

⚠️ **IMPORTANT**: Use a TEST wallet with NO real funds for testing!

#### B. Get Base Goerli RPC URL

Already filled in `.env.example`:
```
BASE_GOERLI_RPC_URL=https://goerli.base.org
```

#### C. Get BaseScan API Key (Optional for verification)

1. Go to https://basescan.org/
2. Sign up for a free account
3. Go to API-KEYs → Add new key
4. Copy the API key
5. Paste in `.env`

#### Your .env should look like:

```bash
# Network RPC URLs
BASE_GOERLI_RPC_URL=https://goerli.base.org
BASE_RPC_URL=https://mainnet.base.org

# Deployer Private Key (without 0x prefix)
PRIVATE_KEY=abc123def456... # YOUR ACTUAL PRIVATE KEY HERE

# API Keys
BASESCAN_API_KEY=XYZ123ABC456 # YOUR API KEY (optional)
COINMARKETCAP_API_KEY=

# Gas Reporting
REPORT_GAS=false

# Contract Addresses (will be filled after deployment)
PLATFORM_TREASURY_ADDRESS=
CREATOR_TOKEN_IMPLEMENTATION_ADDRESS=
CREATOR_TOKEN_FACTORY_ADDRESS=
META_TRANSACTION_FORWARDER_ADDRESS=
ACCESS_CONTROLLER_ADDRESS=

# USDC Token Addresses on Base
USDC_BASE_MAINNET=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
USDC_BASE_GOERLI=0xF175520C52418dfE19C8098071a252da48Cd1C19

# Platform Configuration
PLATFORM_FEE_BPS=100
CREATOR_BUY_FEE_BPS=300
CREATOR_SELL_FEE_BPS=300
MAX_SELL_PERCENT_BPS=1500
```

### Step 3: Get Test ETH for Base Goerli

You need testnet ETH to deploy contracts. Here's how:

#### Option 1: Base Goerli Faucet
1. Go to https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
2. Connect your wallet (the one whose private key you added to .env)
3. Request testnet ETH
4. Wait 1-2 minutes

#### Option 2: Alchemy Faucet
1. Go to https://www.alchemy.com/faucets/base-goerli
2. Sign up/login to Alchemy
3. Enter your wallet address
4. Request testnet ETH

#### Verify You Received ETH

```bash
# Check your balance
npx hardhat run scripts/check-balance.js --network baseGoerli
```

You need at least **0.05 ETH** to deploy all contracts.

---

## 🚀 Deploy Smart Contracts

Now let's deploy your contracts to the blockchain!

### Step 1: Verify Contracts Compile

```bash
cd /Users/abuzaid/Downloads/metamask-dashboard-search_feature_done/project

# Clean previous builds
npx hardhat clean

# Compile contracts
npx hardhat compile
```

✅ **Expected output**: "Compiled 31 Solidity files successfully"

### Step 2: Run Tests (Optional but Recommended)

```bash
npx hardhat test
```

This will run the test suite to make sure everything works.

### Step 3: Deploy to Base Goerli Testnet

```bash
npx hardhat run scripts/deploy.ts --network baseGoerli
```

⏳ **This will take 2-3 minutes**. You'll see output like:

```
Deploying contracts to Base Goerli...

✅ PlatformTreasury deployed to: 0x1234567890abcdef...
✅ CreatorToken Implementation deployed to: 0xabcdef1234567890...
✅ MetaTransactionForwarder deployed to: 0xfedcba0987654321...
✅ CreatorTokenFactory deployed to: 0x1122334455667788...
✅ AccessController deployed to: 0x8877665544332211...

Deployment complete! 🎉
```

### Step 4: Save Contract Addresses

**IMPORTANT**: Copy all the contract addresses from the terminal output!

Update your `.env` file:

```bash
# Open .env
open .env
```

Fill in the addresses:

```bash
PLATFORM_TREASURY_ADDRESS=0x1234567890abcdef...
CREATOR_TOKEN_IMPLEMENTATION_ADDRESS=0xabcdef1234567890...
CREATOR_TOKEN_FACTORY_ADDRESS=0x1122334455667788...
META_TRANSACTION_FORWARDER_ADDRESS=0xfedcba0987654321...
ACCESS_CONTROLLER_ADDRESS=0x8877665544332211...
```

### Step 5: Verify Contracts on BaseScan (Optional)

```bash
npx hardhat verify --network baseGoerli <CONTRACT_ADDRESS>
```

Replace `<CONTRACT_ADDRESS>` with each contract address.

---

## 🎨 Run Frontend

Now let's start the web interface!

### Step 1: Update Frontend Configuration

Open `src/config/contracts.ts` and update the addresses:

```bash
open src/config/contracts.ts
```

Make sure it has your deployed contract addresses:

```typescript
export const CONTRACT_ADDRESSES = {
  baseGoerli: {
    platformTreasury: '0x1234567890abcdef...', // YOUR ADDRESS
    creatorTokenFactory: '0x1122334455667788...', // YOUR ADDRESS
    metaTransactionForwarder: '0xfedcba0987654321...', // YOUR ADDRESS
    accessController: '0x8877665544332211...', // YOUR ADDRESS
    usdc: '0xF175520C52418dfE19C8098071a252da48Cd1C19'
  }
};
```

### Step 2: Start Development Server

```bash
cd /Users/abuzaid/Downloads/metamask-dashboard-search_feature_done/project

# Start Vite dev server
npm run dev
```

✅ **Expected output**:

```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 3: Open in Browser

1. Open your browser
2. Go to: http://localhost:5173/
3. You should see the Creator-Tok platform!

---

## 🧪 Test the Platform

### Step 1: Setup MetaMask

1. **Install MetaMask** (if not already): https://metamask.io/download/

2. **Add Base Goerli Network**:
   - Open MetaMask
   - Click network dropdown → "Add Network"
   - **Manual entry**:
     - Network Name: `Base Goerli`
     - RPC URL: `https://goerli.base.org`
     - Chain ID: `84531`
     - Currency Symbol: `ETH`
     - Block Explorer: `https://goerli.basescan.org`

3. **Import your test account**:
   - Click account icon → Import Account
   - Paste the private key from your `.env`
   - This account should have testnet ETH

### Step 2: Get Test USDC

You need USDC to test buying tokens:

```bash
# Run the mock USDC script
npx hardhat run scripts/get-test-usdc.ts --network baseGoerli
```

This will mint 10,000 test USDC to your wallet.

### Step 3: Test User Flow

#### As a Creator:

1. **Connect Wallet**
   - Click "Connect Wallet" in the app
   - Approve MetaMask connection

2. **Create Your Token**
   - Go to Creator Dashboard
   - Fill in:
     - Token Name: "MyChannel Token"
     - Token Symbol: "MCT"
     - Base Price: 0.01 (USDC)
     - Curve Parameter: 0.0001
     - Initial Supply: 10000
   - Click "Create Token"
   - Approve transaction in MetaMask
   - Wait for confirmation

3. **View Your Token**
   - You should see your token card
   - Check price, supply, and bonding curve chart

#### As a Fan:

1. **Switch Account** (or use different browser)
   - Import another test account in MetaMask
   - Send it some test ETH and USDC

2. **Search for Creator Token**
   - Go to "Search Tokens" page
   - Find the token you created

3. **Buy Tokens**
   - Click "Buy"
   - Enter amount (e.g., 100 tokens)
   - Approve USDC spending (first time only)
   - Confirm buy transaction
   - Check your balance

4. **Sell Tokens** (after buying)
   - Click "Sell"
   - Enter amount to sell
   - Confirm transaction
   - Check USDC refund

5. **Check Access**
   - If you have ≥100 tokens
   - You should see "Access Granted" badge
   - Can access exclusive content

---

## 🐛 Troubleshooting

### Issue 1: "Cannot find module 'hardhat'"

**Solution**:
```bash
cd /Users/abuzaid/Downloads/metamask-dashboard-search_feature_done/project
npm install
```

### Issue 2: "Invalid private key" when deploying

**Solution**:
- Check your `.env` file
- Make sure private key has NO spaces
- Remove the `0x` prefix if present
- Should be 64 characters long

### Issue 3: "Insufficient funds" error

**Solution**:
- Get more testnet ETH from faucet
- Check balance: `npx hardhat run scripts/check-balance.js --network baseGoerli`

### Issue 4: Frontend shows "Contract not deployed"

**Solution**:
- Make sure you deployed contracts
- Check contract addresses in `src/config/contracts.ts`
- Verify you're on Base Goerli network in MetaMask

### Issue 5: MetaMask not connecting

**Solution**:
- Make sure MetaMask is unlocked
- Check you're on Base Goerli network
- Refresh the page
- Clear MetaMask cache: Settings → Advanced → Reset Account

### Issue 6: "Transaction reverted" when buying tokens

**Solution**:
- Make sure you have USDC in your wallet
- Approve USDC spending first
- Check slippage settings (increase if needed)

### Issue 7: Port 5173 already in use

**Solution**:
```bash
# Kill the process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

### Issue 8: Compilation errors

**Solution**:
```bash
# Clean and recompile
npx hardhat clean
rm -rf artifacts cache typechain-types
npx hardhat compile
```

---

## 📊 Project Commands Reference

### Smart Contract Commands

```bash
# Compile contracts
npx hardhat compile

# Clean build artifacts
npx hardhat clean

# Run tests
npx hardhat test

# Run single test file
npx hardhat test test/CreatorTok.test.ts

# Deploy to testnet
npx hardhat run scripts/deploy.ts --network baseGoerli

# Deploy to mainnet (CAREFUL!)
npx hardhat run scripts/deploy.ts --network base

# Verify contract
npx hardhat verify --network baseGoerli <CONTRACT_ADDRESS>

# Check balance
npx hardhat run scripts/check-balance.js --network baseGoerli

# Start local Hardhat node
npx hardhat node

# Console (interact with contracts)
npx hardhat console --network baseGoerli
```

### Frontend Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Install dependencies
npm install

# Update dependencies
npm update
```

### Useful Scripts

```bash
# Get your wallet address
npx hardhat run scripts/get-address.js

# Check contract deployment
npx hardhat run scripts/check-deployment.js --network baseGoerli

# Transfer tokens between accounts
npx hardhat run scripts/transfer-tokens.js --network baseGoerli
```

---

## 🎯 Quick Start Summary

If you just want to get started quickly:

```bash
# 1. Setup
cd /Users/abuzaid/Downloads/metamask-dashboard-search_feature_done/project
cp .env.example .env
# Edit .env and add your PRIVATE_KEY

# 2. Get testnet ETH from faucet
# Go to: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

# 3. Deploy contracts
npx hardhat clean
npx hardhat compile
npx hardhat run scripts/deploy.ts --network baseGoerli
# Save the contract addresses to .env

# 4. Update frontend config
# Edit src/config/contracts.ts with your addresses

# 5. Start frontend
npm run dev

# 6. Open browser
# Go to http://localhost:5173
```

---

## 🔐 Security Reminders

- ✅ Never commit `.env` file to GitHub
- ✅ Never share your private keys
- ✅ Use separate wallets for testnet and mainnet
- ✅ Start with small amounts when testing
- ✅ Get professional audit before mainnet launch
- ✅ Use multisig wallet for admin operations
- ✅ Test everything on testnet first

---

## 📚 Additional Resources

- **Hardhat Docs**: https://hardhat.org/docs
- **Base Docs**: https://docs.base.org
- **Ethers.js Docs**: https://docs.ethers.org/v6/
- **Vite Docs**: https://vitejs.dev/
- **React Docs**: https://react.dev/

---

## 🆘 Need Help?

If you're stuck:

1. Check this guide again carefully
2. Read the error message completely
3. Check the Troubleshooting section
4. Read CONTRACTS_README.md for contract details
5. Read SETUP_GUIDE.md for deployment details

---

## ✅ Success Checklist

Before considering your project "running", verify:

- [ ] Contracts compile successfully
- [ ] Contracts deployed to Base Goerli
- [ ] Contract addresses saved in `.env`
- [ ] Frontend starts without errors
- [ ] Can connect MetaMask
- [ ] Can create a token
- [ ] Can buy tokens
- [ ] Can sell tokens
- [ ] Can see balance updates
- [ ] Can see charts and stats

---

**🎉 Congratulations!**

Once you complete all steps, you'll have:
- ✅ Smart contracts deployed on Base Goerli
- ✅ Frontend running locally
- ✅ Full creator tokenization platform
- ✅ Ready to onboard creators and fans!

**Built with ❤️ by Team SPARK**

Last updated: November 22, 2025
