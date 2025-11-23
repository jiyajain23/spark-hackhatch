# ✅ Quick Start Checklist

Follow these steps in order. Check each box as you complete it.

---

## 📦 PART 1: Setup (5-10 minutes)

### Step 1: Environment Setup

```bash
cd /Users/abuzaid/Downloads/metamask-dashboard-search_feature_done/project
```

- [ ] Navigate to project directory

```bash
cp .env.example .env
```

- [ ] Create .env file from template

```bash
open .env
```

- [ ] Open .env in editor
- [ ] Add your PRIVATE_KEY (without 0x prefix)
- [ ] Save the file

### Step 2: Get Testnet ETH

- [ ] Go to https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- [ ] Request testnet ETH for your wallet address
- [ ] Wait 1-2 minutes for ETH to arrive

```bash
npx hardhat run scripts/check-balance.js --network baseGoerli
```

- [ ] Verify you have ≥0.05 ETH

---

## 🚀 PART 2: Deploy Contracts (5 minutes)

### Step 3: Compile Contracts

```bash
npx hardhat clean
npx hardhat compile
```

- [ ] See "Compiled 31 Solidity files successfully"

### Step 4: Deploy to Testnet

```bash
npx hardhat run scripts/deploy.ts --network baseGoerli
```

- [ ] Wait for deployment to complete (~3 minutes)
- [ ] See 5 contract addresses in terminal output

### Step 5: Save Contract Addresses

- [ ] Copy all 5 contract addresses from terminal
- [ ] Open .env file
- [ ] Paste addresses into these variables:
  - [ ] PLATFORM_TREASURY_ADDRESS=
  - [ ] CREATOR_TOKEN_IMPLEMENTATION_ADDRESS=
  - [ ] CREATOR_TOKEN_FACTORY_ADDRESS=
  - [ ] META_TRANSACTION_FORWARDER_ADDRESS=
  - [ ] ACCESS_CONTROLLER_ADDRESS=
- [ ] Save .env file

### Step 6: Verify Deployment

```bash
npx hardhat run scripts/check-deployment.js --network baseGoerli
```

- [ ] See "✅ All contracts deployed successfully!"

---

## 🎨 PART 3: Run Frontend (2 minutes)

### Step 7: Update Frontend Config

```bash
open src/config/contracts.ts
```

- [ ] Open the contracts config file
- [ ] Update the `baseGoerli` addresses with your deployed addresses
- [ ] Save the file

### Step 8: Start Development Server

```bash
npm run dev
```

- [ ] See "VITE v5.x.x ready in XXX ms"
- [ ] See "Local: http://localhost:5173/"

### Step 9: Open in Browser

- [ ] Open browser
- [ ] Go to http://localhost:5173
- [ ] See Creator-Tok landing page

---

## 🧪 PART 4: Test the Platform (10 minutes)

### Step 10: Setup MetaMask

- [ ] Install MetaMask extension (if not installed)
- [ ] Add Base Goerli network to MetaMask:
  - Network Name: `Base Goerli`
  - RPC URL: `https://goerli.base.org`
  - Chain ID: `84531`
  - Currency Symbol: `ETH`
- [ ] Import your test account (use private key from .env)
- [ ] Verify account has testnet ETH

### Step 11: Connect Wallet

- [ ] Click "Connect Wallet" in the app
- [ ] Approve MetaMask connection
- [ ] See your wallet address displayed

### Step 12: Create Your First Token

- [ ] Go to Creator Dashboard
- [ ] Fill in token details
- [ ] Click "Create Token"
- [ ] Approve transaction in MetaMask
- [ ] Wait for confirmation (~10 seconds)
- [ ] See your token appear in dashboard

---

## ✅ SUCCESS VERIFICATION

You've successfully run the project if:

- [x] Contracts compiled ✅
- [x] Contracts deployed to Base Goerli ✅
- [x] Frontend running on http://localhost:5173 ✅
- [x] MetaMask connected ✅
- [x] Created a token ✅

---

## 🎉 YOU'RE DONE!

Your Creator-Tok platform is now running!

---

## 📝 Common Commands

```bash
# Start frontend
npm run dev

# Check deployment
npx hardhat run scripts/check-deployment.js --network baseGoerli

# Check balance
npx hardhat run scripts/check-balance.js --network baseGoerli
```

---

## 🆘 If Something Goes Wrong

See **HOW_TO_RUN.md** for detailed troubleshooting.

---

## 📚 Documentation Index

- **QUICK_START.md** (this file) - Quick checklist
- **HOW_TO_RUN.md** - Detailed step-by-step guide
- **FLOW_DIAGRAM.md** - Visual flowcharts
- **CONTRACTS_README.md** - Smart contract docs
- **SETUP_GUIDE.md** - Deployment guide

---

**Total time: ~20-30 minutes** 🚀
