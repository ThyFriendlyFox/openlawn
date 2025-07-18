#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables
require('dotenv').config();

console.log('🚀 Building for mobile with Capacitor...');

// Create a temporary environment file for the build
const envContent = `
// Auto-generated for mobile build - DO NOT COMMIT
export const mobileConfig = {
  firebase: {
    apiKey: "${process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''}",
    projectId: "${process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ''}",
    messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ''}",
    appId: "${process.env.FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''}",
    measurementId: "${process.env.FIREBASE_MEASUREMENT_ID || process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''}",
  },
  googleMaps: {
    apiKey: "${process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}",
  },
  googleAI: {
    apiKey: "${process.env.GOOGLE_AI_API_KEY || ''}",
  },
};
`;

// Write the mobile config file
fs.writeFileSync(path.join(__dirname, '../src/lib/mobile-config.ts'), envContent);

try {
  // Build the Next.js app
  console.log('📦 Building Next.js app...');
  execSync('npm run build', { stdio: 'inherit' });

  // Export the static files
  console.log('📤 Exporting static files...');
  execSync('npm run export', { stdio: 'inherit' });

  // Sync with Capacitor
  console.log('📱 Syncing with Capacitor...');
  execSync('npx cap sync', { stdio: 'inherit' });

  console.log('✅ Mobile build completed successfully!');
  console.log('📱 Next steps:');
  console.log('   - Run "npx cap open android" to open in Android Studio');
  console.log('   - Run "npx cap open ios" to open in Xcode');
  console.log('   - Or run "npx cap run android" to build and run on device');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} finally {
  // Clean up the temporary config file
  if (fs.existsSync(path.join(__dirname, '../src/lib/mobile-config.ts'))) {
    fs.unlinkSync(path.join(__dirname, '../src/lib/mobile-config.ts'));
  }
} 