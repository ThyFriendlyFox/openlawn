import { Timestamp } from 'firebase/firestore';
import type { 
  Customer, 
  CustomerPriority, 
  CrewAvailability, 
  DailyRoute, 
  User,
  DayOfWeek 
} from './firebase-types';
import { calculateCustomerPriorities, getCustomersNeedingService } from './customer-service';
import { getUsers, getUsersByRole } from './user-service';

// Route cache for daily routes
const routeCache = new Map<string, DailyRoute>();

// Get available crews for a specific date
export const getAvailableCrews = async (date: Date): Promise<CrewAvailability[]> => {
  const users = await getUsers();
  
  // Group users by crewId to create crews
  const crewMap = new Map<string, {
    crewId: string;
    crewServiceType: string;
    employees: User[];
    manager?: User;
  }>();
  
  // Process all users with crew assignments
  users.forEach(user => {
    if (user.crewId && user.status === 'available') {
      if (!crewMap.has(user.crewId)) {
        crewMap.set(user.crewId, {
          crewId: user.crewId,
          crewServiceType: user.crewServiceType || 'general',
          employees: [],
          manager: undefined
        });
      }
      
      const crew = crewMap.get(user.crewId)!;
      if (user.role === 'manager') {
        crew.manager = user;
      } else {
        crew.employees.push(user);
      }
    }
  });
  
  // Convert to CrewAvailability format
  return Array.from(crewMap.values())
    .filter(crew => crew.manager && crew.employees.length > 0) // Only crews with manager and employees
    .map(crew => ({
      crewId: crew.crewId,
      managerId: crew.manager!.id,
      employeeIds: crew.employees.map(emp => emp.id),
      availability: {
        date,
        startTime: crew.manager!.schedule?.[getDayOfWeek(date)]?.start || '08:00',
        endTime: crew.manager!.schedule?.[getDayOfWeek(date)]?.end || '17:00',
        maxCustomers: 12,
        currentLocation: crew.manager!.currentLocation ? {
          lat: crew.manager!.currentLocation.lat,
          lng: crew.manager!.currentLocation.lng
        } : undefined,
      },
      capabilities: [crew.crewServiceType], // Crew can only handle its assigned service type
      region: crew.manager!.region || 'default',
    }));
};

// Get day of week as string
const getDayOfWeek = (date: Date): DayOfWeek => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()] as DayOfWeek;
};

// Geographic clustering by zip code
export const clusterByZipCode = (customers: CustomerPriority[]): Map<string, CustomerPriority[]> => {
  const clusters = new Map<string, CustomerPriority[]>();
  
  customers.forEach(customer => {
    const zipCode = customer.factors.location.zipCode;
    if (!clusters.has(zipCode)) {
      clusters.set(zipCode, []);
    }
    clusters.get(zipCode)!.push(customer);
  });
  
  return clusters;
};

// Assign clusters to crews based on region
export const assignClustersToCrews = (
  clusters: Map<string, CustomerPriority[]>,
  crews: CrewAvailability[]
): Array<{ crew: CrewAvailability; customers: CustomerPriority[] }> => {
  const assignments: Array<{ crew: CrewAvailability; customers: CustomerPriority[] }> = [];
  
  // Simple assignment: assign clusters to crews based on region matching
  clusters.forEach((customers, zipCode) => {
    // Find crew in same region or assign to first available crew
    const matchingCrew = crews.find(crew => crew.region === zipCode) || crews[0];
    
    if (matchingCrew) {
      assignments.push({
        crew: matchingCrew,
        customers: customers.sort((a, b) => b.priority - a.priority)
      });
    }
  });
  
  return assignments;
};

// Optimize route for a crew using Google Maps Distance Matrix API
export const optimizeRouteForCrew = async (
  crew: CrewAvailability,
  customers: CustomerPriority[],
  date: Date
): Promise<DailyRoute> => {
  // Get full customer data
  const customerData = await Promise.all(
    customers.map(async (customerPriority) => {
      const response = await fetch(`/api/customers/${customerPriority.customerId}`);
      return response.json();
    })
  );
  
  // Simple route optimization (can be enhanced with Google Maps API)
  const optimizedPath = customerData.map(customer => ({
    lat: customer.lat,
    lng: customer.lng
  }));
  
  // Calculate estimated duration (30 minutes per customer + travel time)
  const estimatedDuration = customerData.length * 30; // minutes
  
  // Calculate total distance (simplified)
  let totalDistance = 0;
  for (let i = 1; i < optimizedPath.length; i++) {
    const prev = optimizedPath[i - 1];
    const curr = optimizedPath[i];
    totalDistance += calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
  }
  
  return {
    crewId: crew.crewId,
    date,
    customers: customerData,
    optimizedPath,
    estimatedDuration,
    totalDistance,
  };
};

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Generate optimal routes for a specific date
export const generateOptimalRoutes = async (date: Date): Promise<DailyRoute[]> => {
  // Step 1: Calculate customer priorities
  const customerPriorities = await calculateCustomerPriorities(date);
  
  // Step 2: Get available crews
  const availableCrews = await getAvailableCrews(date);
  
  if (availableCrews.length === 0) {
    return [];
  }
  
  // Step 3: Geographic clustering by zip code
  const clusters = clusterByZipCode(customerPriorities);
  
  // Step 4: Assign clusters to crews
  const crewAssignments = assignClustersToCrews(clusters, availableCrews);
  
  // Step 5: Optimize each crew's route
  const routes = await Promise.all(
    crewAssignments.map(async (assignment) => {
      const prioritizedCustomers = assignment.customers.slice(0, 12); // Max 12 customers
      
      return await optimizeRouteForCrew(
        assignment.crew,
        prioritizedCustomers,
        date
      );
    })
  );
  
  return routes;
};

// Get cached route for a crew on a specific date
export const getCachedRoute = async (crewId: string, date: Date): Promise<DailyRoute | null> => {
  const cacheKey = `${crewId}-${date.toISOString().split('T')[0]}`;
  
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }
  
  // Generate new route
  const routes = await generateOptimalRoutes(date);
  const crewRoute = routes.find(route => route.crewId === crewId);
  
  if (crewRoute) {
    routeCache.set(cacheKey, crewRoute);
    return crewRoute;
  }
  
  return null;
};

// Clear route cache (useful for testing or when routes need to be regenerated)
export const clearRouteCache = (): void => {
  routeCache.clear();
};

// Update route for traffic changes
export const updateRouteForTraffic = async (
  crewId: string, 
  currentLocation: { lat: number; lng: number }
): Promise<DailyRoute | null> => {
  const today = new Date();
  const existingRoute = await getCachedRoute(crewId, today);
  
  if (!existingRoute) {
    return null;
  }
  
  // Re-optimize route with current location
  const remainingCustomers = existingRoute.customers.filter(customer => 
    !customer.services.some(service => service.status === 'completed')
  );
  
  if (remainingCustomers.length === 0) {
    return existingRoute;
  }
  
  // Create new crew availability with current location
  const crew: CrewAvailability = {
    crewId: existingRoute.crewId,
    foremanId: '', // Will be filled by the optimization function
    technicianIds: [],
    availability: {
      date: today,
      startTime: '08:00',
      endTime: '17:00',
      maxCustomers: 12,
      currentLocation,
    },
    capabilities: ['general'],
    region: 'default',
  };
  
  // Re-optimize route
  const customerPriorities = remainingCustomers.map(customer => ({
    customerId: customer.id,
    priority: 100, // High priority for remaining customers
    factors: {
      daysSinceLastService: 0,
      customerPreferences: customer.servicePreferences,
      serviceType: customer.services[0]?.type || 'general',
      location: { lat: customer.lat, lng: customer.lng, zipCode: '' },
    },
  }));
  
  const updatedRoute = await optimizeRouteForCrew(crew, customerPriorities, today);
  
  // Update cache
  const cacheKey = `${crewId}-${today.toISOString().split('T')[0]}`;
  routeCache.set(cacheKey, updatedRoute);
  
  return updatedRoute;
};

// Get all routes for a specific date
export const getAllRoutesForDate = async (date: Date): Promise<DailyRoute[]> => {
  const routes = await generateOptimalRoutes(date);
  
  // Cache all routes
  routes.forEach(route => {
    const cacheKey = `${route.crewId}-${date.toISOString().split('T')[0]}`;
    routeCache.set(cacheKey, route);
  });
  
  return routes;
}; 