import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'employee' | 'manager';
  companyId?: string;
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
}

// Authentication state interface
export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Create user profile in Firestore
const createUserProfile = async (user: User, additionalData?: Partial<UserProfile>): Promise<void> => {
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    role: 'employee', // Default role
    createdAt: new Date(),
    lastLoginAt: new Date(),
    isActive: true,
    ...additionalData
  };

  await setDoc(doc(db, 'users', user.uid), userProfile);
};

// Update user profile (creates if doesn't exist)
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  
  // Check if document exists
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    // Update existing document
    await updateDoc(userRef, {
      ...updates,
      lastLoginAt: new Date()
    });
  } else {
    // Create new document with basic profile
    const basicProfile: UserProfile = {
      uid,
      email: '', // Will be filled by the calling function
      displayName: '',
      photoURL: '',
      role: 'employee',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true,
      ...updates
    };
    await setDoc(userRef, basicProfile);
  }
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
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
  role?: 'admin' | 'employee' | 'manager'
): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name if provided
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    // Create user profile in Firestore
    await createUserProfile(userCredential.user, { 
      displayName,
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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update or create user profile
    await updateUserProfile(userCredential.user.uid, { 
      email: userCredential.user.email || email,
      displayName: userCredential.user.displayName || '',
      photoURL: userCredential.user.photoURL || ''
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
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Listen to authentication state changes
export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
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