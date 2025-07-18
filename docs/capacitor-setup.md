# Capacitor Setup Guide for OpenLawn

This guide explains how to handle API keys when exporting your OpenLawn app to mobile devices using Capacitor.

## Overview

Your app uses several API keys that need special handling for mobile deployment:

1. **Firebase Configuration** - Authentication, database, and storage
2. **Google Maps API** - Maps and geocoding services  
3. **Google AI (Genkit)** - AI-powered features

## Prerequisites

1. Install Capacitor CLI:
```bash
npm install -g @capacitor/cli
```

2. Install Capacitor core:
```bash
npm install @capacitor/core
```

## Step 1: Initialize Capacitor

```bash
npm run cap:init
```

This creates a `capacitor.config.ts` file with your app configuration.

## Step 2: Add Platform Support

For Android:
```bash
npm run cap:add:android
```

For iOS:
```bash
npm run cap:add:ios
```

## Step 3: Environment Variables Setup

### Option A: Environment File Approach (Recommended)

1. Create a `.env.mobile` file in your project root:
```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Google AI API
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

2. Add `.env.mobile` to your `.gitignore`:
```gitignore
.env.mobile
```

3. Use the build script:
```bash
npm run build:mobile
```

### Option B: Build-time Environment Variables

Set environment variables before building:

```bash
export FIREBASE_API_KEY="your_key"
export GOOGLE_MAPS_API_KEY="your_key"
export GOOGLE_AI_API_KEY="your_key"
npm run build:mobile
```

## Step 4: API Key Security Best Practices

### 1. Firebase API Keys
- Firebase API keys are **public** and safe to include in mobile apps
- Security is handled through Firebase Security Rules
- No additional protection needed

### 2. Google Maps API Keys
- **Restrict your API key** in Google Cloud Console:
  - Set application restrictions to "Android apps" and/or "iOS apps"
  - Add your app's bundle ID (e.g., `com.openlawn.app`)
  - Set API restrictions to only Maps JavaScript API and Directions API

### 3. Google AI API Keys
- **Keep these secure** - they should not be exposed in client-side code
- For mobile apps, consider:
  - Using a backend proxy service
  - Implementing server-side API calls
  - Using Firebase Functions as a backend

## Step 5: Build and Deploy

### Android
```bash
npm run build:mobile
npm run cap:open:android
```

### iOS
```bash
npm run build:mobile
npm run cap:open:ios
```

## Step 6: Platform-Specific Configuration

### Android Configuration

1. In `android/app/src/main/AndroidManifest.xml`, add permissions:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

2. For Google Maps, add your API key to `android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="your_google_maps_api_key" />
```

### iOS Configuration

1. In `ios/App/App/Info.plist`, add permissions:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to show your position on the map.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs location access to show your position on the map.</string>
```

2. For Google Maps, add your API key to `ios/App/App/AppDelegate.swift`:
```swift
import GoogleMaps

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        GMSServices.provideAPIKey("your_google_maps_api_key")
        return true
    }
}
```

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Check that the key is correctly set in environment variables
   - Verify API key restrictions in Google Cloud Console
   - Ensure billing is enabled for your Google Cloud project

2. **Build Failures**
   - Make sure all environment variables are set
   - Check that the build script has execute permissions: `chmod +x scripts/build-mobile.js`

3. **Maps Not Loading**
   - Verify Google Maps API key is correctly configured
   - Check that Maps JavaScript API is enabled
   - Ensure no network restrictions are blocking the API

### Debug Mode

To debug environment variables, add this to your app:

```typescript
// In development only
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase Config:', firebaseConfig);
  console.log('Google Maps Config:', googleMapsConfig);
}
```

## Security Checklist

- [ ] Firebase API keys are public (safe for mobile)
- [ ] Google Maps API key is restricted to your app bundle ID
- [ ] Google AI API key is not exposed in client-side code
- [ ] Environment files are in `.gitignore`
- [ ] API key restrictions are set in Google Cloud Console
- [ ] Billing is enabled for Google Cloud project

## Next Steps

1. Test your app on a physical device
2. Set up CI/CD for automated mobile builds
3. Configure app signing for production releases
4. Set up Firebase App Distribution for beta testing

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Firebase Mobile Setup](https://firebase.google.com/docs/flutter/setup)
- [Google Maps Platform](https://developers.google.com/maps/documentation/javascript/overview)
- [Google AI Platform](https://ai.google.dev/) 