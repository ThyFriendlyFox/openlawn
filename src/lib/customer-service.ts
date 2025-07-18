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
  limit,
  onSnapshot,
  Timestamp,
  writeBatch,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Customer } from './types';

// Customer interface for Firestore
export interface FirestoreCustomer {
  id?: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  notes: string;
  serviceRequested: string;
  email?: string;
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // User ID
  companyId?: string;
  status: 'active' | 'inactive' | 'pending';
  lastServiceDate?: Timestamp;
  nextServiceDate?: Timestamp;
  serviceHistory?: {
    date: Timestamp;
    service: string;
    notes?: string;
    completedBy?: string;
  }[];
}

// Convert Firestore data to Customer type
const convertFirestoreCustomer = (doc: any): Customer => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    address: data.address,
    lat: data.lat,
    lng: data.lng,
    notes: data.notes,
    serviceRequested: data.serviceRequested,
  };
};

// Convert Customer type to Firestore data
const convertToFirestoreCustomer = (customer: Omit<Customer, 'id'>, userId: string): Omit<FirestoreCustomer, 'id'> => {
  return {
    name: customer.name,
    address: customer.address,
    lat: customer.lat,
    lng: customer.lng,
    notes: customer.notes,
    serviceRequested: customer.serviceRequested,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: userId,
    status: 'active',
  };
};

// Get all customers
export const getCustomers = async (userId: string): Promise<Customer[]> => {
  try {
    const customersRef = collection(db, 'customers');
    const q = query(
      customersRef,
      where('createdBy', '==', userId),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    const customers = querySnapshot.docs.map(convertFirestoreCustomer);
    
    // Sort by createdAt on the client side for now
    return customers.sort((a, b) => {
      // Since we don't have createdAt in the Customer type, we'll sort by name
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

// Get a single customer
export const getCustomer = async (customerId: string): Promise<Customer | null> => {
  try {
    const customerDoc = await getDoc(doc(db, 'customers', customerId));
    if (customerDoc.exists()) {
      return convertFirestoreCustomer(customerDoc);
    }
    return null;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
};

// Add a new customer
export const addCustomer = async (customer: Omit<Customer, 'id'>, userId: string): Promise<string> => {
  try {
    const firestoreCustomer = convertToFirestoreCustomer(customer, userId);
    const docRef = await addDoc(collection(db, 'customers'), firestoreCustomer);
    return docRef.id;
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};

// Update a customer
export const updateCustomer = async (customerId: string, updates: Partial<Customer>): Promise<void> => {
  try {
    const customerRef = doc(db, 'customers', customerId);
    await updateDoc(customerRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

// Delete a customer (soft delete)
export const deleteCustomer = async (customerId: string): Promise<void> => {
  try {
    const customerRef = doc(db, 'customers', customerId);
    await updateDoc(customerRef, {
      status: 'inactive',
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// Hard delete a customer
export const hardDeleteCustomer = async (customerId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'customers', customerId));
  } catch (error) {
    console.error('Error hard deleting customer:', error);
    throw error;
  }
};

// Listen to customers in real-time
export const subscribeToCustomers = (
  userId: string,
  callback: (customers: Customer[]) => void
): (() => void) => {
  const customersRef = collection(db, 'customers');
  const q = query(
    customersRef,
    where('createdBy', '==', userId),
    where('status', '==', 'active')
  );

  return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const customers = querySnapshot.docs.map(convertFirestoreCustomer);
    // Sort by name on the client side for now
    const sortedCustomers = customers.sort((a, b) => a.name.localeCompare(b.name));
    callback(sortedCustomers);
  });
};

// Search customers
export const searchCustomers = async (
  userId: string,
  searchTerm: string
): Promise<Customer[]> => {
  try {
    const customersRef = collection(db, 'customers');
    const q = query(
      customersRef,
      where('createdBy', '==', userId),
      where('status', '==', 'active'),
      orderBy('name')
    );
    
    const querySnapshot = await getDocs(q);
    const customers = querySnapshot.docs.map(convertFirestoreCustomer);
    
    // Filter by search term (client-side filtering for now)
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.serviceRequested.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching customers:', error);
    throw error;
  }
};

// Get customers by service type
export const getCustomersByService = async (
  userId: string,
  serviceType: string
): Promise<Customer[]> => {
  try {
    const customersRef = collection(db, 'customers');
    const q = query(
      customersRef,
      where('createdBy', '==', userId),
      where('status', '==', 'active'),
      where('serviceRequested', '==', serviceType),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertFirestoreCustomer);
  } catch (error) {
    console.error('Error fetching customers by service:', error);
    throw error;
  }
};

// Add service record to customer
export const addServiceRecord = async (
  customerId: string,
  serviceRecord: {
    date: Date;
    service: string;
    notes?: string;
    completedBy: string;
  }
): Promise<void> => {
  try {
    const customerRef = doc(db, 'customers', customerId);
    const customerDoc = await getDoc(customerRef);
    
    if (!customerDoc.exists()) {
      throw new Error('Customer not found');
    }

    const currentData = customerDoc.data();
    const serviceHistory = currentData.serviceHistory || [];
    
    serviceHistory.push({
      date: Timestamp.fromDate(serviceRecord.date),
      service: serviceRecord.service,
      notes: serviceRecord.notes,
      completedBy: serviceRecord.completedBy,
    });

    await updateDoc(customerRef, {
      serviceHistory,
      lastServiceDate: Timestamp.fromDate(serviceRecord.date),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error adding service record:', error);
    throw error;
  }
};

// Batch operations
export const batchUpdateCustomers = async (
  updates: { id: string; updates: Partial<Customer> }[]
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    updates.forEach(({ id, updates: customerUpdates }) => {
      const customerRef = doc(db, 'customers', id);
      batch.update(customerRef, {
        ...customerUpdates,
        updatedAt: Timestamp.now(),
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error batch updating customers:', error);
    throw error;
  }
}; 