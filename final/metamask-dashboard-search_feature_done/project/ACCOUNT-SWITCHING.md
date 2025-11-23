# 💼 Account Switching Guide

## 🎯 Problem Solved!
You want to use **Account 2** (which has ETH) instead of **Account 1** for transactions.

---

## ✅ Solution: Account Switcher Added!

### 🔘 New "Switch" Button
I've added a **blue "Switch" button** next to your wallet address in the Creator Dashboard header.

**Location:**
```
Top right of dashboard:
[Network Badge] [Switch Button] [Wallet Address] [Logout]
```

---

## 🚀 How to Switch Accounts

### Method 1: Use the Switch Button (NEW!)
1. Go to Creator Dashboard
2. Look at the top right
3. Click the **blue "Switch"** button next to your wallet address
4. MetaMask will open asking for permission
5. Click "Next" → Select **Account 2** (or any account with ETH)
6. Click "Connect"
7. Page will automatically reload with new account ✅

### Method 2: Direct in MetaMask
1. Open MetaMask extension
2. Click the account circle/icon at top
3. Select **Account 2** from the list
4. Page will automatically detect the change
5. Page reloads with new account ✅

---

## 🎨 What You'll See

**Before:**
```
Connected: 0x1234...5678 (Account 1 - no ETH)
```

**After Switching:**
```
Connected: 0x9abc...def0 (Account 2 - has ETH!)
```

---

## 🔄 Auto-Features

### ✅ Automatic Account Change Detection
- Platform listens for account changes
- When you switch in MetaMask, page auto-reloads
- New account is saved to localStorage
- All contracts reinitialize with new signer

### ✅ Permission Request
- Clicking "Switch" button requests MetaMask permissions
- You can select ANY connected account
- No need to disconnect/reconnect

### ✅ Balance Updates
- After switching, all ETH balances update
- Gas estimations use new account
- Transactions go from new account

---

## 📋 Step-by-Step Example

**Scenario:** You're on Account 1 (no ETH), want to use Account 2 (has ETH)

1. **Check Current Account**
   - Top right shows: "Connected: 0x1234...5678"
   - This is Account 1

2. **Click Switch Button**
   - Blue button says "Switch"
   - Click it

3. **MetaMask Opens**
   - Shows "Connect with MetaMask"
   - Shows all your accounts
   - Select Account 2 (check it has ETH balance)

4. **Confirm Selection**
   - Click "Next"
   - Click "Connect"

5. **Page Reloads**
   - Automatically refreshes
   - Now shows: "Connected: 0x9abc...def0"
   - This is Account 2!

6. **Create Token**
   - Fill token form
   - Click "Launch Token"
   - Transaction will use Account 2 (with ETH) ✅

---

## 💡 Tips

### Check Which Account Has ETH
**In MetaMask:**
1. Open MetaMask
2. Click account icon
3. See ETH balance under each account name
4. Example:
   - Account 1: 0 ETH ❌
   - Account 2: 0.5 ETH ✅ (Use this one!)

### Multiple Accounts
- You can switch between any accounts
- Each switch reloads the page
- Previous account's tokens remain in localStorage
- New account starts fresh

### No ETH in Any Account?
- Get free testnet ETH from Base Sepolia faucet
- Visit: https://www.alchemy.com/faucets/base-sepolia
- Enter your **Account 2** address
- Receive 0.1 ETH
- Then switch to Account 2 and create tokens!

---

## 🔐 Security

**Safe Account Switching:**
- ✅ Only you can switch accounts
- ✅ Requires MetaMask confirmation
- ✅ No private keys exposed
- ✅ Each account isolated
- ✅ Logout still clears everything

---

## 🎯 Quick Reference

| Action | Method |
|--------|--------|
| Switch to Account 2 | Click blue "Switch" button → Select Account 2 |
| Check current account | Look at wallet address display |
| Verify account has ETH | Open MetaMask → Check balance |
| Get testnet ETH | Use Base Sepolia faucet |
| Manual switch | Change in MetaMask → Auto-reload |

---

## 🐛 Troubleshooting

### Issue: "Switch" button does nothing
**Fix:** Make sure MetaMask is unlocked, then try again

### Issue: Still on old account after switching
**Fix:** Page should auto-reload. If not, manually refresh (F5)

### Issue: Can't see Account 2 in MetaMask
**Fix:** 
1. Open MetaMask
2. Click "Create Account" or "Import Account"
3. Add Account 2
4. Then use Switch button

### Issue: "Transaction failed - insufficient funds"
**Fix:**
1. Check you switched to Account 2
2. Verify Account 2 actually has ETH
3. If not, get testnet ETH from faucet

---

## ✨ Features Added

✅ **Switch Button** - One-click account switcher
✅ **Auto-Detection** - Listens for account changes
✅ **Auto-Reload** - Refreshes when account switches
✅ **Visual Feedback** - See current account address
✅ **Permission Flow** - Proper MetaMask permissions
✅ **Account List** - Shows all available accounts
✅ **Error Handling** - Clear error messages
✅ **Success Messages** - Confirms account switch

---

## 🎊 Ready to Use!

**Now you can:**
1. Click the blue "Switch" button
2. Select Account 2 (the one with ETH)
3. Create tokens successfully! 🚀

**No more "insufficient funds" errors!** ✅
