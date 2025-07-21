'use client';

import { useEffect, useState } from 'react';
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase';

export function FirebaseTest() {
  const [status, setStatus] = useState<{
    auth: boolean;
    db: boolean;
    message: string;
  }>({
    auth: false,
    db: false,
    message: 'Checking Firebase initialization...',
  });

  useEffect(() => {
    const checkFirebase = () => {
      try {
        const auth = getFirebaseAuth();
        const db = getFirebaseDb();

        setStatus({
          auth: !!auth,
          db: !!db,
          message: auth && db ? 'Firebase initialized successfully' : 'Firebase initialization failed',
        });
      } catch (error) {
        setStatus({
          auth: false,
          db: false,
          message: `Firebase error: ${error}`,
        });
      }
    };

    // Check immediately
    checkFirebase();

    // Check again after a short delay to ensure initialization
    const timer = setTimeout(checkFirebase, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed top-4 right-4 bg-blue-900/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">Firebase Test</div>
      <div className="space-y-1">
        <div className={status.auth ? 'text-green-400' : 'text-red-400'}>
          Auth: {status.auth ? '✓' : '✗'}
        </div>
        <div className={status.db ? 'text-green-400' : 'text-red-400'}>
          DB: {status.db ? '✓' : '✗'}
        </div>
        <div className="text-yellow-400 text-xs mt-2">
          {status.message}
        </div>
      </div>
    </div>
  );
} 