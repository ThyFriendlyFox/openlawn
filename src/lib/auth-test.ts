import { auth } from './firebase';
import { signInAnonymously, createUserWithEmailAndPassword } from 'firebase/auth';

export async function testAuthOperations() {
  console.log('🧪 Testing Firebase Auth operations...');
  
  try {
    // Test 1: Try anonymous sign-in
    console.log('Testing anonymous sign-in...');
    const anonymousResult = await signInAnonymously(auth);
    console.log('✅ Anonymous sign-in successful:', anonymousResult.user.uid);
    
    // Sign out
    await auth.signOut();
    console.log('✅ Sign out successful');
    
    // Test 2: Try email/password sign-up
    console.log('Testing email/password sign-up...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    const emailResult = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Email/password sign-up successful:', emailResult.user.uid);
    
    // Sign out
    await auth.signOut();
    console.log('✅ Sign out successful');
    
    console.log('🎉 All auth tests passed!');
    return true;
  } catch (error: any) {
    console.error('❌ Auth test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide specific guidance based on error
    switch (error.code) {
      case 'auth/admin-restricted-operation':
        console.error('💡 This error usually means:');
        console.error('   - Authentication is not enabled in Firebase Console');
        console.error('   - Domain is not authorized');
        console.error('   - Project has restrictions');
        break;
      case 'auth/configuration-not-found':
        console.error('💡 This error usually means:');
        console.error('   - Firebase config is incorrect');
        console.error('   - Environment variables are missing');
        break;
      case 'auth/operation-not-allowed':
        console.error('💡 This error usually means:');
        console.error('   - Email/Password provider is not enabled');
        console.error('   - Anonymous auth is not enabled');
        break;
      default:
        console.error('💡 Unknown error, check Firebase Console for project status');
    }
    
    return false;
  }
} 