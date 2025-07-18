#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 OpenLawn Environment Setup\n');

// Check if env.example exists
const examplePath = path.join(__dirname, '../env.example');
if (!fs.existsSync(examplePath)) {
  console.error('❌ env.example file not found!');
  process.exit(1);
}

// Function to ask for input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to create environment file
async function createEnvFile() {
  console.log('📝 Setting up environment variables...\n');
  
  const envType = await askQuestion('Which environment file do you want to create?\n1. .env.local (for local development)\n2. .env.mobile (for mobile builds)\n3. Both\nEnter choice (1-3): ');
  
  let targetFiles = [];
  switch (envType.trim()) {
    case '1':
      targetFiles = ['.env.local'];
      break;
    case '2':
      targetFiles = ['.env.mobile'];
      break;
    case '3':
      targetFiles = ['.env.local', '.env.mobile'];
      break;
    default:
      console.log('❌ Invalid choice. Exiting...');
      rl.close();
      return;
  }

  // Read the example file
  let envContent = fs.readFileSync(examplePath, 'utf8');
  
  // Ask for API keys
  console.log('\n🔑 Please provide your API keys:\n');
  
  const firebaseApiKey = await askQuestion('Firebase API Key: ');
  const firebaseAuthDomain = await askQuestion('Firebase Auth Domain (e.g., your-project.firebaseapp.com): ');
  const firebaseProjectId = await askQuestion('Firebase Project ID: ');
  const firebaseStorageBucket = await askQuestion('Firebase Storage Bucket (e.g., your-project.appspot.com): ');
  const firebaseMessagingSenderId = await askQuestion('Firebase Messaging Sender ID: ');
  const firebaseAppId = await askQuestion('Firebase App ID: ');
  const firebaseMeasurementId = await askQuestion('Firebase Measurement ID (optional, for analytics): ');
  const googleMapsApiKey = await askQuestion('Google Maps API Key: ');
  const googleAiApiKey = await askQuestion('Google AI API Key: ');

  // Replace placeholders with actual values
  envContent = envContent
    .replace(/your_firebase_api_key_here/g, firebaseApiKey)
    .replace(/your_project_id\.firebaseapp\.com/g, firebaseAuthDomain)
    .replace(/your_project_id/g, firebaseProjectId)
    .replace(/your_project_id\.appspot\.com/g, firebaseStorageBucket)
    .replace(/123456789012/g, firebaseMessagingSenderId)
    .replace(/1:123456789012:web:abcdef1234567890/g, firebaseAppId)
    .replace(/G-XXXXXXXXXX/g, firebaseMeasurementId || 'G-XXXXXXXXXX')
    .replace(/your_google_maps_api_key_here/g, googleMapsApiKey)
    .replace(/your_google_ai_api_key_here/g, googleAiApiKey);

  // Create the files
  for (const file of targetFiles) {
    const filePath = path.join(__dirname, '..', file);
    fs.writeFileSync(filePath, envContent);
    console.log(`✅ Created ${file}`);
  }

  console.log('\n🎉 Environment setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Start development server: npm run dev');
  console.log('2. For mobile builds: npm run build:mobile');
  console.log('3. Check the docs/capacitor-setup.md for mobile deployment');
  
  rl.close();
}

// Run the setup
createEnvFile().catch(console.error); 