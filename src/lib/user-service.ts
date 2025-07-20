import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User } from './firebase-types';

// Convert Firestore data to User type
const convertFirestoreUser = (doc: any): User => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.displayName || data.name || 'Unknown',
    email: data.email,
    phone: data.phone,
    role: data.role || 'employee',
    crewId: data.crewId,
    schedule: data.schedule,
    currentLocation: data.currentLocation,
    status: data.isActive ? 'active' : (data.status || 'available'),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

// Convert User type to Firestore data
const convertToFirestoreUser = (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Omit<User, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role || 'employee',
    crewId: user.crewId,
    schedule: user.schedule,
    currentLocation: user.currentLocation,
    status: user.status || 'available',
  };
};

// Get all users (for managers and admins)
export const getUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('displayName'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertFirestoreUser);
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get users by role
export const getUsersByRole = async (role: User['role']): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('role', '==', role),
      orderBy('displayName')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertFirestoreUser);
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw error;
  }
};

// Get users by crew
export const getUsersByCrew = async (crewId: string): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('crewId', '==', crewId),
      orderBy('displayName')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertFirestoreUser);
  } catch (error) {
    console.error('Error fetching users by crew:', error);
    throw error;
  }
};

// Get a single user
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return convertFirestoreUser(userDoc);
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Add a new user
export const addUser = async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const firestoreUser = convertToFirestoreUser(user);
    const docRef = await addDoc(collection(db, 'users'), {
      ...firestoreUser,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

// Update a user
export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Update user location
export const updateUserLocation = async (
  userId: string,
  location: { lat: number; lng: number }
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      currentLocation: {
        ...location,
        timestamp: Timestamp.now(),
      },
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user location:', error);
    throw error;
  }
};

// Update user status
export const updateUserStatus = async (
  userId: string,
  status: User['status']
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// Assign user to crew
export const assignUserToCrew = async (
  userId: string,
  crewId: string | null
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      crewId,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error assigning user to crew:', error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Listen to users in real-time
export const subscribeToUsers = (
  callback: (users: User[]) => void
): (() => void) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('displayName'));

  return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const users = querySnapshot.docs.map(convertFirestoreUser);
    callback(users);
  });
};

// Listen to users by crew in real-time
export const subscribeToUsersByCrew = (
  crewId: string,
  callback: (users: User[]) => void
): (() => void) => {
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    where('crewId', '==', crewId),
    orderBy('displayName')
  );

  return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const users = querySnapshot.docs.map(convertFirestoreUser);
    callback(users);
  });
};

// Search users
export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('name'));
    
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(convertFirestoreUser);
    
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}; 