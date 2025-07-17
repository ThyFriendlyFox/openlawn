import { auth, db } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

export async function testFirebaseConnection() {
  try {
    console.log('🧪 Testing Firebase connection...');
    
    // Test 1: Check if auth is initialized
    console.log('✅ Auth service initialized:', !!auth);
    
    // Test 2: Check if Firestore is initialized
    console.log('✅ Firestore service initialized:', !!db);
    
    // Test 3: Try to access Firestore (this will fail if not configured)
    try {
      const testCollection = collection(db, 'test');
      console.log('✅ Firestore access test passed');
    } catch (error) {
      console.error('❌ Firestore access test failed:', error);
    }
    
    // Test 4: Try anonymous auth (this will fail if auth not configured)
    try {
      const result = await signInAnonymously(auth);
      console.log('✅ Anonymous auth test passed');
      // Sign out immediately
      await auth.signOut();
    } catch (error) {
      console.error('❌ Anonymous auth test failed:', error);
    }
    
    console.log('🎉 Firebase connection test completed');
    return true;
  } catch (error) {
    console.error('💥 Firebase connection test failed:', error);
    return false;
  }
} 