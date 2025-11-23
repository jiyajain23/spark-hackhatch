/**
 * Quick script to check if Firebase environment variables are set
 * Run with: node check-firebase-config.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '.env');
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

console.log('🔍 Checking Firebase configuration...\n');

if (!existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('\n📝 To fix this:');
  console.log('1. Create a .env file in the project root');
  console.log('2. Add your Firebase configuration variables');
  console.log('3. See FIREBASE_SETUP.md for detailed instructions\n');
  process.exit(1);
}

try {
  const envContent = readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  const missing = [];
  const invalid = [];

  requiredVars.forEach(varName => {
    const value = envVars[varName];
    if (!value) {
      missing.push(varName);
    } else if (value.includes('your-') || value === '') {
      invalid.push(varName);
    }
  });

  if (missing.length === 0 && invalid.length === 0) {
    console.log('✅ All Firebase environment variables are set correctly!\n');
    console.log('📋 Current configuration:');
    requiredVars.forEach(varName => {
      const value = envVars[varName];
      // Mask sensitive parts of the API key
      if (varName === 'VITE_FIREBASE_API_KEY') {
        const masked = value.length > 10 
          ? value.substring(0, 10) + '...' + value.substring(value.length - 4)
          : '***';
        console.log(`   ${varName}: ${masked}`);
      } else {
        console.log(`   ${varName}: ${value}`);
      }
    });
    console.log('\n✨ You\'re ready to use Firebase authentication!');
  } else {
    if (missing.length > 0) {
      console.error('❌ Missing environment variables:');
      missing.forEach(varName => console.error(`   - ${varName}`));
    }
    if (invalid.length > 0) {
      console.error('❌ Invalid/placeholder values found:');
      invalid.forEach(varName => console.error(`   - ${varName} (still has placeholder value)`));
    }
    console.log('\n📝 To fix this:');
    console.log('1. Open your .env file');
    console.log('2. Replace placeholder values with your actual Firebase credentials');
    console.log('3. Get your credentials from Firebase Console > Project Settings > General');
    console.log('4. See FIREBASE_SETUP.md for detailed instructions\n');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error reading .env file:', error.message);
  process.exit(1);
}

