# Firebase Google Sign-In Setup Guide

This guide will help you set up Google sign-in using Firebase for your application.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Enable Google Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started** if you haven't enabled Authentication yet
3. Click on the **Sign-in method** tab
4. Click on **Google** from the list of providers
5. Toggle **Enable** to ON
6. Enter your project's support email
7. Click **Save**

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll down to the "Your apps" section
4. If you don't have a web app yet:
   - Click the **Web** icon (`</>`)
   - Register your app with a nickname (e.g., "Creator-Tok Web")
   - Click **Register app**
5. Copy the Firebase configuration object values

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace the placeholder values with your Firebase config:
   ```
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

## Step 5: Configure Authorized Domains

1. In Firebase Console, go to **Authentication** > **Settings**
2. Scroll to **Authorized domains**
3. Add your development domain (e.g., `localhost`) if not already present
4. Add your production domain when deploying

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login page
3. Click "Continue with Google"
4. You should see the Google sign-in popup

## Troubleshooting

### Error: "Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)"

This error means your Firebase API key is missing or invalid. Follow these steps:

1. **Check if .env file exists:**
   - Make sure you have a `.env` file in the `project` folder (same level as `package.json`)
   - If it doesn't exist, create it

2. **Verify your environment variables:**
   - Open your `.env` file
   - Make sure all variables start with `VITE_` prefix
   - Check that `VITE_FIREBASE_API_KEY` has a real value (not "your-api-key")

3. **Get your Firebase credentials:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Click the gear icon ⚙️ > **Project settings**
   - Scroll to "Your apps" section
   - Click on your web app (or create one if you haven't)
   - Copy the `apiKey` value from the config object

4. **Update your .env file:**
   ```
   VITE_FIREBASE_API_KEY=AIzaSy...your-actual-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

5. **Restart your dev server:**
   - Stop your current `npm run dev` process (Ctrl+C)
   - Start it again: `npm run dev`
   - **Important:** Vite only reads environment variables when the server starts

6. **Verify configuration:**
   - Run: `node check-firebase-config.js` (if you have Node.js)
   - Or manually check that all values in `.env` are real, not placeholders

### Error: "Firebase: Error (auth/unauthorized-domain)"
- Make sure your domain is added to the authorized domains list in Firebase Console
- Go to Authentication > Settings > Authorized domains
- Add `localhost` for development

### Google Sign-In Popup Blocked
- Make sure popups are not blocked in your browser
- Check browser console for any errors

## Security Notes

- Never commit your `.env` file to version control
- The `.env.example` file is safe to commit (it contains no real credentials)
- For production, set environment variables in your hosting platform (Vercel, Netlify, etc.)

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Google Sign-In Setup](https://firebase.google.com/docs/auth/web/google-signin)

