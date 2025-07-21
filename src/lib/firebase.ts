import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

import { firebaseConfig, isFirebaseConfigured } from './env';

// Initialize Firebase only if configuration is available
let app: any = null;
let db: any = null;
let auth: any = null;
let storage: any = null;

// Check if we're in a build environment or if Firebase is properly configured
const shouldInitializeFirebase = () => {
  // Don't initialize during build time if config is missing
  if (typeof window === 'undefined' && !isFirebaseConfigured()) {
    return false;
  }
  return isFirebaseConfigured();
};

if (shouldInitializeFirebase()) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    // Provide fallback objects to prevent runtime errors
    app = null;
    db = null;
    auth = null;
    storage = null;
  }
}

export { db, auth, storage };
export default app; 