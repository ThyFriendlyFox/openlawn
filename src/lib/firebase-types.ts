import { Timestamp } from 'firebase/firestore';

// Base interface for all documents
export interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User model with role-based access
export interface User extends BaseDocument {
  name: string;
  email: string;
  phone?: string;
  role: 'employee' | 'manager' | 'admin';
  crewId?: string; // Simple crew grouping
  schedule?: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: Timestamp;
  };
  status: 'available' | 'busy' | 'offline';
}

// Service model (embedded in customers)
export interface Service {
  id: string;
  type: string;
  description: string;
  price: number;
  scheduledDate: Timestamp;
  completedDate?: Timestamp;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  photos?: string[]; // URLs to photos in Firebase Storage
  assignedCrew?: string;
}

// Customer model with embedded services
export interface Customer extends BaseDocument {
  name: string;
  address: string;
  lat: number;
  lng: number;
  notes: string;
  billingInfo: {
    email?: string;
    phone?: string;
    paymentMethod?: string;
  };
  status: 'active' | 'inactive' | 'pending';
  services: Service[]; // Embedded services array
  lastServiceDate?: Timestamp;
  nextServiceDate?: Timestamp;
  createdBy: string; // User ID who created this customer
} 