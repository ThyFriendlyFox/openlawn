# LawnRoute Setup & Installation Guide

## 🚀 **Quick Start**

This guide will walk you through setting up LawnRoute for development and production deployment.

## 📋 **Prerequisites**

### **Required Software**
- **Node.js** 18.17 or higher
- **npm** 9.0 or higher
- **Git** for version control
- **Code editor** (VS Code recommended)

### **Required Accounts**
- **Google Cloud Console** account
- **Firebase** project
- **Vercel** account (for deployment)

## 🛠️ **Development Setup**

### **1. Clone the Repository**

```bash
git clone <repository-url>
cd vie-app
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Environment Configuration**

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Google AI (Gemini)
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### **4. Start Development Server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔥 **Firebase Setup**

### **1. Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `lawnroute-app`
4. Enable Google Analytics (recommended)
5. Choose analytics account or create new

### **2. Enable Authentication**

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Add your domain to **Authorized domains**

### **3. Create Firestore Database**

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select location closest to your users

### **4. Configure Security Rules**

Update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Customers - role-based access
    match /customers/{customerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager']);
    }
    
    // Routes - role-based access
    match /routes/{routeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager']);
    }
  }
}
```

### **5. Get Firebase Configuration**

1. Go to **Project settings**
2. Scroll to **Your apps** section
3. Click **Add app** → **Web**
4. Register app and copy configuration
5. Add to your `.env.local` file

## 🗺️ **Google Maps API Setup**

### **1. Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable billing (required for API usage)

### **2. Enable Required APIs**

Enable these APIs in Google Cloud Console:

- **Maps JavaScript API**
- **Geocoding API**
- **Directions API**
- **Distance Matrix API**
- **Places API**

### **3. Create API Key**

1. Go to **APIs & Services** → **Credentials**
2. Click **Create credentials** → **API key**
3. Restrict the key to:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Directions API**
   - **Distance Matrix API**
   - **Places API**
4. Add your domain to **Application restrictions**

### **4. Add to Environment**

Add your API key to `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## 🤖 **Google AI (Gemini) Setup**

### **1. Enable Gemini API**

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key for Gemini
3. Copy the API key

### **2. Add to Environment**

```env
GOOGLE_AI_API_KEY=your_gemini_api_key_here
```

## 🚀 **Production Deployment**

### **1. Vercel Deployment (Recommended)**

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```

3. **Configure Environment Variables**:
   - Go to Vercel dashboard
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - Add all variables from `.env.local`

### **2. Alternative: Manual Deployment**

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

## 🔧 **Configuration Options**

### **Customizing the App**

#### **Company Information**
Update company details in `src/lib/data.ts`:

```typescript
export const companyInfo = {
  name: "Your Lawn Care Company",
  address: "123 Main St, City, State",
  phone: "(555) 123-4567",
  email: "info@yourcompany.com"
};
```

#### **Map Configuration**
Update map settings in `src/components/lawn-route/RouteMap.tsx`:

```typescript
const defaultCenter = {
  lat: YOUR_DEFAULT_LAT,
  lng: YOUR_DEFAULT_LNG
};
```

#### **Service Types**
Add custom service types in `src/lib/types.ts`:

```typescript
export const serviceTypes = [
  "Lawn Mowing",
  "Landscaping",
  "Fertilization",
  "Pest Control",
  "Tree Trimming"
];
```

## 🧪 **Testing the Setup**

### **1. Verify Firebase Connection**

1. Open browser console
2. Check for Firebase initialization messages
3. Try to register a new user
4. Verify user appears in Firebase Console

### **2. Test Google Maps**

1. Load the application
2. Verify map displays correctly
3. Try adding a customer with address
4. Check that geocoding works

### **3. Test AI Features**

1. Add a customer with notes
2. Check that AI summary generates
3. Verify AI responses are relevant

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Firebase Authentication Errors**

**Error**: `auth/configuration-not-found`
**Solution**: 
- Verify Firebase project is created
- Check API key in environment variables
- Ensure Authentication is enabled

**Error**: `auth/admin-restricted-operation`
**Solution**:
- Add your domain to authorized domains
- Check Firebase project settings

#### **Google Maps API Errors**

**Error**: `Google Maps JavaScript API error`
**Solution**:
- Verify API key is correct
- Check API is enabled in Google Cloud Console
- Ensure billing is enabled

#### **Build Errors**

**Error**: `Module not found`
**Solution**:
- Run `npm install` to install dependencies
- Clear `.next` folder: `rm -rf .next`
- Restart development server

### **Debug Mode**

Enable debug logging by adding to `.env.local`:

```env
NEXT_PUBLIC_DEBUG=true
```

## 📱 **Mobile Testing**

### **1. Responsive Design**

Test on different screen sizes:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

### **2. Touch Interactions**

Verify touch-friendly interface:
- Customer card scrolling
- Map marker interactions
- Form inputs and buttons

### **3. Performance**

Check mobile performance:
- Page load times
- Map rendering speed
- Smooth scrolling

## 🔒 **Security Checklist**

### **Production Security**

- [ ] **Environment variables** are set in production
- [ ] **API keys** are restricted to your domain
- [ ] **Firebase security rules** are configured
- [ ] **HTTPS** is enabled
- [ ] **CORS** policies are set
- [ ] **Input validation** is implemented

### **Data Protection**

- [ ] **User data** is encrypted
- [ ] **Authentication** is secure
- [ ] **Session management** is proper
- [ ] **Backup strategy** is in place

## 📚 **Additional Resources**

### **Documentation**
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Maps API Documentation](https://developers.google.com/maps/documentation)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### **Support**
- **GitHub Issues**: Report bugs and feature requests
- **Discord Community**: Join our developer community
- **Email Support**: support@lawnroute.com

---

*This setup guide covers the essential steps to get LawnRoute running. For advanced configuration and customization, refer to the technical architecture document.* 