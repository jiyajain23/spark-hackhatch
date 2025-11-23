# 🌐 Network Switching Guide

## Problem: Wrong Network Error

If you see this error:
```
Failed to initialize contracts: Error: Unsupported chain ID: 43113
```

Or:
```
Wrong network! You're on chain ID 43113
```

**You're on the wrong blockchain network!**

---

## ✅ Solution: Switch to Base Sepolia

### Method 1: Automatic Switch (Recommended)
1. The error message will now show a **"Switch to Base Sepolia"** button
2. Click the button
3. MetaMask will prompt you to:
   - Switch network (if you already have Base Sepolia)
   - OR Add network (if you don't have it yet)
4. Approve the prompt
5. Page will auto-reload on the correct network ✅

### Method 2: Manual Switch in MetaMask
1. Open MetaMask extension
2. Click the network dropdown at the top
3. Look for "Base Sepolia"
4. If you don't see it, scroll down and click "Add Network"
5. Click "Add a network manually"
6. Enter these details:

```
Network Name: Base Sepolia
RPC URL: https://sepolia.base.org
Chain ID: 84532
Currency Symbol: ETH
Block Explorer: https://sepolia.basescan.org
```

7. Click "Save"
8. Select "Base Sepolia" from the network dropdown
9. Refresh the page

---

## 🔍 How to Check Your Current Network

### In the Dashboard:
- Look at the top right of the Creator Dashboard
- You'll see a colored badge showing your current network:
  - 🟢 **Green "Base Sepolia ✓"** = Correct network!
  - 🔴 **Red "Avalanche Fuji (Wrong!)"** = Wrong network!
  - 🔴 **Red "Chain XXX (Wrong!)"** = Wrong network!

### In MetaMask:
- Open MetaMask
- Look at the top - it shows the current network name
- Should say "Base Sepolia"

---

## 📋 Supported Networks

| Network | Chain ID | Status | Purpose |
|---------|----------|--------|---------|
| **Base Sepolia** | 84532 | ✅ Active | Testnet (Use this!) |
| Base Mainnet | 8453 | ⚪ Configured | Production (Future) |
| Localhost | 31337 | ⚪ Configured | Development |
| Avalanche Fuji | 43113 | ❌ Unsupported | Wrong network |
| Ethereum | 1 | ❌ Unsupported | Wrong network |

---

## 🚨 Common Network Issues

### Issue: "Wrong network detected!"
**Fix:** Click the "Switch to Base Sepolia" button or manually switch in MetaMask

### Issue: "MetaMask not detected"
**Fix:** 
1. Install MetaMask extension
2. Refresh the page

### Issue: Network keeps reverting back
**Fix:**
1. Make sure you clicked "Switch" in MetaMask
2. Some dApps may force a network - our app will show an error if wrong
3. The page will auto-reload when you switch networks

### Issue: Can't add Base Sepolia network
**Fix:**
1. Update MetaMask to latest version
2. Try adding manually using the details above
3. Clear browser cache and try again

---

## 💡 Why Base Sepolia?

- **Free Testnet**: No real money involved
- **Get Test ETH**: Free from faucets
- **All Contracts Deployed Here**: 
  - Factory: `0x4a27c5b2e55C55AEf40D288be0eAcAa9180CAfcE`
  - Treasury: `0x384401EE4cB249471e25F7c020D49F1013AB5572`
  - USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Safe for Testing**: Can experiment without risk

---

## 🎯 Quick Steps to Fix

1. See error message in dashboard
2. Click "Switch to Base Sepolia" button  
3. Approve in MetaMask
4. Page reloads automatically
5. See green "Base Sepolia ✓" badge
6. Create tokens! 🚀

---

## 🔄 Auto-Detection Features

The platform now:
- ✅ Detects your current network automatically
- ✅ Shows colored indicator (green=correct, red=wrong)
- ✅ Displays helpful error messages
- ✅ Provides one-click switch button
- ✅ Auto-reloads after network change
- ✅ Prevents token creation on wrong network

---

## 🎉 Success!

When you see:
- 🟢 Green badge: "Base Sepolia ✓"
- No error messages
- Token form is enabled

**You're ready to create tokens!** 🚀
