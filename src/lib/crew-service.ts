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
  writeBatch,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Crew, CrewMember, Vehicle } from './types';

// Firestore interfaces
export interface FirestoreCrew {
  id?: string;
  name: string;
  description?: string;
  members: FirestoreCrewMember[];
  vehicle?: FirestoreVehicle;
  companyId: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreCrewMember {
  userId: string;
  role: 'driver' | 'operator' | 'helper' | 'supervisor';
  isActive: boolean;
  joinedAt: Timestamp;
}

export interface FirestoreVehicle {
  id: string;
  type: 'truck' | 'trailer' | 'mower' | 'other';
  make?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  capacity?: number;
}

// Convert Firestore data to Crew type
const convertFirestoreCrew = (doc: any): Crew => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    description: data.description,
    members: data.members.map((member: FirestoreCrewMember) => ({
      userId: member.userId,
      role: member.role,
      isActive: member.isActive,
      joinedAt: member.joinedAt.toDate(),
    })),
    vehicle: data.vehicle ? {
      id: data.vehicle.id,
      type: data.vehicle.type,
      make: data.vehicle.make,
      model: data.vehicle.model,
      year: data.vehicle.year,
      licensePlate: data.vehicle.licensePlate,
      capacity: data.vehicle.capacity,
    } : undefined,
    companyId: data.companyId,
    isActive: data.isActive,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};

// Convert Crew type to Firestore data
const convertToFirestoreCrew = (crew: Omit<Crew, 'id' | 'createdAt' | 'updatedAt'>): Omit<FirestoreCrew, 'id'> => {
  return {
    name: crew.name,
    description: crew.description,
    members: crew.members.map(member => ({
      userId: member.userId,
      role: member.role,
      isActive: member.isActive,
      joinedAt: Timestamp.fromDate(member.joinedAt),
    })),
    vehicle: crew.vehicle ? {
      id: crew.vehicle.id,
      type: crew.vehicle.type,
      make: crew.vehicle.make,
      model: crew.vehicle.model,
      year: crew.vehicle.year,
      licensePlate: crew.vehicle.licensePlate,
      capacity: crew.vehicle.capacity,
    } : undefined,
    companyId: crew.companyId,
    isActive: crew.isActive,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
};

// Get all crews for a company
export const getCrews = async (companyId: string): Promise<Crew[]> => {
  try {
    const crewsRef = collection(db, 'crews');
    const q = query(
      crewsRef,
      where('companyId', '==', companyId),
      where('isActive', '==', true),
      orderBy('name')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertFirestoreCrew);
  } catch (error) {
    console.error('Error fetching crews:', error);
    throw error;
  }
};

// Get a single crew
export const getCrew = async (crewId: string): Promise<Crew | null> => {
  try {
    const crewDoc = await getDoc(doc(db, 'crews', crewId));
    if (crewDoc.exists()) {
      return convertFirestoreCrew(crewDoc);
    }
    return null;
  } catch (error) {
    console.error('Error fetching crew:', error);
    throw error;
  }
};

// Get crew by member
export const getCrewByMember = async (userId: string): Promise<Crew | null> => {
  try {
    const crewsRef = collection(db, 'crews');
    const q = query(
      crewsRef,
      where('members', 'array-contains', { userId, isActive: true })
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return convertFirestoreCrew(querySnapshot.docs[0]);
    }
    return null;
  } catch (error) {
    console.error('Error fetching crew by member:', error);
    throw error;
  }
};

// Add a new crew
export const addCrew = async (crew: Omit<Crew, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const firestoreCrew = convertToFirestoreCrew(crew);
    const docRef = await addDoc(collection(db, 'crews'), firestoreCrew);
    return docRef.id;
  } catch (error) {
    console.error('Error adding crew:', error);
    throw error;
  }
};

// Update a crew
export const updateCrew = async (crewId: string, updates: Partial<Crew>): Promise<void> => {
  try {
    const crewRef = doc(db, 'crews', crewId);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Handle nested objects
    if (updates.members) {
      updateData.members = updates.members.map(member => ({
        userId: member.userId,
        role: member.role,
        isActive: member.isActive,
        joinedAt: Timestamp.fromDate(member.joinedAt),
      }));
    }

    if (updates.vehicle) {
      updateData.vehicle = {
        id: updates.vehicle.id,
        type: updates.vehicle.type,
        make: updates.vehicle.make,
        model: updates.vehicle.model,
        year: updates.vehicle.year,
        licensePlate: updates.vehicle.licensePlate,
        capacity: updates.vehicle.capacity,
      };
    }

    await updateDoc(crewRef, updateData);
  } catch (error) {
    console.error('Error updating crew:', error);
    throw error;
  }
};

// Add member to crew
export const addCrewMember = async (crewId: string, member: Omit<CrewMember, 'joinedAt'>): Promise<void> => {
  try {
    const crewRef = doc(db, 'crews', crewId);
    const crewDoc = await getDoc(crewRef);
    
    if (!crewDoc.exists()) {
      throw new Error('Crew not found');
    }

    const crewData = crewDoc.data();
    const newMember: FirestoreCrewMember = {
      userId: member.userId,
      role: member.role,
      isActive: member.isActive,
      joinedAt: Timestamp.now(),
    };

    const updatedMembers = [...crewData.members, newMember];
    
    await updateDoc(crewRef, {
      members: updatedMembers,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error adding crew member:', error);
    throw error;
  }
};

// Remove member from crew
export const removeCrewMember = async (crewId: string, userId: string): Promise<void> => {
  try {
    const crewRef = doc(db, 'crews', crewId);
    const crewDoc = await getDoc(crewRef);
    
    if (!crewDoc.exists()) {
      throw new Error('Crew not found');
    }

    const crewData = crewDoc.data();
    const updatedMembers = crewData.members.filter((member: FirestoreCrewMember) => member.userId !== userId);
    
    await updateDoc(crewRef, {
      members: updatedMembers,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error removing crew member:', error);
    throw error;
  }
};

// Deactivate crew (soft delete)
export const deactivateCrew = async (crewId: string): Promise<void> => {
  try {
    const crewRef = doc(db, 'crews', crewId);
    await updateDoc(crewRef, {
      isActive: false,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error deactivating crew:', error);
    throw error;
  }
};

// Listen to crews in real-time
export const subscribeToCrews = (
  companyId: string,
  callback: (crews: Crew[]) => void
): (() => void) => {
  const crewsRef = collection(db, 'crews');
  const q = query(
    crewsRef,
    where('companyId', '==', companyId),
    where('isActive', '==', true),
    orderBy('name')
  );

  return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const crews = querySnapshot.docs.map(convertFirestoreCrew);
    callback(crews);
  });
}; 