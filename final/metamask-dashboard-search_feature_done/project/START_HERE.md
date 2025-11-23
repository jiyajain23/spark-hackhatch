# 🎯 Simple 3-Step Guide

## What You Need to Do (TL;DR)

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  YOUR PROJECT IS ALREADY 95% DONE! ✅              │
│                                                    │
│  ✓ Contracts written                              │
│  ✓ Frontend built                                 │
│  ✓ Dependencies installed                         │
│  ✓ Everything compiled                            │
│                                                    │
│  You just need to:                                 │
│  1. Setup environment (5 min)                      │
│  2. Deploy contracts (5 min)                       │
│  3. Run frontend (1 min)                           │
│                                                    │
│  TOTAL TIME: ~11 minutes                           │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Step 1: Setup Environment (5 minutes)

### What you're doing:
Creating a `.env` file with your private key and getting test ETH.

### Commands:
```bash
cd /Users/abuzaid/Downloads/metamask-dashboard-search_feature_done/project

# Create environment file
cp .env.example .env

# Open it
open .env
```

### What to add to .env:
```
PRIVATE_KEY=your_private_key_here_without_0x
```

### Get a private key:
**Option A:** Generate new test wallet
```bash
node scripts/generate-wallet.cjs
```

**Option B:** Use MetaMask
- Open MetaMask → Three dots → Account Details → Show Private Key
- Copy it (remove the "0x" at the start)

### Get testnet ETH:
1. Go to: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
2. Enter your wallet address
3. Request ETH
4. Wait 2 minutes

### Verify:
```bash
node scripts/check-balance.cjs --network baseGoerli
```

You should see ≥0.05 ETH

---

## Step 2: Deploy Contracts (5 minutes)

### What you're doing:
Putting your smart contracts on the blockchain.

### Commands:
```bash
# Make sure you're in the project folder
cd /Users/abuzaid/Downloads/metamask-dashboard-search_feature_done/project

# Deploy to Base Goerli testnet
npx hardhat run scripts/deploy.ts --network baseGoerli
```

### What will happen:
```
Deploying contracts...
✅ PlatformTreasury deployed to: 0xABC123...
✅ CreatorToken Implementation deployed to: 0xDEF456...
✅ MetaTransactionForwarder deployed to: 0xGHI789...
✅ CreatorTokenFactory deployed to: 0xJKL012...
✅ AccessController deployed to: 0xMNO345...

Deployment complete! 🎉
```

### Important:
**COPY ALL THESE ADDRESSES!** You need them for the next step.

### Add addresses to .env:
```bash
# Open .env again
open .env
```

Add the addresses:
```
PLATFORM_TREASURY_ADDRESS=0xABC123...
CREATOR_TOKEN_IMPLEMENTATION_ADDRESS=0xDEF456...
CREATOR_TOKEN_FACTORY_ADDRESS=0xJKL012...
META_TRANSACTION_FORWARDER_ADDRESS=0xGHI789...
ACCESS_CONTROLLER_ADDRESS=0xMNO345...
```

### Update frontend config:
```bash
# Open the frontend config
open src/config/contracts.ts
```

Update with your addresses (same ones from above).

---

## Step 3: Run Frontend (1 minute)

### What you're doing:
Starting the web interface.

### Command:
```bash
npm run dev
```

### What you'll see:
```
VITE v5.x.x  ready in 500 ms

➜  Local:   http://localhost:5173/
```

### Open in browser:
1. Open your browser
2. Go to: http://localhost:5173
3. You should see the Creator-Tok platform!

---

## Step 4: Test It (5 minutes)

### Connect MetaMask

1. **Add Base Goerli to MetaMask:**
   - Network Name: `Base Goerli`
   - RPC URL: `https://goerli.base.org`
   - Chain ID: `84531`
   - Currency: `ETH`

2. **Import your test account:**
   - Use the same private key from your .env

3. **Connect in the app:**
   - Click "Connect Wallet"
   - Approve in MetaMask

### Create a Token

1. Go to "Creator Dashboard"
2. Fill in:
   - Name: Test Token
   - Symbol: TEST
   - Base Price: 0.01
   - Curve: 0.0001
   - Supply: 10000
3. Click "Create Token"
4. Approve in MetaMask
5. Wait ~10 seconds
6. Done! 🎉

---

## 🎉 SUCCESS!

If you got this far, your project is **FULLY RUNNING**!

You now have:
- ✅ Smart contracts deployed on Base Goerli
- ✅ Frontend running at http://localhost:5173
- ✅ Ability to create and trade tokens
- ✅ Full tokenization platform ready

---

## Quick Reference

### Terminal Commands
```bash
# Navigate to project
cd /Users/abuzaid/Downloads/metamask-dashboard-search_feature_done/project

# Check balance
node scripts/check-balance.cjs

# Deploy contracts
npx hardhat run scripts/deploy.ts --network baseGoerli

# Run frontend
npm run dev
```

### Links
- Frontend: http://localhost:5173
- Base Goerli Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Base Goerli Explorer: https://goerli.basescan.org

### Files to Edit
1. `.env` - Add private key and contract addresses
2. `src/config/contracts.ts` - Add contract addresses

---

## If Something Goes Wrong

### "Cannot find module"
```bash
npm install
```

### "Insufficient funds"
Get more testnet ETH from the faucet.

### "Port 5173 already in use"
```bash
lsof -ti:5173 | xargs kill -9
npm run dev
```

### "Compilation failed"
```bash
npx hardhat clean
npx hardhat compile
```

---

## Get More Help

- **Quick checklist**: `QUICK_START.md`
- **Detailed guide**: `HOW_TO_RUN.md`
- **Visual diagrams**: `FLOW_DIAGRAM.md`
- **Contract docs**: `CONTRACTS_README.md`

---

## Summary

```
┌─────────────────────────────────────────┐
│  Total Steps: 4                         │
│  Total Time: ~16 minutes                │
│  Difficulty: Easy ⭐⭐☆☆☆               │
│                                         │
│  What you get:                          │
│  ✓ Full tokenization platform           │
│  ✓ Running on Base Goerli testnet       │
│  ✓ Create unlimited creator tokens      │
│  ✓ Buy/sell functionality               │
│  ✓ Token-gated access control           │
│  ✓ Real-time pricing & analytics        │
│                                         │
│  Next: Test, iterate, launch! 🚀        │
└─────────────────────────────────────────┘
```

---

**You've got this! 💪**

Start with Step 1 above, and you'll be running in 15 minutes.
