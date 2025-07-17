import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User } from './types';

export interface AuthUser extends User {
  uid: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'employee';
  companyId?: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// Role hierarchy for permission checking
export const ROLE_HIERARCHY = {
  admin: 3,
  manager: 2,
  employee: 1
} as const;

export class AuthService {
  // Check if user has permission to perform action
  static hasPermission(userRole: string, requiredRole: string): boolean {
    const userLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY] || 0;
    return userLevel >= requiredLevel;
  }

  // Get user data from Firestore
  static async getUserData(uid: string): Promise<AuthUser | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: uid,
          uid,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          role: data.role,
          emailVerified: data.emailVerified || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Create user document in Firestore
  static async createUserDocument(uid: string, userData: RegisterData): Promise<void> {
    try {
      await setDoc(doc(db, 'users', uid), {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        companyId: userData.companyId || null,
        avatar: null,
        emailVerified: false,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Update last login time
  static async updateLastLogin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastLoginAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  // Register new user
  static async register(userData: RegisterData): Promise<AuthUser> {
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const { user } = userCredential;

      // Update Firebase profile
      await updateProfile(user, {
        displayName: userData.name,
      });

      // Create user document in Firestore
      await this.createUserDocument(user.uid, userData);

      // Get the complete user data
      const authUser = await this.getUserData(user.uid);
      if (!authUser) {
        throw new Error('Failed to create user document');
      }

      return authUser;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  // Login user
  static async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const { user } = userCredential;

      // Update last login time
      await this.updateLastLogin(user.uid);

      // Get user data from Firestore
      const authUser = await this.getUserData(user.uid);
      if (!authUser) {
        throw new Error('User document not found');
      }

      return authUser;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset:', error);
      throw error;
    }
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<AuthUser[]> {
    try {
      const usersQuery = query(collection(db, 'users'));
      const querySnapshot = await getDocs(usersQuery);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: doc.id,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          role: data.role,
          emailVerified: data.emailVerified || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
        };
      });
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Get users by role
  static async getUsersByRole(role: string): Promise<AuthUser[]> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', role)
      );
      const querySnapshot = await getDocs(usersQuery);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: doc.id,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          role: data.role,
          emailVerified: data.emailVerified || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
        };
      });
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  }
} 