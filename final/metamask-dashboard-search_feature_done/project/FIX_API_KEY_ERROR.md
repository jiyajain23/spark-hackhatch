# Quick Fix: Firebase API Key Error

## Error Message
```
Google sign-in failed: Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

## Solution (5 Steps)

### Step 1: Create .env File
Create a file named `.env` in the `project` folder (same folder as `package.json`)

### Step 2: Get Your Firebase Config
1. Go to https://console.firebase.google.com/
2. Select your project (or create one)
3. Click ⚙️ (gear icon) → **Project settings**
4. Scroll to **"Your apps"** section
5. If no web app exists, click **Web icon (`</>`)** and register your app
6. Copy the config values shown

### Step 3: Add to .env File
Create/update `.env` file with these variables (replace with YOUR actual values):

```env
VITE_FIREBASE_API_KEY=AIzaSy...your-actual-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**Important:** 
- All variables MUST start with `VITE_`
- Use your REAL values from Firebase Console (not placeholders)
- No quotes around the values
- No spaces around the `=` sign

### Step 4: Restart Dev Server
**This is critical!** Environment variables are only loaded when the server starts.

1. Stop your current server (press `Ctrl+C` in terminal)
2. Start it again: `npm run dev`

### Step 5: Test Again
Try the Google sign-in button again. The error should be gone!

## Still Not Working?

### Check 1: Verify .env File Location
Make sure `.env` is in the correct location:
```
project/
  ├── .env          ← Should be here
  ├── package.json
  ├── src/
  └── ...
```

### Check 2: Verify Variable Names
All must start with `VITE_`:
- ✅ `VITE_FIREBASE_API_KEY`
- ❌ `FIREBASE_API_KEY` (missing VITE_)

### Check 3: Check for Typos
- No extra spaces
- No quotes
- Correct spelling

### Check 4: Verify Values
- Open Firebase Console
- Go to Project Settings
- Compare your `.env` values with the config shown there
- Make sure they match exactly

### Check 5: Browser Console
Open browser DevTools (F12) → Console tab
- Look for any additional error messages
- Check if environment variables are being loaded

## Example .env File

Here's what a complete `.env` file should look like (with example values):

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC_Example1234567890abcdefghijklmnop
VITE_FIREBASE_AUTH_DOMAIN=my-awesome-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-awesome-project
VITE_FIREBASE_STORAGE_BUCKET=my-awesome-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef
```

## Need More Help?

See `FIREBASE_SETUP.md` for detailed setup instructions.

