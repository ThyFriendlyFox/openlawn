# Route Optimization System Documentation

## Overview

This document outlines the implementation of a dynamic route optimization system for the OpenLawn application. The system prioritizes simplicity by avoiding unnecessary database collections while providing sophisticated route generation based on multiple factors.

## Backend Architecture

### Collections Structure

#### 1. `users` Collection
```typescript
interface User {
  id: string;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 2. `customers` Collection (Enhanced)
```typescript
interface Customer {
  id: string;
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
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface ServiceRecord {
  id: string;
  date: Timestamp;
  foremanId: string;
  beforePhotos: string[]; // Compressed URLs from Firebase Storage
  afterPhotos: string[]; // Compressed URLs from Firebase Storage
  notes: string;
  status: 'completed' | 'cancelled';
}
```

#### 3. Firebase Storage
- **Path Structure**: `customers/{customerId}/photos/{timestamp}/`
- **Compression**: WebP format + resize to reasonable dimensions
- **Auto-delete**: Lifecycle rules delete files older than X days
- **Storage Limit**: 5GB before charges (compression helps stay under)

### Why No Routes Collection?

Routes are **dynamic and ephemeral** - they don't need persistent storage because:
1. **Traffic changes** require route recalculation
2. **Customer cancellations** affect route optimization
3. **Crew availability** changes throughout the day
4. **Routes are calculated once per day per crew** and cached in memory

## Route Generation Algorithm

### Two-Part Strategy

#### Part 1: Customer Prioritization & Clustering
```typescript
interface CustomerPriority {
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
```

#### Part 2: Crew Availability & Assignment
```typescript
interface CrewAvailability {
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
```

### Priority Calculation Factors

1. **Days Since Last Service** (Primary factor)
   - Customers not serviced in 5+ days get highest priority
   - Formula: `priority += (daysSinceLastService * 10)`

2. **Customer Preferences**
   - Preferred days of service
   - Preferred time ranges
   - Service frequency requirements

3. **Geographic Density**
   - Customers in same zip code get grouped
   - Proximity to crew's current location

4. **Service Type**
   - Crew capabilities vs. customer service requirements
   - Service complexity affects time allocation

### Route Generation Process

```typescript
async function generateOptimalRoutes(date: Date) {
  // Step 1: Calculate customer priorities
  const customerPriorities = calculateCustomerPriorities(customers, date);
  
  // Step 2: Get available crews
  const availableCrews = getAvailableCrews(date);
  
  // Step 3: Geographic clustering by crew regions
  const crewRegions = clusterByRegion(customerPriorities, availableCrews);
  
  // Step 4: Optimize each region's route
  const routes = await Promise.all(
    crewRegions.map(async (region) => {
      const prioritizedCustomers = region.customers
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 12); // Max 12 customers per day
      
      return await optimizeRouteForCrew(
        region.crew,
        prioritizedCustomers,
        date
      );
    })
  );
  
  return routes;
}
```

### Geographic Clustering Strategy

```typescript
function clusterByRegion(customers: CustomerPriority[], crews: CrewAvailability[]) {
  // Option A: Zip code clustering (simplest)
  const zipCodeClusters = groupByZipCode(customers);
  
  // Option B: K-means clustering by coordinates
  const coordinateClusters = kMeansClustering(
    customers.map(c => [c.factors.location.lat, c.factors.location.lng])
  );
  
  // Option C: Grid-based clustering (10-mile squares)
  const gridClusters = gridBasedClustering(customers, 10);
  
  return assignClustersToCrews(clusters, crews);
}
```

### Traffic Integration

```typescript
async function getTrafficOptimizedRoute(
  customers: CustomerPriority[], 
  startTime: Date
) {
  const origins = customers.map(c => `${c.factors.location.lat},${c.factors.location.lng}`);
  const destinations = customers.map(c => `${c.factors.location.lat},${c.factors.location.lng}`);
  
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?` +
    `origins=${origins.join('|')}&destinations=${destinations.join('|')}&` +
    `departure_time=${startTime.getTime()}&traffic_model=best_guess&` +
    `key=${GOOGLE_MAPS_API_KEY}`
  );
  
  return response.json();
}
```

## Caching Strategy

### Daily Route Cache
```typescript
const routeCache = new Map<string, DailyRoute>();

async function getCachedRoute(crewId: string, date: Date) {
  const cacheKey = `${crewId}-${date.toISOString().split('T')[0]}`;
  
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }
  
  // Generate and cache new route
  const route = await generateCrewRoute(crewId, date);
  routeCache.set(cacheKey, route);
  
  return route;
}
```

### Cache Invalidation
- Routes are recalculated when:
  - New day starts
  - Customer cancels service
  - Crew availability changes
  - Traffic conditions significantly change

## Photo Management System

### Firebase Storage Structure
```
customers/
  {customerId}/
    photos/
      {timestamp}/
        before/
          photo1.webp
          photo2.webp
        after/
          photo1.webp
          photo2.webp
```

### Compression Strategy
```typescript
async function compressAndUploadPhoto(file: File, customerId: string, type: 'before' | 'after') {
  // 1. Resize to reasonable dimensions (e.g., 1920x1080 max)
  const resizedImage = await resizeImage(file, 1920, 1080);
  
  // 2. Convert to WebP for better compression
  const webpBlob = await convertToWebP(resizedImage);
  
  // 3. Upload to Firebase Storage
  const path = `customers/${customerId}/photos/${Date.now()}/${type}/${file.name}.webp`;
  const uploadResult = await uploadBytes(storageRef, webpBlob, { path });
  
  return uploadResult.ref.fullPath;
}
```

### Auto-Cleanup Rules
```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "age": 90,
          "matchesPrefix": ["customers/*/photos/"]
        }
      }
    ]
  }
}
```

## API Integration

### Required APIs
1. **Google Maps Distance Matrix API** - Traffic-aware routing
2. **Google Maps Directions API** - Turn-by-turn navigation
3. **Google Maps Geocoding API** - Address validation
4. **Optional: Weather API** - Rain delays, etc.

### API Usage Optimization
- **Distance Matrix**: Called once per day per crew for route optimization
- **Directions**: Called for real-time navigation during service
- **Geocoding**: Called when adding new customers

## Implementation Phases

### Phase 1: Basic Route Generation
- Customer prioritization based on last service date
- Simple geographic clustering by zip code
- Basic crew assignment

### Phase 2: Traffic Integration
- Google Maps Distance Matrix API integration
- Real-time traffic consideration
- Route optimization with traffic data

### Phase 3: Advanced Features
- Customer preference integration
- Service type matching
- Real-time route updates

### Phase 4: Photo Management
- Firebase Storage integration
- Photo compression and upload
- Auto-cleanup implementation

## Benefits of This Approach

1. **✅ Simplicity**: No unnecessary database collections
2. **✅ Scalability**: Easy to add new optimization factors
3. **✅ Efficiency**: Routes calculated once per day per crew
4. **✅ Flexibility**: Can handle traffic changes and cancellations
5. **✅ Cost-effective**: Minimal storage costs with compression
6. **✅ Real-time Ready**: Can update routes based on changing conditions

## Database Queries

### Customer Prioritization Query
```typescript
// Get customers needing service (not serviced in 5+ days)
const customersNeedingService = await getDocs(
  query(
    collection(db, 'customers'),
    where('status', '==', 'active'),
    where('lastServiceDate', '<', fiveDaysAgo)
  )
);
```

### Crew Availability Query
```typescript
// Get available crews for a specific date
const availableCrews = await getDocs(
  query(
    collection(db, 'users'),
    where('role', 'in', ['foreman', 'technician']),
    where('status', '==', 'available')
  )
);
```

This system provides sophisticated route optimization while maintaining a simple, scalable backend architecture that avoids unnecessary complexity. 