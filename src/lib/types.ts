export type ServiceType = 'push-mow' | 'edge' | 'blow' | 'detail' | 'riding-mow';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Legacy types for backward compatibility - these will be removed as we migrate
export type Customer = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  notes: string;
  serviceRequested: ServiceType;
  servicePreferences: ServicePreferences;
  serviceHistory: ServiceRecord[];
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
};

export type ServicePreferences = {
  preferredDays: DayOfWeek[];
  preferredTimeRange: {
    start: string;
    end: string;
  };
  serviceFrequency: 'weekly' | 'biweekly' | 'monthly' | 'one-time';
  specialInstructions?: string;
};

export type ServiceRecord = {
  id: string;
  date: Date;
  service: string;
  notes?: string;
  completedBy: string;
  crewId?: string;
  duration?: number;
  status: 'completed' | 'in-progress' | 'cancelled' | 'no-show';
};

// Simple user profile type for backward compatibility
export type UserProfile = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'employee' | 'manager' | 'admin';
  crewId?: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date;
};
