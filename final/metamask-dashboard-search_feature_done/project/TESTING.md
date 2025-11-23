# 🧪 Testing Guide - Creator-Tok Platform

## Quick Test Flow (5 minutes)

### ✅ Test 1: Homepage Features
1. Open http://localhost:5173
2. **Check**: Beautiful lamp animation loads at top
3. **Scroll down**: See 3D Spline interactive scene
4. **Scroll more**: Token Growth chart displays
5. **Find YouTuber section**: Two buttons "Search YouTubers" and "Dashboard"

### ✅ Test 2: YouTuber Search
1. Click "Search YouTubers" button (should be selected by default)
2. Type in search box: "MrBeast" or any channel name
3. **Check**: Loading spinner appears
4. **Check**: Results display with channel cards
5. Click on any channel card
6. **Check**: Dashboard button becomes active
7. **Check**: Full channel dashboard loads with stats and charts

### ✅ Test 3: Navigation Back
1. While viewing a YouTuber dashboard
2. Click the back arrow (← icon) at top
3. **Check**: Returns to search view
4. Previous search query should still be there

### ✅ Test 4: Login Flow
1. Click "Get Started" button (top right or in hero section)
2. **Check**: Redirects to /login page
3. See three tabs: Login, Sign Up, Creator
4. Click "Creator" tab
5. Click "Continue as Creator" button
6. **Check**: MetaMask popup appears

### ✅ Test 5: Wallet Connection
1. MetaMask popup should show
2. If not installed: Error message "MetaMask not detected!"
3. If installed: Approve connection
4. **Check**: Redirects to /creator-dashboard

### ✅ Test 6: Creator Dashboard
1. After connecting wallet
2. **Check**: Top shows "Connected: 0x1234...5678" with wallet icon
3. **Check**: Two tabs: "My Tokens" and "Launch Token"
4. Click "Launch Token" tab

### ✅ Test 7: Token Launch
1. Fill out the form:
   - **Token Name**: "Test Token"
   - **Token Symbol**: "TEST"
   - **Initial Supply**: "1000000"
   - **Base Price (USD)**: "0.01"
2. Click "Launch Token" button
3. **Check**: MetaMask popup for transaction
4. **Check**: Verify you're on Base Sepolia network (Chain ID: 84532)
5. Approve transaction
6. **Wait**: Transaction processes (10-30 seconds)
7. **Check**: Success message "Token launched successfully!"
8. **Check**: Token appears in "My Tokens" tab

### ✅ Test 8: Token Persistence
1. After launching a token
2. **Refresh the page** (F5 or Cmd+R)
3. **Check**: Token still appears in "My Tokens"
4. **Check**: Wallet still connected
5. Click "View on Explorer" link
6. **Check**: Opens Basescan in new tab

### ✅ Test 9: Logout
1. Click "Logout" button (top right)
2. **Check**: Redirects to /login
3. **Check**: Session cleared
4. Try to visit /creator-dashboard directly
5. **Check**: Redirects back to /login

### ✅ Test 10: Responsive Design
1. Open browser DevTools (F12)
2. Click device toolbar (mobile view)
3. Test on different sizes:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)
4. **Check**: Everything scales properly

---

## 🐛 Common Issues & Fixes

### Issue: White Screen
**Fix**: 
```bash
cd project
npm run dev
```
Refresh browser at http://localhost:5173

### Issue: MetaMask Not Connecting
**Fix**:
1. Ensure MetaMask extension is installed
2. Click MetaMask icon
3. Unlock wallet
4. Try connecting again

### Issue: Wrong Network
**Fix**:
1. Open MetaMask
2. Click network dropdown
3. Select "Base Sepolia" 
4. If not in list: Add network manually
   - Network Name: Base Sepolia
   - RPC URL: https://sepolia.base.org
   - Chain ID: 84532
   - Currency Symbol: ETH
   - Block Explorer: https://sepolia.basescan.org

### Issue: Transaction Fails - Insufficient Funds
**Fix**:
- Get free testnet ETH from Base Sepolia faucet
- Visit: https://www.alchemy.com/faucets/base-sepolia
- Enter your wallet address
- Receive 0.1 ETH

### Issue: "process is not defined" Error
**Fix**: Already fixed! Check:
1. `vite.config.ts` has `define: { 'process.env': {} }`
2. All env vars use `import.meta.env.VITE_*` syntax

### Issue: YouTube Search Not Working
**Fix**:
- Check browser console for API errors
- Verify internet connection
- API has rate limits - wait a minute and try again

---

## 📊 Expected Results

### Homepage
- ✅ Lamp animation loads in < 2 seconds
- ✅ 3D Spline scene loads in < 5 seconds
- ✅ Charts render immediately
- ✅ Search returns results in < 2 seconds

### Token Launch
- ✅ Form validation shows errors immediately
- ✅ MetaMask popup opens within 1 second
- ✅ Transaction confirms in 10-30 seconds
- ✅ Token appears in dashboard immediately after confirmation

### Wallet Connection
- ✅ MetaMask detects correctly
- ✅ Connection takes < 3 seconds
- ✅ Address displays in formatted form
- ✅ Session persists across page refreshes

---

## 🎯 Feature Checklist

Mark each as you test:

**Homepage**
- [ ] LampDemo animation works
- [ ] 3D Spline scene interactive
- [ ] Token chart displays data
- [ ] Search/Dashboard toggle works
- [ ] Get Started button navigates

**YouTuber Features**
- [ ] Search input functional
- [ ] Results display with images
- [ ] Channel selection works
- [ ] Dashboard shows stats
- [ ] Charts render properly
- [ ] Back button works

**Wallet & Auth**
- [ ] MetaMask detection works
- [ ] Wallet connects successfully
- [ ] Address displays correctly
- [ ] Session persists
- [ ] Logout clears session
- [ ] Protected routes redirect

**Token Management**
- [ ] Form accepts input
- [ ] Validation catches errors
- [ ] Transaction creates token
- [ ] Token displays in list
- [ ] Tokens persist on refresh
- [ ] Explorer links work

**UI/UX**
- [ ] Responsive on mobile
- [ ] Loading states show
- [ ] Error messages clear
- [ ] Success feedback appears
- [ ] Animations smooth
- [ ] Icons display correctly

---

## 🚀 Production Readiness

Before deploying to production:

1. **Environment Variables**: Update to mainnet addresses
2. **API Keys**: Use production YouTube API key
3. **Network**: Change to Base Mainnet (chainId: 8453)
4. **Testing**: Complete full regression test
5. **Security**: Audit smart contracts
6. **Performance**: Optimize bundle size
7. **Monitoring**: Set up error tracking (Sentry)
8. **Analytics**: Add Google Analytics or similar

---

## 📸 Screenshot Points

Take screenshots at these moments:
1. Homepage with lamp effect
2. 3D Spline scene
3. YouTuber search results
4. YouTuber dashboard with charts
5. Login page
6. MetaMask connection
7. Creator dashboard
8. Token launch form
9. Successful token creation
10. Token card in dashboard

---

## 🎉 Success Criteria

All features tested = ✅ **FULLY FUNCTIONAL PROJECT**

The platform is complete when:
- ✅ All pages load without errors
- ✅ Wallet connects properly
- ✅ Search returns real data
- ✅ Tokens can be launched
- ✅ Data persists correctly
- ✅ UI is responsive
- ✅ Error handling works
- ✅ No console errors

**Your platform is ready! 🚀**
