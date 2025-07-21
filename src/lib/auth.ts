import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { getFirebaseAuth, getFirebaseDb } from './firebase';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import type { User } from './firebase-types';

// Authentication state interface
export interface AuthState {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  error: string | null;
}

// Create user profile in Firestore
const createUserProfile = async (user: FirebaseUser, additionalData?: Partial<User>): Promise<void> => {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase database not initialized');
  }

  const userProfile: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
    name: user.displayName || '',
    email: user.email || '',
    phone: '',
    role: 'employee', // Default role
    crewId: undefined,
    schedule: undefined,
    currentLocation: undefined,
    status: 'available',
    ...additionalData
  };

  await setDoc(doc(db, 'users', user.uid), {
    ...userProfile,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

// Update user profile (creates if doesn't exist)
export const updateUserProfile = async (uid: string, updates: Partial<User>): Promise<void> => {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase database not initialized');
  }

  const userRef = doc(db, 'users', uid);
  
  // Check if document exists
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    // Update existing document
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } else {
    // Create new document with basic profile
    const basicProfile: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      name: '',
      email: '',
      phone: '',
      role: 'employee',
      crewId: undefined,
      schedule: undefined,
      currentLocation: undefined,
      status: 'available',
      ...updates
    };
    await setDoc(userRef, {
      ...basicProfile,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const db = getFirebaseDb();
    if (!db) {
      console.error('Firebase database not initialized');
      return null;
    }

    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: userDoc.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role || 'employee',
        crewId: data.crewId,
        schedule: data.schedule,
        currentLocation: data.currentLocation,
        status: data.status || 'available',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Sign up with email and password
export const signUpWithEmail = async (
  email: string, 
  password: string, 
  displayName?: string,
  role?: 'employee' | 'manager' | 'admin'
): Promise<UserCredential> => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name if provided
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    // Create user profile in Firestore
    await createUserProfile(userCredential.user, { 
      name: displayName || '',
      role: role || 'employee'
    });

    return userCredential;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update or create user profile
    await updateUserProfile(userCredential.user.uid, { 
      email: userCredential.user.email || email,
      name: userCredential.user.displayName || '',
    });
    
    return userCredential;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  const auth = getFirebaseAuth();
  return auth?.currentUser || null;
};

// Listen to authentication state changes
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void): (() => void) => {
  const auth = getFirebaseAuth();
  if (!auth) {
    console.error('Firebase auth not initialized, cannot listen to auth state changes');
    // Return a no-op unsubscribe function
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const auth = getFirebaseAuth();
  return !!auth?.currentUser;
};

// Get authentication error message
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
}; 