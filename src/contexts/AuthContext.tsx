import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthService, AuthUser, AuthState, LoginCredentials, RegisterData } from '@/lib/auth';
import { AnalyticsService } from '@/lib/analytics';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  hasPermission: (requiredRole: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Get user data from Firestore
          const userData = await AuthService.getUserData(firebaseUser.uid);
          if (userData) {
            setAuthState({
              user: userData,
              loading: false,
              error: null,
            });
          } else {
            setAuthState({
              user: null,
              loading: false,
              error: 'User data not found',
            });
          }
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setAuthState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication error',
        });
      }
    }, (error) => {
      console.error('Auth state change error:', error);
      setAuthState({
        user: null,
        loading: false,
        error: error.message || 'Authentication configuration error',
      });
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const user = await AuthService.login(credentials);
      setAuthState({
        user,
        loading: false,
        error: null,
      });
      
      // Track successful login
      AnalyticsService.trackLogin('email');
      AnalyticsService.trackUserRole(user.role);
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      
      // Track login error
      AnalyticsService.trackError('login_failed', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const user = await AuthService.register(userData);
      setAuthState({
        user,
        loading: false,
        error: null,
      });
      
      // Track successful registration
      AnalyticsService.trackSignUp('email');
      AnalyticsService.trackUserRole(user.role);
    } catch (error) {
      console.error('Registration error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
      
      // Track registration error
      AnalyticsService.trackError('registration_failed', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      await AuthService.logout();
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
      
      // Track successful logout
      AnalyticsService.trackLogout();
    } catch (error) {
      console.error('Logout error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      }));
      
      // Track logout error
      AnalyticsService.trackError('logout_failed', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await AuthService.resetPassword(email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!authState.user) {
      throw new Error('No user logged in');
    }

    try {
      await AuthService.updateUserProfile(authState.user.uid, updates);
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updates } : null,
      }));
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const hasPermission = (requiredRole: string): boolean => {
    if (!authState.user) return false;
    return AuthService.hasPermission(authState.user.role, requiredRole);
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 