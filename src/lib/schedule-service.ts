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
import type { Schedule, ScheduledCustomer, Customer, ServicePreferences } from './types';

// Firestore interfaces
export interface FirestoreSchedule {
  id?: string;
  crewId: string;
  date: Timestamp;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  assignedCustomers: FirestoreScheduledCustomer[];
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreScheduledCustomer {
  customerId: string;
  estimatedStartTime: string;
  estimatedDuration: number;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  actualStartTime?: string;
  actualEndTime?: string;
  notes?: string;
}

// Convert Firestore data to Schedule type
const convertFirestoreSchedule = (doc: any): Schedule => {
  const data = doc.data();
  return {
    id: doc.id,
    crewId: data.crewId,
    date: data.date.toDate(),
    startTime: data.startTime,
    endTime: data.endTime,
    status: data.status,
    assignedCustomers: data.assignedCustomers.map((customer: FirestoreScheduledCustomer) => ({
      customerId: customer.customerId,
      estimatedStartTime: customer.estimatedStartTime,
      estimatedDuration: customer.estimatedDuration,
      priority: customer.priority,
      status: customer.status,
      actualStartTime: customer.actualStartTime,
      actualEndTime: customer.actualEndTime,
      notes: customer.notes,
    })),
    notes: data.notes,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};

// Convert Schedule type to Firestore data
const convertToFirestoreSchedule = (schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Omit<FirestoreSchedule, 'id'> => {
  return {
    crewId: schedule.crewId,
    date: Timestamp.fromDate(schedule.date),
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    status: schedule.status,
    assignedCustomers: schedule.assignedCustomers.map(customer => ({
      customerId: customer.customerId,
      estimatedStartTime: customer.estimatedStartTime,
      estimatedDuration: customer.estimatedDuration,
      priority: customer.priority,
      status: customer.status,
      actualStartTime: customer.actualStartTime,
      actualEndTime: customer.actualEndTime,
      notes: customer.notes,
    })),
    notes: schedule.notes,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
};

// Get schedules for a crew
export const getCrewSchedules = async (crewId: string, startDate?: Date, endDate?: Date): Promise<Schedule[]> => {
  try {
    const schedulesRef = collection(db, 'schedules');
    let q = query(
      schedulesRef,
      where('crewId', '==', crewId),
      orderBy('date', 'asc')
    );

    if (startDate && endDate) {
      q = query(
        schedulesRef,
        where('crewId', '==', crewId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'asc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertFirestoreSchedule);
  } catch (error) {
    console.error('Error fetching crew schedules:', error);
    throw error;
  }
};

// Get schedule for a specific date
export const getScheduleByDate = async (crewId: string, date: Date): Promise<Schedule | null> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const schedulesRef = collection(db, 'schedules');
    const q = query(
      schedulesRef,
      where('crewId', '==', crewId),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay))
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return convertFirestoreSchedule(querySnapshot.docs[0]);
    }
    return null;
  } catch (error) {
    console.error('Error fetching schedule by date:', error);
    throw error;
  }
};

// Get a single schedule
export const getSchedule = async (scheduleId: string): Promise<Schedule | null> => {
  try {
    const scheduleDoc = await getDoc(doc(db, 'schedules', scheduleId));
    if (scheduleDoc.exists()) {
      return convertFirestoreSchedule(scheduleDoc);
    }
    return null;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }
};

// Create a new schedule
export const createSchedule = async (schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const firestoreSchedule = convertToFirestoreSchedule(schedule);
    const docRef = await addDoc(collection(db, 'schedules'), firestoreSchedule);
    return docRef.id;
  } catch (error) {
    console.error('Error creating schedule:', error);
    throw error;
  }
};

// Update a schedule
export const updateSchedule = async (scheduleId: string, updates: Partial<Schedule>): Promise<void> => {
  try {
    const scheduleRef = doc(db, 'schedules', scheduleId);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Handle nested objects
    if (updates.date) {
      updateData.date = Timestamp.fromDate(updates.date);
    }

    if (updates.assignedCustomers) {
      updateData.assignedCustomers = updates.assignedCustomers.map(customer => ({
        customerId: customer.customerId,
        estimatedStartTime: customer.estimatedStartTime,
        estimatedDuration: customer.estimatedDuration,
        priority: customer.priority,
        status: customer.status,
        actualStartTime: customer.actualStartTime,
        actualEndTime: customer.actualEndTime,
        notes: customer.notes,
      }));
    }

    await updateDoc(scheduleRef, updateData);
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

// Add customer to schedule
export const addCustomerToSchedule = async (
  scheduleId: string, 
  customer: Omit<ScheduledCustomer, 'status'>
): Promise<void> => {
  try {
    const scheduleRef = doc(db, 'schedules', scheduleId);
    const scheduleDoc = await getDoc(scheduleRef);
    
    if (!scheduleDoc.exists()) {
      throw new Error('Schedule not found');
    }

    const scheduleData = scheduleDoc.data();
    const newCustomer: FirestoreScheduledCustomer = {
      customerId: customer.customerId,
      estimatedStartTime: customer.estimatedStartTime,
      estimatedDuration: customer.estimatedDuration,
      priority: customer.priority,
      status: 'pending',
      actualStartTime: customer.actualStartTime,
      actualEndTime: customer.actualEndTime,
      notes: customer.notes,
    };

    const updatedCustomers = [...scheduleData.assignedCustomers, newCustomer];
    
    await updateDoc(scheduleRef, {
      assignedCustomers: updatedCustomers,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error adding customer to schedule:', error);
    throw error;
  }
};

// Remove customer from schedule
export const removeCustomerFromSchedule = async (scheduleId: string, customerId: string): Promise<void> => {
  try {
    const scheduleRef = doc(db, 'schedules', scheduleId);
    const scheduleDoc = await getDoc(scheduleRef);
    
    if (!scheduleDoc.exists()) {
      throw new Error('Schedule not found');
    }

    const scheduleData = scheduleDoc.data();
    const updatedCustomers = scheduleData.assignedCustomers.filter(
      (customer: FirestoreScheduledCustomer) => customer.customerId !== customerId
    );
    
    await updateDoc(scheduleRef, {
      assignedCustomers: updatedCustomers,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error removing customer from schedule:', error);
    throw error;
  }
};

// Update customer status in schedule
export const updateCustomerStatus = async (
  scheduleId: string, 
  customerId: string, 
  status: ScheduledCustomer['status'],
  actualTimes?: { startTime?: string; endTime?: string }
): Promise<void> => {
  try {
    const scheduleRef = doc(db, 'schedules', scheduleId);
    const scheduleDoc = await getDoc(scheduleRef);
    
    if (!scheduleDoc.exists()) {
      throw new Error('Schedule not found');
    }

    const scheduleData = scheduleDoc.data();
    const updatedCustomers = scheduleData.assignedCustomers.map((customer: FirestoreScheduledCustomer) => {
      if (customer.customerId === customerId) {
        return {
          ...customer,
          status,
          ...(actualTimes?.startTime && { actualStartTime: actualTimes.startTime }),
          ...(actualTimes?.endTime && { actualEndTime: actualTimes.endTime }),
        };
      }
      return customer;
    });
    
    await updateDoc(scheduleRef, {
      assignedCustomers: updatedCustomers,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating customer status:', error);
    throw error;
  }
};

// Get customers available for scheduling on a specific date
export const getAvailableCustomers = async (
  userId: string,
  date: Date,
  servicePreferences?: ServicePreferences
): Promise<Customer[]> => {
  try {
    // This would typically involve checking:
    // 1. Customers who prefer this day of the week
    // 2. Customers who haven't been serviced recently
    // 3. Customers who are within the crew's service area
    // 4. Customers who aren't already scheduled for this date
    
    // For now, we'll return all active customers
    // This should be enhanced with proper filtering logic
    const customersRef = collection(db, 'customers');
    const q = query(
      customersRef,
      where('createdBy', '==', userId),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Customer));
  } catch (error) {
    console.error('Error fetching available customers:', error);
    throw error;
  }
};

// Listen to schedules in real-time
export const subscribeToSchedules = (
  crewId: string,
  callback: (schedules: Schedule[]) => void
): (() => void) => {
  const schedulesRef = collection(db, 'schedules');
  const q = query(
    schedulesRef,
    where('crewId', '==', crewId),
    orderBy('date', 'asc')
  );

  return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const schedules = querySnapshot.docs.map(convertFirestoreSchedule);
    callback(schedules);
  });
}; 