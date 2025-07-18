import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Route, RouteStop, Schedule, Customer } from './types';

// Firestore interfaces
export interface FirestoreRoute {
  id?: string;
  scheduleId: string;
  crewId: string;
  date: Timestamp;
  stops: FirestoreRouteStop[];
  totalDistance: number;
  totalDuration: number;
  optimizedAt: Timestamp;
  status: 'draft' | 'optimized' | 'active' | 'completed';
}

export interface FirestoreRouteStop {
  customerId: string;
  customerName: string;
  address: string;
  lat: number;
  lng: number;
  sequence: number;
  estimatedArrival: string;
  estimatedDuration: number;
  serviceType: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
}

// Convert Firestore data to Route type
const convertFirestoreRoute = (doc: any): Route => {
  const data = doc.data();
  return {
    id: doc.id,
    scheduleId: data.scheduleId,
    crewId: data.crewId,
    date: data.date.toDate(),
    stops: data.stops.map((stop: FirestoreRouteStop) => ({
      customerId: stop.customerId,
      customerName: stop.customerName,
      address: stop.address,
      lat: stop.lat,
      lng: stop.lng,
      sequence: stop.sequence,
      estimatedArrival: stop.estimatedArrival,
      estimatedDuration: stop.estimatedDuration,
      serviceType: stop.serviceType,
      priority: stop.priority,
      status: stop.status,
    })),
    totalDistance: data.totalDistance,
    totalDuration: data.totalDuration,
    optimizedAt: data.optimizedAt.toDate(),
    status: data.status,
  };
};

// Convert Route type to Firestore data
const convertToFirestoreRoute = (route: Omit<Route, 'id' | 'optimizedAt'>): Omit<FirestoreRoute, 'id'> => {
  return {
    scheduleId: route.scheduleId,
    crewId: route.crewId,
    date: Timestamp.fromDate(route.date),
    stops: route.stops.map(stop => ({
      customerId: stop.customerId,
      customerName: stop.customerName,
      address: stop.address,
      lat: stop.lat,
      lng: stop.lng,
      sequence: stop.sequence,
      estimatedArrival: stop.estimatedArrival,
      estimatedDuration: stop.estimatedDuration,
      serviceType: stop.serviceType,
      priority: stop.priority,
      status: stop.status,
    })),
    totalDistance: route.totalDistance,
    totalDuration: route.totalDuration,
    optimizedAt: Timestamp.now(),
    status: route.status,
  };
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Simple route optimization using nearest neighbor algorithm
const optimizeRoute = (customers: Customer[], startLocation?: { lat: number; lng: number }): RouteStop[] => {
  if (customers.length === 0) return [];

  const stops: RouteStop[] = [];
  const unvisited = [...customers];
  
  // Start from the first customer or a default location
  let currentLocation = startLocation || {
    lat: unvisited[0].lat,
    lng: unvisited[0].lng
  };

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    // Find the nearest unvisited customer
    for (let i = 0; i < unvisited.length; i++) {
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        unvisited[i].lat,
        unvisited[i].lng
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    const nearestCustomer = unvisited[nearestIndex];
    
    // Create route stop
    const stop: RouteStop = {
      customerId: nearestCustomer.id,
      customerName: nearestCustomer.name,
      address: nearestCustomer.address,
      lat: nearestCustomer.lat,
      lng: nearestCustomer.lng,
      sequence: stops.length + 1,
      estimatedArrival: '09:00', // This should be calculated based on previous stops
      estimatedDuration: 30, // Default 30 minutes per customer
      serviceType: nearestCustomer.serviceRequested,
      priority: 'medium',
      status: 'pending',
    };

    stops.push(stop);
    
    // Update current location and remove visited customer
    currentLocation = { lat: nearestCustomer.lat, lng: nearestCustomer.lng };
    unvisited.splice(nearestIndex, 1);
  }

  return stops;
};

// Get route for a schedule
export const getRouteForSchedule = async (scheduleId: string): Promise<Route | null> => {
  try {
    const routesRef = collection(db, 'routes');
    const q = query(
      routesRef,
      where('scheduleId', '==', scheduleId)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return convertFirestoreRoute(querySnapshot.docs[0]);
    }
    return null;
  } catch (error) {
    console.error('Error fetching route for schedule:', error);
    throw error;
  }
};

// Get route for a specific date
export const getRouteByDate = async (crewId: string, date: Date): Promise<Route | null> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const routesRef = collection(db, 'routes');
    const q = query(
      routesRef,
      where('crewId', '==', crewId),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay))
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return convertFirestoreRoute(querySnapshot.docs[0]);
    }
    return null;
  } catch (error) {
    console.error('Error fetching route by date:', error);
    throw error;
  }
};

// Create optimized route from schedule
export const createOptimizedRoute = async (
  schedule: Schedule,
  customers: Customer[]
): Promise<string> => {
  try {
    // Get customers from the schedule
    const scheduleCustomers = customers.filter(customer =>
      schedule.assignedCustomers.some(assigned => assigned.customerId === customer.id)
    );

    // Optimize the route
    const optimizedStops = optimizeRoute(scheduleCustomers);

    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 1; i < optimizedStops.length; i++) {
      const prevStop = optimizedStops[i - 1];
      const currentStop = optimizedStops[i];
      
      const distance = calculateDistance(
        prevStop.lat,
        prevStop.lng,
        currentStop.lat,
        currentStop.lng
      );
      
      totalDistance += distance;
      totalDuration += currentStop.estimatedDuration;
    }

    // Create route document
    const route: Omit<Route, 'id' | 'optimizedAt'> = {
      scheduleId: schedule.id,
      crewId: schedule.crewId,
      date: schedule.date,
      stops: optimizedStops,
      totalDistance,
      totalDuration,
      status: 'optimized',
    };

    const firestoreRoute = convertToFirestoreRoute(route);
    const docRef = await addDoc(collection(db, 'routes'), firestoreRoute);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating optimized route:', error);
    throw error;
  }
};

// Update route status
export const updateRouteStatus = async (routeId: string, status: Route['status']): Promise<void> => {
  try {
    const routeRef = doc(db, 'routes', routeId);
    await updateDoc(routeRef, {
      status,
      optimizedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating route status:', error);
    throw error;
  }
};

// Update stop status
export const updateStopStatus = async (
  routeId: string,
  customerId: string,
  status: RouteStop['status']
): Promise<void> => {
  try {
    const routeRef = doc(db, 'routes', routeId);
    const routeDoc = await getDoc(routeRef);
    
    if (!routeDoc.exists()) {
      throw new Error('Route not found');
    }

    const routeData = routeDoc.data();
    const updatedStops = routeData.stops.map((stop: FirestoreRouteStop) => {
      if (stop.customerId === customerId) {
        return { ...stop, status };
      }
      return stop;
    });
    
    await updateDoc(routeRef, {
      stops: updatedStops,
      optimizedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating stop status:', error);
    throw error;
  }
};

// Get routes for a crew
export const getCrewRoutes = async (crewId: string, startDate?: Date, endDate?: Date): Promise<Route[]> => {
  try {
    const routesRef = collection(db, 'routes');
    let q = query(
      routesRef,
      where('crewId', '==', crewId),
      orderBy('date', 'asc')
    );

    if (startDate && endDate) {
      q = query(
        routesRef,
        where('crewId', '==', crewId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'asc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertFirestoreRoute);
  } catch (error) {
    console.error('Error fetching crew routes:', error);
    throw error;
  }
};

// Listen to routes in real-time
export const subscribeToRoutes = (
  crewId: string,
  callback: (routes: Route[]) => void
): (() => void) => {
  const routesRef = collection(db, 'routes');
  const q = query(
    routesRef,
    where('crewId', '==', crewId),
    orderBy('date', 'asc')
  );

  return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const routes = querySnapshot.docs.map(convertFirestoreRoute);
    callback(routes);
  });
}; 