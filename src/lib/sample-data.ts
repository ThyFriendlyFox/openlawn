import type { Customer, Crew, Schedule, ServicePreferences, DayOfWeek } from './types';

// Sample service preferences
export const sampleServicePreferences: ServicePreferences[] = [
  {
    preferredDays: ['monday', 'wednesday', 'friday'] as DayOfWeek[],
    preferredTimeRange: { start: '08:00', end: '12:00' },
    serviceFrequency: 'weekly',
    specialInstructions: 'Please use side gate, code is 1234'
  },
  {
    preferredDays: ['tuesday', 'thursday'] as DayOfWeek[],
    preferredTimeRange: { start: '13:00', end: '17:00' },
    serviceFrequency: 'biweekly',
    specialInstructions: 'Dog in backyard, please call before arrival'
  },
  {
    preferredDays: ['monday', 'friday'] as DayOfWeek[],
    preferredTimeRange: { start: '09:00', end: '15:00' },
    serviceFrequency: 'weekly',
    specialInstructions: 'Park in driveway, avoid blocking mailbox'
  },
  {
    preferredDays: ['wednesday', 'saturday'] as DayOfWeek[],
    preferredTimeRange: { start: '10:00', end: '16:00' },
    serviceFrequency: 'monthly',
    specialInstructions: 'Water plants if needed'
  }
];

// Enhanced sample customers with service preferences
export const sampleCustomers: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: "John Smith",
    address: "123 Oak Street, Orlando, FL 32801",
    lat: 28.5383,
    lng: -81.3792,
    notes: "Large front yard, needs weekly maintenance",
    serviceRequested: "Lawn mowing and edging",
    servicePreferences: sampleServicePreferences[0],
    serviceHistory: [
      {
        id: "1",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        service: "Lawn mowing and edging",
        notes: "Completed successfully",
        completedBy: "user123",
        crewId: "crew1",
        duration: 45,
        status: "completed"
      }
    ],
    status: "active"
  },
  {
    name: "Sarah Johnson",
    address: "456 Pine Avenue, Orlando, FL 32803",
    lat: 28.5449,
    lng: -81.3789,
    notes: "Small yard, prefers afternoon service",
    serviceRequested: "Lawn mowing and trimming",
    servicePreferences: sampleServicePreferences[1],
    serviceHistory: [
      {
        id: "2",
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        service: "Lawn mowing and trimming",
        notes: "Customer requested extra attention to hedges",
        completedBy: "user123",
        crewId: "crew1",
        duration: 30,
        status: "completed"
      }
    ],
    status: "active"
  },
  {
    name: "Mike Davis",
    address: "789 Maple Drive, Orlando, FL 32805",
    lat: 28.5515,
    lng: -81.3786,
    notes: "Commercial property, needs professional service",
    serviceRequested: "Complete lawn care package",
    servicePreferences: sampleServicePreferences[2],
    serviceHistory: [
      {
        id: "3",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        service: "Complete lawn care package",
        notes: "Applied fertilizer, customer very satisfied",
        completedBy: "user123",
        crewId: "crew1",
        duration: 90,
        status: "completed"
      }
    ],
    status: "active"
  },
  {
    name: "Lisa Wilson",
    address: "321 Elm Court, Orlando, FL 32807",
    lat: 28.5581,
    lng: -81.3783,
    notes: "New customer, needs initial assessment",
    serviceRequested: "Lawn mowing and cleanup",
    servicePreferences: sampleServicePreferences[3],
    serviceHistory: [],
    status: "active"
  },
  {
    name: "Robert Brown",
    address: "654 Cedar Lane, Orlando, FL 32809",
    lat: 28.5647,
    lng: -81.3780,
    notes: "Large property, requires special equipment",
    serviceRequested: "Heavy duty lawn maintenance",
    servicePreferences: {
      preferredDays: ['monday', 'wednesday'] as DayOfWeek[],
      preferredTimeRange: { start: '07:00', end: '11:00' },
      serviceFrequency: 'weekly',
      specialInstructions: 'Use commercial mower, property has steep slopes'
    },
    serviceHistory: [
      {
        id: "4",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        service: "Heavy duty lawn maintenance",
        notes: "Used commercial equipment, completed safely",
        completedBy: "user123",
        crewId: "crew1",
        duration: 120,
        status: "completed"
      }
    ],
    status: "active"
  }
];

// Sample crews
export const sampleCrews: Omit<Crew, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: "Crew Alpha",
    description: "Primary lawn care team",
    members: [
      {
        userId: "user123",
        role: "supervisor",
        isActive: true,
        joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
      },
      {
        userId: "user456",
        role: "operator",
        isActive: true,
        joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) // 6 months ago
      },
      {
        userId: "user789",
        role: "helper",
        isActive: true,
        joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 3 months ago
      }
    ],
    vehicle: {
      id: "vehicle1",
      type: "truck",
      make: "Ford",
      model: "F-250",
      year: 2020,
      licensePlate: "ABC-123",
      capacity: 1000
    },
    companyId: "company1",
    isActive: true
  },
  {
    name: "Crew Beta",
    description: "Specialized maintenance team",
    members: [
      {
        userId: "user101",
        role: "driver",
        isActive: true,
        joinedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000) // 7 months ago
      },
      {
        userId: "user202",
        role: "operator",
        isActive: true,
        joinedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000) // 5 months ago
      }
    ],
    vehicle: {
      id: "vehicle2",
      type: "trailer",
      make: "Utility",
      model: "3000R",
      year: 2019,
      licensePlate: "XYZ-789",
      capacity: 500
    },
    companyId: "company1",
    isActive: true
  }
];

// Sample schedules
export const sampleSchedules: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    crewId: "crew1",
    date: new Date(),
    startTime: "08:00",
    endTime: "17:00",
    status: "scheduled",
    assignedCustomers: [
      {
        customerId: "customer1",
        estimatedStartTime: "08:30",
        estimatedDuration: 45,
        priority: "high",
        status: "pending"
      },
      {
        customerId: "customer2",
        estimatedStartTime: "09:30",
        estimatedDuration: 30,
        priority: "medium",
        status: "pending"
      },
      {
        customerId: "customer3",
        estimatedStartTime: "10:15",
        estimatedDuration: 90,
        priority: "high",
        status: "pending"
      }
    ],
    notes: "Focus on high priority customers first"
  },
  {
    crewId: "crew1",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    startTime: "08:00",
    endTime: "17:00",
    status: "scheduled",
    assignedCustomers: [
      {
        customerId: "customer4",
        estimatedStartTime: "08:00",
        estimatedDuration: 60,
        priority: "medium",
        status: "pending"
      },
      {
        customerId: "customer5",
        estimatedStartTime: "09:15",
        estimatedDuration: 120,
        priority: "high",
        status: "pending"
      }
    ],
    notes: "Commercial property requires special attention"
  }
];

// Helper function to create sample data for testing
export const createSampleData = async (userId: string) => {
  const { addCustomer } = await import('./customer-service');
  const { addCrew } = await import('./crew-service');
  const { createSchedule } = await import('./schedule-service');

  console.log('Creating sample data for user:', userId);

  // Add sample customers
  const customerIds = [];
  for (const customer of sampleCustomers) {
    try {
      // Add createdAt and updatedAt to match the expected type
      const customerWithDates = {
        ...customer,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const customerId = await addCustomer(customerWithDates, userId);
      customerIds.push(customerId);
      console.log('Added customer:', customer.name, 'with ID:', customerId);
    } catch (error) {
      console.error('Error adding customer:', customer.name, error);
    }
  }

  // Add sample crews
  const crewIds = [];
  for (const crew of sampleCrews) {
    try {
      const crewId = await addCrew(crew);
      crewIds.push(crewId);
      console.log('Added crew:', crew.name, 'with ID:', crewId);
    } catch (error) {
      console.error('Error adding crew:', crew.name, error);
    }
  }

  // Add sample schedules (if we have crews)
  if (crewIds.length > 0) {
    for (const schedule of sampleSchedules) {
      try {
        const scheduleWithCrewId = {
          ...schedule,
          crewId: crewIds[0] // Use first crew
        };
        const scheduleId = await createSchedule(scheduleWithCrewId);
        console.log('Added schedule for crew:', scheduleWithCrewId.crewId, 'with ID:', scheduleId);
      } catch (error) {
        console.error('Error adding schedule:', error);
      }
    }
  }

  console.log('Sample data creation completed');
  return { customerIds, crewIds };
}; 