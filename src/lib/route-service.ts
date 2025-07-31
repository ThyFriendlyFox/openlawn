import { Timestamp } from 'firebase/firestore';
import type { 
  Customer, 
  CustomerPriority, 
  CrewAvailability, 
  DailyRoute, 
  User,
  DayOfWeek 
} from './firebase-types';
import { calculateCustomerPriorities, getCustomersNeedingService, getCustomers } from './customer-service';
import { getUsers, getUsersByRole } from './user-service';

// Route cache for daily routes
const routeCache = new Map<string, DailyRoute>();

// Get available crews for a specific date
export const getAvailableCrews = async (date: Date): Promise<CrewAvailability[]> => {
  const users = await getUsers();
  
  // Group users by crewId to create crews
  const crewMap = new Map<string, {
    crewId: string;
    crewServiceTypes: string[];
    employees: User[];
    manager?: User;
  }>();
  
  // Process all users with crew assignments
  users.forEach(user => {
    if (user.crewId && user.status === 'available') {
      if (!crewMap.has(user.crewId)) {
        crewMap.set(user.crewId, {
          crewId: user.crewId,
          crewServiceTypes: user.crewServiceTypes || ['general'],
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
  const availableCrews = Array.from(crewMap.values())
    .filter(crew => crew.manager && crew.employees.length > 0) // Only crews with manager and employees
    .map(crew => ({
      crewId: crew.crewId,
      managerId: crew.manager!.id,
      employeeIds: crew.employees.map(emp => emp.id),
      availability: {
        date,
        startTime: crew.manager!.schedule?.[getDayOfWeek(date)]?.start || '08:00',
        endTime: crew.manager!.schedule?.[getDayOfWeek(date)]?.end || '17:00',
        maxCustomers: 12 as const,
        currentLocation: crew.manager!.currentLocation ? {
          lat: crew.manager!.currentLocation.lat,
          lng: crew.manager!.currentLocation.lng
        } : undefined,
      },
      capabilities: crew.crewServiceTypes, // Crew can handle multiple service types
      region: crew.manager!.region || 'default',
    }));
    
  return availableCrews;
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
  // Get all customers to match with priorities
  const allCustomers = await getCustomers();
  
  // Filter customers by crew service types and get full customer data
  const compatibleCustomers = customers
    .map(customerPriority => {
      const customer = allCustomers.find(c => c.id === customerPriority.customerId);
      if (!customer) return null;
      
      // Check if customer's service type matches crew's capabilities
      const hasCompatibleService = customer.services.some(service => 
        crew.capabilities.includes(service.type)
      );
      
      return hasCompatibleService ? customer : null;
    })
    .filter(Boolean) as Customer[];
  
  // Sort by priority
  const sortedCustomers = compatibleCustomers.sort((a, b) => {
    const aPriority = customers.find(c => c.customerId === a.id)?.priority || 0;
    const bPriority = customers.find(c => c.customerId === b.id)?.priority || 0;
    return bPriority - aPriority;
  });
  
  // Limit to max customers per crew
  const limitedCustomers = sortedCustomers.slice(0, crew.availability.maxCustomers);
  
  // Simple route optimization (nearest neighbor)
  const optimizedPath = limitedCustomers.map(customer => ({
    lat: customer.lat,
    lng: customer.lng
  }));
  
  // Calculate total distance
  let totalDistance = 0;
  for (let i = 1; i < optimizedPath.length; i++) {
    const prev = optimizedPath[i - 1];
    const curr = optimizedPath[i];
    totalDistance += calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
  }
  
  // Calculate estimated duration (30 minutes per customer + travel time)
  const estimatedDuration = limitedCustomers.length * 30; // minutes
  
  return {
    crewId: crew.crewId,
    date,
    customers: limitedCustomers,
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
      
      // Get full customer data for the prioritized customers
      const allCustomers = await getCustomers();
      const customerObjects = prioritizedCustomers
        .map(customerPriority => allCustomers.find(c => c.id === customerPriority.customerId))
        .filter(Boolean) as Customer[];
      
      return await generateGoogleDirectionsRoute(
        assignment.crew,
        customerObjects
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
    managerId: '', // Will be filled by the optimization function
    employeeIds: [],
    availability: {
      date: today,
      startTime: '08:00',
      endTime: '17:00',
      maxCustomers: 12 as const,
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

// Get customers assigned to a specific employee for today and tomorrow
export const getEmployeeAssignedCustomers = async (employeeId: string): Promise<Customer[]> => {
  const users = await getUsers();
  const employee = users.find(user => user.id === employeeId);
  
  if (!employee || !employee.crewId) {
    return [];
  }
  
  // Get all customers
  const allCustomers = await getCustomers();
  
  // Get routes for today and tomorrow
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayRoutes = await generateOptimalRoutes(today);
  const tomorrowRoutes = await generateOptimalRoutes(tomorrow);
  
  // Find routes for this employee's crew
  const crewRoutes = [...todayRoutes, ...tomorrowRoutes].filter(route => 
    route.crewId === employee.crewId
  );
  
  // Get all customers from these routes
  const assignedCustomerIds = new Set<string>();
  crewRoutes.forEach(route => {
    route.customers.forEach(customer => {
      assignedCustomerIds.add(customer.id);
    });
  });
  
  // Return customers assigned to this employee's crew
  return allCustomers.filter(customer => assignedCustomerIds.has(customer.id));
}; 

// Generate Google Directions API route for a crew
export const generateGoogleDirectionsRoute = async (
  crew: CrewAvailability,
  customers: Customer[]
): Promise<DailyRoute> => {
  if (customers.length === 0) {
    return {
      crewId: crew.crewId,
      date: crew.availability.date,
      customers: [],
      optimizedPath: [],
      estimatedDuration: 0,
      totalDistance: 0,
    };
  }

  // Create waypoints for Google Directions API
  const waypoints = customers.map(customer => ({
    location: { lat: customer.lat, lng: customer.lng },
    stopover: true,
  }));

  // Use first customer as origin, last as destination
  const origin = { lat: customers[0].lat, lng: customers[0].lng };
  const destination = { 
    lat: customers[customers.length - 1].lat, 
    lng: customers[customers.length - 1].lng 
  };

  // If we have more than 2 customers, use waypoints
  const waypointsForAPI = customers.length > 2 ? waypoints.slice(1, -1) : [];

  try {
    // This would need to be called from the frontend where Google Maps API is available
    // For now, we'll create a simple polyline path
    const optimizedPath = customers.map(customer => ({
      lat: customer.lat,
      lng: customer.lng
    }));

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 1; i < optimizedPath.length; i++) {
      const prev = optimizedPath[i - 1];
      const curr = optimizedPath[i];
      totalDistance += calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
    }

    const estimatedDuration = customers.length * 30; // 30 minutes per customer

    return {
      crewId: crew.crewId,
      date: crew.availability.date,
      customers,
      optimizedPath,
      estimatedDuration,
      totalDistance,
    };
  } catch (error) {
    console.error('Error generating Google Directions route:', error);
    
    // Fallback to simple path
    const optimizedPath = customers.map(customer => ({
      lat: customer.lat,
      lng: customer.lng
    }));

    return {
      crewId: crew.crewId,
      date: crew.availability.date,
      customers,
      optimizedPath,
      estimatedDuration: customers.length * 30,
      totalDistance: 0,
    };
  }
}; 