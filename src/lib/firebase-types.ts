import { Timestamp } from 'firebase/firestore';

// Base interface for all documents
export interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Updated User model with route optimization roles
export interface User extends BaseDocument {
  name: string;
  email: string;
  phone?: string;
  role: 'technician' | 'foreman' | 'office' | 'admin';
  crewId?: string; // Simple crew grouping
  assignedForeman?: string; // For technicians assigned to a foreman
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
  capabilities?: string[]; // Service types this user can handle
  region?: string; // Geographic area or zip code
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

// Service record for customer history
export interface ServiceRecord {
  id: string;
  date: Timestamp;
  foremanId: string;
  beforePhotos: string[]; // Compressed URLs from Firebase Storage
  afterPhotos: string[]; // Compressed URLs from Firebase Storage
  notes: string;
  status: 'completed' | 'cancelled';
}

// Day of week type
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Enhanced Customer model with route optimization features
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
  lastServiceDate?: Timestamp; // For 5-day rolling prioritization
  nextServiceDate?: Timestamp;
  createdBy: string; // User ID who created this customer
  
  // Enhanced fields for route optimization
  servicePreferences: {
    preferredDays: DayOfWeek[];
    preferredTimeRange: { start: string; end: string };
    serviceFrequency: number; // days between services
  };
  
  // Service history with photos
  serviceHistory: ServiceRecord[];
}

// Route optimization interfaces
export interface CustomerPriority {
  customerId: string;
  priority: number; // 1-100 based on multiple factors
  factors: {
    daysSinceLastService: number;
    customerPreferences: {
      preferredDays: DayOfWeek[];
      preferredTimeRange: { start: string; end: string };
    };
    serviceType: string;
    location: { lat: number; lng: number; zipCode: string };
  };
}

export interface CrewAvailability {
  crewId: string;
  foremanId: string;
  technicianIds: string[];
  availability: {
    date: Date;
    startTime: string; // e.g., "08:00"
    endTime: string;   // e.g., "17:00"
    maxCustomers: 12;
    currentLocation?: { lat: number; lng: number };
  };
  capabilities: string[]; // service types they can handle
  region: string; // zip code or geographic area
}

export interface DailyRoute {
  crewId: string;
  date: Date;
  customers: Customer[];
  optimizedPath: { lat: number; lng: number }[];
  estimatedDuration: number;
  totalDistance: number;
  trafficConditions?: any; // Traffic data from Google Maps API
} 