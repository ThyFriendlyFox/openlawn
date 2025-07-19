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
import type { Crew, Employee } from './types';

// Firestore interfaces
export interface FirestoreCrew {
  id?: string;
  name: string;
  description?: string;
  companyId: string;
  employees: FirestoreCrewEmployee[];
  services: FirestoreCrewService[];
  status: 'active' | 'inactive';
  currentLocation?: {
    lat: number;
    lng: number;
    lastUpdated: Timestamp;
  };
  vehicle?: {
    type: string;
    make: string;
    model: string;
    year: number;
    licensePlate?: string;
  };
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface FirestoreCrewEmployee {
  employeeId: string;
  name: string;
  email: string;
  role: 'employee' | 'manager';
  status: 'active' | 'inactive';
  joinedAt: Timestamp;
}

export interface FirestoreCrewService {
  serviceType: string;
  days: string[];
  isActive: boolean;
}

// Convert Firestore data to Crew type
const convertFirestoreCrew = (doc: any): Crew => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    description: data.description,
    companyId: data.companyId,
    employees: data.employees.map((emp: FirestoreCrewEmployee) => ({
      id: emp.employeeId,
      name: emp.name,
      email: emp.email,
      role: emp.role,
      status: emp.status,
      joinedAt: emp.joinedAt.toDate(),
    })),
    services: data.services.map((service: FirestoreCrewService) => ({
      serviceType: service.serviceType,
      days: service.days,
      isActive: service.isActive,
    })),
    status: data.status,
    currentLocation: data.currentLocation ? {
      lat: data.currentLocation.lat,
      lng: data.currentLocation.lng,
      lastUpdated: data.currentLocation.lastUpdated.toDate(),
    } : undefined,
    vehicle: data.vehicle,
    isActive: data.isActive,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    createdBy: data.createdBy,
  };
};

// Convert Crew type to Firestore data
const convertToFirestoreCrew = (crew: Omit<Crew, 'id' | 'createdAt' | 'updatedAt'>): Omit<FirestoreCrew, 'id'> => {
  return {
    name: crew.name,
    description: crew.description,
    companyId: crew.companyId,
    employees: crew.employees.map(emp => ({
      employeeId: emp.id,
      name: emp.name,
      email: emp.email,
      role: emp.role,
      status: emp.status,
      joinedAt: Timestamp.fromDate(emp.joinedAt),
    })),
    services: crew.services.map(service => ({
      serviceType: service.serviceType,
      days: service.days,
      isActive: service.isActive,
    })),
    status: crew.status,
    currentLocation: crew.currentLocation ? {
      lat: crew.currentLocation.lat,
      lng: crew.currentLocation.lng,
      lastUpdated: Timestamp.fromDate(crew.currentLocation.lastUpdated),
    } : undefined,
    vehicle: crew.vehicle,
    isActive: crew.isActive,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: crew.createdBy,
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
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertFirestoreCrew);
  } catch (error) {
    console.error('Error fetching crews:', error);
    throw error;
  }
};

// Get a single crew by ID
export const getCrew = async (crewId: string): Promise<Crew | null> => {
  try {
    const crewRef = doc(db, 'crews', crewId);
    const crewDoc = await getDoc(crewRef);
    
    if (crewDoc.exists()) {
      return convertFirestoreCrew(crewDoc);
    }
    return null;
  } catch (error) {
    console.error('Error fetching crew:', error);
    throw error;
  }
};

// Create a new crew
export const createCrew = async (crewData: Omit<Crew, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const firestoreCrew = convertToFirestoreCrew(crewData);
    const docRef = await addDoc(collection(db, 'crews'), firestoreCrew);
    return docRef.id;
  } catch (error) {
    console.error('Error creating crew:', error);
    throw error;
  }
};

// Update an existing crew
export const updateCrew = async (crewId: string, updates: Partial<Crew>): Promise<void> => {
  try {
    const crewRef = doc(db, 'crews', crewId);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Convert nested objects if they exist
    if (updates.employees) {
      updateData.employees = updates.employees.map(emp => ({
        employeeId: emp.id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        status: emp.status,
        joinedAt: Timestamp.fromDate(emp.joinedAt),
      }));
    }

    if (updates.services) {
      updateData.services = updates.services.map(service => ({
        serviceType: service.serviceType,
        days: service.days,
        isActive: service.isActive,
      }));
    }

    if (updates.currentLocation) {
      updateData.currentLocation = {
        lat: updates.currentLocation.lat,
        lng: updates.currentLocation.lng,
        lastUpdated: Timestamp.fromDate(updates.currentLocation.lastUpdated),
      };
    }

    await updateDoc(crewRef, updateData);
  } catch (error) {
    console.error('Error updating crew:', error);
    throw error;
  }
};

// Delete a crew (soft delete)
export const deleteCrew = async (crewId: string): Promise<void> => {
  try {
    const crewRef = doc(db, 'crews', crewId);
    await updateDoc(crewRef, {
      isActive: false,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error deleting crew:', error);
    throw error;
  }
};

// Add employee to crew
export const addEmployeeToCrew = async (
  crewId: string, 
  employee: Omit<Employee, 'id' | 'joinedAt'>
): Promise<void> => {
  try {
    const crewRef = doc(db, 'crews', crewId);
    const crewDoc = await getDoc(crewRef);
    
    if (!crewDoc.exists()) {
      throw new Error('Crew not found');
    }

    const crewData = crewDoc.data();
    const existingEmployees = crewData.employees || [];
    
    // Check if employee already exists
    const employeeExists = existingEmployees.some((emp: any) => emp.employeeId === employee.id);
    if (employeeExists) {
      throw new Error('Employee already exists in crew');
    }

    const newEmployee: FirestoreCrewEmployee = {
      employeeId: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      status: employee.status,
      joinedAt: Timestamp.now(),
    };

    await updateDoc(crewRef, {
      employees: [...existingEmployees, newEmployee],
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error adding employee to crew:', error);
    throw error;
  }
};

// Remove employee from crew
export const removeEmployeeFromCrew = async (crewId: string, employeeId: string): Promise<void> => {
  try {
    const crewRef = doc(db, 'crews', crewId);
    const crewDoc = await getDoc(crewRef);
    
    if (!crewDoc.exists()) {
      throw new Error('Crew not found');
    }

    const crewData = crewDoc.data();
    const existingEmployees = crewData.employees || [];
    
    const updatedEmployees = existingEmployees.filter((emp: any) => emp.employeeId !== employeeId);
    
    await updateDoc(crewRef, {
      employees: updatedEmployees,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error removing employee from crew:', error);
    throw error;
  }
};

// Update crew location
export const updateCrewLocation = async (
  crewId: string, 
  location: { lat: number; lng: number }
): Promise<void> => {
  try {
    const crewRef = doc(db, 'crews', crewId);
    await updateDoc(crewRef, {
      currentLocation: {
        lat: location.lat,
        lng: location.lng,
        lastUpdated: Timestamp.now(),
      },
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating crew location:', error);
    throw error;
  }
};

// Subscribe to crews for real-time updates
export const subscribeToCrews = (
  companyId: string,
  callback: (crews: Crew[]) => void
): () => void => {
  try {
    const crewsRef = collection(db, 'crews');
    // Simplified query to avoid index requirements
    const q = query(
      crewsRef,
      where('companyId', '==', companyId)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const crews = querySnapshot.docs
        .map(convertFirestoreCrew)
        .filter(crew => crew.isActive) // Filter client-side
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort client-side
      callback(crews);
    }, (error) => {
      console.error('Error subscribing to crews:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up crews subscription:', error);
    return () => {};
  }
};

// Get crews by status
export const getCrewsByStatus = async (companyId: string, status: 'active' | 'inactive'): Promise<Crew[]> => {
  try {
    const crewsRef = collection(db, 'crews');
    const q = query(
      crewsRef,
      where('companyId', '==', companyId),
      where('status', '==', status),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertFirestoreCrew);
  } catch (error) {
    console.error('Error fetching crews by status:', error);
    throw error;
  }
};

// Get crews by service type
export const getCrewsByService = async (companyId: string, serviceType: string): Promise<Crew[]> => {
  try {
    const crewsRef = collection(db, 'crews');
    const q = query(
      crewsRef,
      where('companyId', '==', companyId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const allCrews = querySnapshot.docs.map(convertFirestoreCrew);
    
    // Filter by service type (since Firestore doesn't support array-contains queries on nested fields)
    return allCrews.filter(crew => 
      crew.services.some(service => 
        service.serviceType === serviceType && service.isActive
      )
    );
  } catch (error) {
    console.error('Error fetching crews by service:', error);
    throw error;
  }
}; 