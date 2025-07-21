# Vercel Deployment Guide

This guide will help you deploy your OpenLawn application to Vercel successfully.

## Prerequisites

1. A Vercel account
2. Firebase project configured
3. Google Cloud project with APIs enabled
4. Google AI Studio API key

## Environment Variables Setup

### 1. Firebase Configuration

You need to set these environment variables in your Vercel project settings:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**How to get these values:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Copy the configuration values

### 2. Google Maps API

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**How to get this:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to APIs & Services > Credentials
4. Create a new API key or use an existing one
5. Enable these APIs for the key:
   - Maps JavaScript API
   - Directions API
   - Geocoding API

### 3. Google AI API (for Genkit)

```
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

**How to get this:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key value

## Deployment Steps

### 1. Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project settings

### 2. Set Environment Variables

1. In your Vercel project dashboard, go to Settings > Environment Variables
2. Add each environment variable listed above
3. Make sure to set them for all environments (Production, Preview, Development)

### 3. Build Configuration

The project is already configured with:
- TypeScript build errors ignored (for development)
- ESLint errors ignored during builds
- Proper handling of external packages

### 4. Deploy

1. Push your changes to GitHub
2. Vercel will automatically trigger a new deployment
3. Monitor the build logs for any issues

## Troubleshooting

### Common Issues

1. **Firebase API Key Error**
   - Ensure all Firebase environment variables are set correctly
   - Check that the API key is valid and not restricted

2. **OpenTelemetry Module Not Found**
   - This has been fixed by adding the required dependencies
   - The build should now complete successfully

3. **Google Maps Not Loading**
   - Verify the Google Maps API key is set
   - Check that the required APIs are enabled
   - Ensure the key has proper domain restrictions

4. **Build Failures**
   - Check the build logs in Vercel dashboard
   - Verify all environment variables are set
   - Ensure the repository is properly connected

### Environment Variable Checklist

Before deploying, verify these are set in Vercel:

- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- [ ] `GOOGLE_AI_API_KEY`

## Security Notes

1. **Firebase API Keys**: These are safe to expose in client-side code
2. **Google Maps API Key**: Should be restricted to your domains
3. **Google AI API Key**: Should be kept secure (consider using a backend proxy for production)

## Post-Deployment

1. Test all functionality on the deployed site
2. Check that Firebase authentication works
3. Verify Google Maps integration
4. Test the AI features (if applicable)

## Support

If you encounter issues:
1. Check the Vercel build logs
2. Verify all environment variables are set
3. Test locally with the same environment variables
4. Check the browser console for client-side errors 