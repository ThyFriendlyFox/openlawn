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
import type { Customer, Service } from './firebase-types';

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
    billingInfo: data.billingInfo || {},
    status: data.status || 'active',
    services: data.services?.map((service: any) => ({
      id: service.id,
      type: service.type,
      description: service.description,
      price: service.price,
      scheduledDate: service.scheduledDate,
      completedDate: service.completedDate,
      status: service.status,
      notes: service.notes,
      photos: service.photos || [],
      assignedCrew: service.assignedCrew,
    })) || [],
    lastServiceDate: data.lastServiceDate,
    nextServiceDate: data.nextServiceDate,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdBy: data.createdBy,
  };
};

// Convert Customer type to Firestore data
const convertToFirestoreCustomer = (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    name: customer.name,
    address: customer.address,
    lat: customer.lat,
    lng: customer.lng,
    notes: customer.notes,
    billingInfo: customer.billingInfo,
    status: customer.status || 'active',
    services: customer.services || [],
    lastServiceDate: customer.lastServiceDate,
    nextServiceDate: customer.nextServiceDate,
    createdBy: userId,
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
    
    return customers.sort((a, b) => a.name.localeCompare(b.name));
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
export const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> => {
  try {
    const firestoreCustomer = convertToFirestoreCustomer(customer, userId);
    const docRef = await addDoc(collection(db, 'customers'), {
      ...firestoreCustomer,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
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
    
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.services.some(service => 
        service.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  } catch (error) {
    console.error('Error searching customers:', error);
    throw error;
  }
};

// Add a service to a customer
export const addServiceToCustomer = async (
  customerId: string,
  service: Omit<Service, 'id'>
): Promise<void> => {
  try {
    const customerRef = doc(db, 'customers', customerId);
    const customerDoc = await getDoc(customerRef);
    
    if (!customerDoc.exists()) {
      throw new Error('Customer not found');
    }
    
    const customerData = customerDoc.data();
    const services = customerData.services || [];
    const newService = {
      ...service,
      id: Date.now().toString(), // Simple ID generation
    };
    
    await updateDoc(customerRef, {
      services: [...services, newService],
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error adding service to customer:', error);
    throw error;
  }
};

// Update a service for a customer
export const updateServiceForCustomer = async (
  customerId: string,
  serviceId: string,
  updates: Partial<Service>
): Promise<void> => {
  try {
    const customerRef = doc(db, 'customers', customerId);
    const customerDoc = await getDoc(customerRef);
    
    if (!customerDoc.exists()) {
      throw new Error('Customer not found');
    }
    
    const customerData = customerDoc.data();
    const services = customerData.services || [];
    const serviceIndex = services.findIndex((s: Service) => s.id === serviceId);
    
    if (serviceIndex === -1) {
      throw new Error('Service not found');
    }
    
    services[serviceIndex] = { ...services[serviceIndex], ...updates };
    
    await updateDoc(customerRef, {
      services,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating service for customer:', error);
    throw error;
  }
};

// Remove a service from a customer
export const removeServiceFromCustomer = async (
  customerId: string,
  serviceId: string
): Promise<void> => {
  try {
    const customerRef = doc(db, 'customers', customerId);
    const customerDoc = await getDoc(customerRef);
    
    if (!customerDoc.exists()) {
      throw new Error('Customer not found');
    }
    
    const customerData = customerDoc.data();
    const services = customerData.services || [];
    const filteredServices = services.filter((s: Service) => s.id !== serviceId);
    
    await updateDoc(customerRef, {
      services: filteredServices,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error removing service from customer:', error);
    throw error;
  }
}; 