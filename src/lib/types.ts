export type Customer = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  notes: string;
  serviceRequested: string;
  // New fields for scheduling
  servicePreferences: ServicePreferences;
  serviceHistory: ServiceRecord[];
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
};

export type ServicePreferences = {
  preferredDays: DayOfWeek[]; // ['monday', 'tuesday', etc.]
  preferredTimeRange: {
    start: string; // "08:00" format
    end: string;   // "17:00" format
  };
  serviceFrequency: 'weekly' | 'biweekly' | 'monthly' | 'one-time';
  specialInstructions?: string;
};

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type ServiceRecord = {
  id: string;
  date: Date;
  service: string;
  notes?: string;
  completedBy: string; // User ID
  crewId?: string;
  duration?: number; // minutes
  status: 'completed' | 'in-progress' | 'cancelled' | 'no-show';
};

export type Crew = {
  id: string;
  name: string;
  description?: string;
  members: CrewMember[];
  vehicle?: Vehicle;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CrewMember = {
  userId: string;
  role: 'driver' | 'operator' | 'helper' | 'supervisor';
  isActive: boolean;
  joinedAt: Date;
};

export type Vehicle = {
  id: string;
  type: 'truck' | 'trailer' | 'mower' | 'other';
  make?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  capacity?: number; // gallons, weight, etc.
};

export type Schedule = {
  id: string;
  crewId: string;
  date: Date;
  startTime: string; // "08:00" format
  endTime: string;   // "17:00" format
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  assignedCustomers: ScheduledCustomer[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ScheduledCustomer = {
  customerId: string;
  estimatedStartTime: string; // "09:30" format
  estimatedDuration: number; // minutes
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  actualStartTime?: string;
  actualEndTime?: string;
  notes?: string;
};

export type Route = {
  id: string;
  scheduleId: string;
  crewId: string;
  date: Date;
  stops: RouteStop[];
  totalDistance: number; // meters
  totalDuration: number; // minutes
  optimizedAt: Date;
  status: 'draft' | 'optimized' | 'active' | 'completed';
};

export type RouteStop = {
  customerId: string;
  customerName: string;
  address: string;
  lat: number;
  lng: number;
  sequence: number; // order in route
  estimatedArrival: string; // "09:30" format
  estimatedDuration: number; // minutes
  serviceType: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'manager' | 'supervisor' | 'operator' | 'helper';
  companyId?: string;
  crewId?: string; // Which crew they belong to
  schedule?: UserSchedule;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date;
};

export type UserSchedule = {
  workDays: DayOfWeek[];
  workHours: {
    start: string; // "08:00" format
    end: string;   // "17:00" format
  };
  timezone: string;
  availability: 'available' | 'unavailable' | 'part-time';
};
