# Firebase Setup Guide for LawnRoute

This guide will help you set up Firebase for the LawnRoute lawn care CRM/ERP application with authentication and role-based access control.

## Prerequisites

1. A Google account
2. Node.js and npm installed
3. Firebase CLI installed (`npm install -g firebase-tools`)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `lawnroute-app` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to "Authentication" → "Get started"
2. Click "Sign-in method" tab
3. Enable "Email/Password" provider:
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"

## Step 2.5: Enable Analytics (Optional but Recommended)

1. In Firebase Console, go to "Analytics" → "Get started"
2. Click "Create data stream"
3. Select "Web app"
4. Enter your app name and URL
5. Copy the Measurement ID (G-XXXXXXXXXX format)
6. This will be used for tracking user behavior and app performance

## Step 3: Create Firestore Database

1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" (we'll add security rules later)
3. Select a location close to your users
4. Click "Done"

## Step 4: Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" → "Web"
4. Register app with name "LawnRoute Web"
5. Copy the configuration object
6. **Important**: Make sure to include the `measurementId` field if you enabled Analytics

## Step 5: Update Environment Variables

Add these to your `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Step 6: Deploy Firestore Security Rules

1. Initialize Firebase in your project:
   ```bash
   firebase login
   firebase init
   ```

2. Select:
   - Firestore
   - Use existing project
   - Select your project
   - Use `firestore.rules` as rules file
   - Use `firestore.indexes.json` as indexes file

3. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Step 7: Create Initial Admin User

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the app and register a new user with "admin" role
3. This user will have full access to manage the system

## Step 8: Set Up Firestore Collections

The app will automatically create these collections as needed:

- `users` - User profiles and roles
- `customers` - Customer information
- `routes` - Route data
- `services` - Service offerings
- `companies` - Company information
- `crews` - Crew assignments
- `billing` - Billing records
- `settings` - App settings

## Step 9: Configure Authentication Rules (Optional)

For additional security, you can set up custom claims for roles:

1. Go to Firebase Functions (if using)
2. Create a function to set custom claims based on user role
3. This provides additional security layer

## Role Hierarchy

The app uses a role-based access control system:

- **Admin (Level 3)**: Full access to all features
  - Manage users and roles
  - Access all data
  - Configure system settings
  - Delete records

- **Manager (Level 2)**: Operational access
  - Manage customers, routes, services
  - Access billing information
  - Manage crews
  - Cannot delete users or system settings

- **Employee (Level 1)**: Basic access
  - View customers and routes
  - Update customer information
  - Cannot access billing or user management

## Security Features

1. **Authentication Required**: All operations require valid authentication
2. **Role-Based Access**: Users can only access features appropriate to their role
3. **Data Isolation**: Users can only access data they're authorized to see
4. **Input Validation**: All data is validated before storage
5. **Secure Rules**: Firestore rules enforce access control at the database level

## Testing the Setup

1. Register a new user with "admin" role
2. Test login/logout functionality
3. Verify user profile displays correctly
4. Test role-based access to different features
5. Create some test customers to verify data persistence

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Check Firebase API key and configuration
2. **Permission Denied**: Verify Firestore rules are deployed correctly
3. **User Not Found**: Ensure user document is created in Firestore
4. **Role Access Issues**: Check user role in Firestore users collection

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are loaded
3. Check Firebase Console for authentication logs
4. Verify Firestore rules are active

## Analytics Benefits

With Firebase Analytics enabled, you'll be able to track:

### **User Behavior**
- **Login/Logout patterns**: Understand user engagement
- **Feature usage**: See which features are most popular
- **Page views**: Track navigation patterns
- **Error tracking**: Monitor app stability

### **Business Metrics**
- **Customer creation**: Track growth rate
- **Route optimization**: Monitor efficiency improvements
- **Service completion**: Track operational metrics
- **User roles**: Understand team usage patterns

### **Performance Insights**
- **Map load times**: Optimize map performance
- **Route calculation speed**: Monitor algorithm efficiency
- **App responsiveness**: Track user experience

## Next Steps

After setup, consider implementing:

1. **Email Verification**: Enable email verification for new users
2. **Password Reset**: Implement password reset functionality
3. **Social Login**: Add Google, Facebook, or other social providers
4. **Multi-factor Authentication**: Add 2FA for additional security
5. **Audit Logging**: Track user actions for compliance
6. **Backup Strategy**: Set up automated backups for critical data

## Production Considerations

1. **Custom Domain**: Set up custom domain for authentication
2. **SSL Certificate**: Ensure HTTPS is enforced
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Monitoring**: Set up Firebase Performance Monitoring
5. **Analytics**: Configure Firebase Analytics for user insights
6. **Backup**: Set up automated database backups

## Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- [Firebase Community](https://firebase.google.com/community)

For app-specific issues, check the project documentation or create an issue in the repository. 