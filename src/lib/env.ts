// Environment configuration for both web and mobile
interface EnvironmentConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  googleMaps: {
    apiKey: string;
  };
  googleAI: {
    apiKey: string;
  };
}

// For web development (Next.js)
const getWebConfig = (): EnvironmentConfig => ({
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  },
  googleMaps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  },
  googleAI: {
    apiKey: process.env.GOOGLE_AI_API_KEY || '',
  },
});

// For mobile (Capacitor) - you'll need to set these in your build process
const getMobileConfig = (): EnvironmentConfig => {
  // In a real mobile app, these would be set during the build process
  // or loaded from a secure configuration file
  return {
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.FIREBASE_APP_ID || '',
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
    },
    googleMaps: {
      apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    },
    googleAI: {
      apiKey: process.env.GOOGLE_AI_API_KEY || '',
    },
  };
};

// Detect if we're running in a mobile environment
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return (window as any).Capacitor !== undefined || 
         /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const env = isMobile() ? getMobileConfig() : getWebConfig();

// Debug logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('Environment Config:', {
    firebase: {
      apiKey: env.firebase.apiKey ? 'Present' : 'Missing',
      projectId: env.firebase.projectId || 'Missing'
    },
    googleMaps: {
      apiKey: env.googleMaps.apiKey ? 'Present' : 'Missing'
    },
    googleAI: {
      apiKey: env.googleAI.apiKey ? 'Present' : 'Missing'
    }
  });
}

// Export individual configs for convenience
export const firebaseConfig = env.firebase;
export const googleMapsConfig = env.googleMaps;
export const googleAIConfig = env.googleAI; 