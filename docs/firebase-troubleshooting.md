# Firebase Troubleshooting Guide

## Common Error: `auth/configuration-not-found`

This error typically occurs when Firebase Authentication isn't properly configured. Here's how to fix it:

### Step 1: Verify Firebase Project Setup

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `openlawn`
3. **Check project status**: Ensure the project is active and not suspended

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable **Email/Password** provider:
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"

### Step 3: Verify Web App Registration

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Verify your web app is listed
4. If not, click **Add app** → **Web**
5. Register with name: `LawnRoute Web`
6. Copy the new configuration

### Step 4: Check Authorized Domains

1. In **Authentication** → **Settings** → **Authorized domains**
2. Add your development domain: `localhost`
3. Add your production domain when ready

### Step 5: Verify Environment Variables

Ensure your `.env.local` has all required variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=openlawn.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=openlawn
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=openlawn.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=485563503084
NEXT_PUBLIC_FIREBASE_APP_ID=1:485563503084:web:2253094eb86120695330c9
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-HWNCNMDENH
```

### Step 6: Enable Firestore Database

1. Go to **Firestore Database**
2. If not created, click **Create database**
3. Choose **Start in test mode**
4. Select a location close to your users

### Step 7: Test Configuration

1. Restart your development server
2. Open browser console
3. Look for Firebase debug messages
4. Check for any error messages

## Other Common Issues

### Issue: "Permission denied" errors
**Solution**: Deploy Firestore security rules
```bash
firebase deploy --only firestore:rules
```

### Issue: "API key not valid"
**Solution**: 
1. Check if API key is correct
2. Ensure the key is for the right project
3. Verify the key hasn't been restricted

### Issue: "Project not found"
**Solution**:
1. Verify project ID is correct
2. Check if you have access to the project
3. Ensure the project is active

### Issue: "Domain not authorized"
**Solution**:
1. Add `localhost` to authorized domains
2. Add your production domain
3. Wait a few minutes for changes to propagate

## Debug Steps

1. **Check browser console** for detailed error messages
2. **Verify environment variables** are loaded correctly
3. **Test Firebase connection** using the built-in test
4. **Check Firebase Console** for any project issues
5. **Verify network connectivity** to Firebase services

## Getting Help

If issues persist:

1. **Check Firebase Status**: https://status.firebase.google.com/
2. **Firebase Documentation**: https://firebase.google.com/docs
3. **Firebase Support**: https://firebase.google.com/support
4. **Stack Overflow**: Search for similar issues

## Quick Fix Checklist

- [ ] Authentication enabled in Firebase Console
- [ ] Web app properly registered
- [ ] Environment variables set correctly
- [ ] Authorized domains configured
- [ ] Firestore database created
- [ ] Development server restarted
- [ ] Browser cache cleared 