# Firestore Setup Guide

This guide will help you fix the "Missing or insufficient permissions" error and set up Firestore properly.

## 🔧 **Quick Fix for Permission Error**

### **Option 1: Deploy Security Rules (Recommended)**

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not done already):
   ```bash
   npm run firebase:init
   ```
   - Select your project
   - Choose Firestore and Hosting
   - Use the default settings

4. **Deploy the security rules**:
   ```bash
   npm run firebase:deploy:rules
   ```

### **Option 2: Temporary Test Rules (Development Only)**

If you want to test quickly, you can temporarily allow all access in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules**
4. Replace the rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
5. Click **Publish**

⚠️ **Warning**: This allows any authenticated user to access all data. Only use for testing!

## 🏗️ **Complete Setup**

### **1. Firebase Project Setup**

1. **Create a Firebase project** (if not done):
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Authentication**:
   - Go to **Authentication** → **Sign-in method**
   - Enable **Email/Password**
   - Save

3. **Create Firestore Database**:
   - Go to **Firestore Database**
   - Click "Create database"
   - Choose **Start in test mode** (for development)
   - Select a location close to your users

### **2. Security Rules Explanation**

The rules in `firestore.rules` ensure:

- **Users can only access their own data**
- **Authentication is required for all operations**
- **Data is protected by user ID**

```javascript
// Example: Users can only read/write their own customers
match /customers/{customerId} {
  allow read, write: if request.auth != null && 
    request.auth.uid == resource.data.createdBy;
}
```

### **3. Deploy Everything**

```bash
# Deploy security rules
npm run firebase:deploy:rules

# Deploy the entire app (when ready)
npm run firebase:deploy
```

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **"Permission denied" error**:
   - Make sure you've deployed the security rules
   - Check that the user is authenticated
   - Verify the user ID matches the `createdBy` field

2. **"Firebase not initialized" error**:
   - Check your environment variables
   - Make sure Firebase config is correct

3. **"Collection doesn't exist" error**:
   - This is normal for new users
   - Collections are created automatically when first document is added

### **Debug Steps:**

1. **Check Firebase Console**:
   - Go to **Firestore Database** → **Data**
   - Verify collections are being created

2. **Check Authentication**:
   - Go to **Authentication** → **Users**
   - Verify users are being created

3. **Check Rules**:
   - Go to **Firestore Database** → **Rules**
   - Verify rules are deployed correctly

### **Testing with Emulators:**

For local development, you can use Firebase emulators:

```bash
# Start emulators
npm run firebase:emulators

# Update your .env.local to use emulators
NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true
```

## 📋 **Security Best Practices**

1. **Never use test mode in production**
2. **Always validate data on the server**
3. **Use specific rules for each collection**
4. **Regularly audit your security rules**
5. **Test rules thoroughly before deployment**

## 🚀 **Next Steps**

After fixing the permissions:

1. **Test the app** - Sign up and add customers
2. **Verify data** - Check Firebase Console
3. **Deploy to production** - Use proper security rules
4. **Set up monitoring** - Enable Firebase Analytics

## 📞 **Need Help?**

If you're still having issues:

1. Check the [Firebase Documentation](https://firebase.google.com/docs/firestore/security/get-started)
2. Review the [Security Rules Reference](https://firebase.google.com/docs/rules)
3. Use the [Firebase Console](https://console.firebase.google.com/) to debug 