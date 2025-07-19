import { createCrew } from './crew-service';
import type { Crew } from './types';

// Sample crew data for seeding the database
export const sampleCrews: Omit<Crew, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Crew Alpha',
    description: 'Primary lawn maintenance crew specializing in residential properties',
    companyId: 'company-1', // You'll need to replace this with actual company ID
    employees: [
      {
        id: 'emp-1',
        name: 'John Smith',
        email: 'john.smith@lawnroute.com',
        role: 'driver',
        status: 'active',
        joinedAt: new Date('2024-01-15'),
      },
      {
        id: 'emp-2',
        name: 'Mike Johnson',
        email: 'mike.johnson@lawnroute.com',
        role: 'operator',
        status: 'active',
        joinedAt: new Date('2024-01-15'),
      },
      {
        id: 'emp-3',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@lawnroute.com',
        role: 'helper',
        status: 'active',
        joinedAt: new Date('2024-02-01'),
      },
    ],
    services: [
      {
        serviceType: 'lawn-mowing',
        days: ['monday', 'wednesday', 'friday'],
        isActive: true,
      },
      {
        serviceType: 'edging',
        days: ['tuesday', 'thursday'],
        isActive: true,
      },
      {
        serviceType: 'blow',
        days: ['monday', 'wednesday', 'friday'],
        isActive: true,
      },
    ],
    status: 'active',
    currentLocation: {
      lat: 28.5383,
      lng: -81.3792,
      lastUpdated: new Date(),
    },
    vehicle: {
      type: 'truck',
      make: 'Ford',
      model: 'F-250',
      year: 2022,
      licensePlate: 'ABC-123',
    },
    isActive: true,
    createdBy: 'manager-1', // You'll need to replace this with actual user ID
  },
  {
    name: 'Crew Beta',
    description: 'Commercial properties and large residential estates',
    companyId: 'company-1',
    employees: [
      {
        id: 'emp-4',
        name: 'David Miller',
        email: 'david.miller@lawnroute.com',
        role: 'driver',
        status: 'active',
        joinedAt: new Date('2024-01-20'),
      },
      {
        id: 'emp-5',
        name: 'Lisa Brown',
        email: 'lisa.brown@lawnroute.com',
        role: 'operator',
        status: 'active',
        joinedAt: new Date('2024-01-20'),
      },
      {
        id: 'emp-6',
        name: 'Tom Davis',
        email: 'tom.davis@lawnroute.com',
        role: 'helper',
        status: 'active',
        joinedAt: new Date('2024-02-15'),
      },
    ],
    services: [
      {
        serviceType: 'riding-mow',
        days: ['monday', 'wednesday', 'friday'],
        isActive: true,
      },
      {
        serviceType: 'detail',
        days: ['tuesday', 'thursday'],
        isActive: true,
      },
      {
        serviceType: 'edge',
        days: ['monday', 'wednesday', 'friday'],
        isActive: true,
      },
    ],
    status: 'active',
    currentLocation: {
      lat: 28.5400,
      lng: -81.3800,
      lastUpdated: new Date(),
    },
    vehicle: {
      type: 'truck',
      make: 'Chevrolet',
      model: 'Silverado 2500',
      year: 2023,
      licensePlate: 'XYZ-789',
    },
    isActive: true,
    createdBy: 'manager-1',
  },
  {
    name: 'Crew Gamma',
    description: 'Specialized detail and maintenance services',
    companyId: 'company-1',
    employees: [
      {
        id: 'emp-7',
        name: 'Chris Anderson',
        email: 'chris.anderson@lawnroute.com',
        role: 'supervisor',
        status: 'active',
        joinedAt: new Date('2024-01-10'),
      },
      {
        id: 'emp-8',
        name: 'Maria Rodriguez',
        email: 'maria.rodriguez@lawnroute.com',
        role: 'operator',
        status: 'active',
        joinedAt: new Date('2024-01-10'),
      },
    ],
    services: [
      {
        serviceType: 'detail',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        isActive: true,
      },
      {
        serviceType: 'edge',
        days: ['monday', 'wednesday', 'friday'],
        isActive: true,
      },
    ],
    status: 'active',
    currentLocation: {
      lat: 28.5420,
      lng: -81.3820,
      lastUpdated: new Date(),
    },
    vehicle: {
      type: 'truck',
      make: 'Dodge',
      model: 'Ram 1500',
      year: 2021,
      licensePlate: 'DEF-456',
    },
    isActive: true,
    createdBy: 'manager-1',
  },
];

// Function to seed the database with sample crews
export const seedCrews = async (companyId: string, createdBy: string): Promise<void> => {
  try {
    console.log('Starting crew seeding...');
    
    for (const crewData of sampleCrews) {
      const crewWithIds = {
        ...crewData,
        companyId,
        createdBy,
      };
      
      const crewId = await createCrew(crewWithIds);
      console.log(`Created crew: ${crewData.name} with ID: ${crewId}`);
    }
    
    console.log('Crew seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding crews:', error);
    throw error;
  }
};

// Function to check if crews already exist
export const checkCrewsExist = async (companyId: string): Promise<boolean> => {
  try {
    const { getCrews } = await import('./crew-service');
    const existingCrews = await getCrews(companyId);
    return existingCrews.length > 0;
  } catch (error) {
    console.error('Error checking existing crews:', error);
    return false;
  }
};

// Function to safely seed crews (only if they don't exist)
export const safeSeedCrews = async (companyId: string, createdBy: string): Promise<void> => {
  try {
    const crewsExist = await checkCrewsExist(companyId);
    
    if (crewsExist) {
      console.log('Crews already exist, skipping seeding...');
      return;
    }
    
    await seedCrews(companyId, createdBy);
  } catch (error) {
    console.error('Error in safe crew seeding:', error);
    throw error;
  }
}; 