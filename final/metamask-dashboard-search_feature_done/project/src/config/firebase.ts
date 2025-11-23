import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration
// Get these from Firebase Console > Project Settings > General > Your apps
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

// Validate that all required environment variables are set
const missingVars: string[] = [];
if (!apiKey || apiKey === 'your-api-key') missingVars.push('VITE_FIREBASE_API_KEY');
if (!authDomain || authDomain === 'your-project.firebaseapp.com') missingVars.push('VITE_FIREBASE_AUTH_DOMAIN');
if (!projectId || projectId === 'your-project-id') missingVars.push('VITE_FIREBASE_PROJECT_ID');
if (!storageBucket || storageBucket === 'your-project.appspot.com') missingVars.push('VITE_FIREBASE_STORAGE_BUCKET');
if (!messagingSenderId || messagingSenderId === 'your-sender-id') missingVars.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
if (!appId || appId === 'your-app-id') missingVars.push('VITE_FIREBASE_APP_ID');

if (missingVars.length > 0) {
  const errorMessage = `Missing or invalid Firebase configuration. Please set the following environment variables in your .env file:\n${missingVars.join('\n')}\n\nSee FIREBASE_SETUP.md for instructions.`;
  console.error(errorMessage);
  // Don't throw here, let Firebase throw a more specific error when trying to use auth
}

const firebaseConfig = {
  apiKey: apiKey || '',
  authDomain: authDomain || '',
  projectId: projectId || '',
  storageBucket: storageBucket || '',
  messagingSenderId: messagingSenderId || '',
  appId: appId || ''
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  throw new Error('Firebase initialization failed. Please check your .env file and ensure all Firebase configuration values are set correctly.');
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;

