import { Timestamp } from 'firebase/firestore';

// Base interface for all documents
export interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Customer model
export interface Customer extends BaseDocument {
  name: string;
  address: string;
  lat: number;
  lng: number;
  notes: string;
  serviceRequested: string;
  billingInfo: {
    email?: string;
    phone?: string;
    paymentMethod?: string;
  };
  status: 'active' | 'inactive' | 'pending';
  assignedCrew?: string;
  lastServiceDate?: Timestamp;
  nextServiceDate?: Timestamp;
}

// Employee model
export interface Employee extends BaseDocument {
  name: string;
  email: string;
  phone: string;
  role: 'employee' | 'manager';
  crewId?: string;
  schedule: {
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

// Crew model
export interface Crew extends BaseDocument {
  name: string;
  members: string[]; // Employee IDs
  vehicle?: {
    id: string;
    type: string;
    capacity: number;
  };
  assignedRoute?: string;
  status: 'active' | 'inactive';
}

// Route model
export interface Route extends BaseDocument {
  date: Timestamp;
  crewId: string;
  stops: {
    customerId: string;
    order: number;
    estimatedArrival: Timestamp;
    actualArrival?: Timestamp;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    notes?: string;
  }[];
  totalDistance: number;
  totalDuration: number;
  status: 'planned' | 'in_progress' | 'completed';
  optimizedAt?: Timestamp;
}

// Service model
export interface Service extends BaseDocument {
  customerId: string;
  type: string;
  description: string;
  price: number;
  scheduledDate: Timestamp;
  completedDate?: Timestamp;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  photos?: string[]; // URLs to photos in Firebase Storage
}

// Company settings
export interface CompanySettings extends BaseDocument {
  name: string;
  address: string;
  phone: string;
  email: string;
  timezone: string;
  businessHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  serviceTypes: {
    id: string;
    name: string;
    basePrice: number;
    description: string;
  }[];
} 