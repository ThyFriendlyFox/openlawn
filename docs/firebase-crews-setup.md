# Firebase Crews Collection Setup

## Overview

This guide explains how to set up and use the Firebase crews collection for the LawnRoute application. The crews collection stores all crew information including employees, services, locations, and real-time tracking data.

## Database Schema

### Crews Collection Structure

```typescript
interface FirestoreCrew {
  id?: string;                    // Auto-generated document ID
  name: string;                   // Crew name (e.g., "Crew Alpha")
  description?: string;           // Optional crew description
  companyId: string;              // Company this crew belongs to
  employees: FirestoreCrewEmployee[];  // Array of crew members
  services: FirestoreCrewService[];     // Services this crew provides
  status: 'active' | 'inactive';  // Crew status
  currentLocation?: {             // Real-time GPS location
    lat: number;
    lng: number;
    lastUpdated: Timestamp;
  };
  vehicle?: {                     // Vehicle information
    type: string;
    make: string;
    model: string;
    year: number;
    licensePlate?: string;
  };
  isActive: boolean;              // Soft delete flag
  createdAt: Timestamp;           // Creation timestamp
  updatedAt: Timestamp;           // Last update timestamp
  createdBy: string;              // User who created the crew
}
```

### Employee Structure

```typescript
interface FirestoreCrewEmployee {
  employeeId: string;             // Unique employee ID
  name: string;                   // Employee full name
  email: string;                  // Employee email
  role: 'driver' | 'operator' | 'helper' | 'supervisor';
  status: 'active' | 'inactive';  // Employee status
  joinedAt: Timestamp;            // When they joined the crew
}
```

### Service Structure

```typescript
interface FirestoreCrewService {
  serviceType: string;            // Type of service (e.g., "lawn-mowing")
  days: string[];                 // Days of week they provide this service
  isActive: boolean;              // Whether this service is active
}
```

## Firebase Security Rules

Add these security rules to your `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Crews collection rules
    match /crews/{crewId} {
      allow read: if request.auth != null && 
        (resource.data.companyId == request.auth.uid || 
         request.auth.token.role == 'admin');
      
      allow create: if request.auth != null && 
        request.auth.token.role in ['admin', 'manager'];
      
      allow update: if request.auth != null && 
        (resource.data.companyId == request.auth.uid || 
         request.auth.token.role == 'admin');
      
      allow delete: if request.auth != null && 
        request.auth.token.role == 'admin';
    }
  }
}
```

## Setting Up the Crews Collection

### 1. Initialize Firebase

Make sure your Firebase configuration is set up in `src/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase config here
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### 2. Seed Initial Data

Use the seeding script to create initial crews:

```typescript
import { safeSeedCrews } from '@/lib/seed-crews';

// In your app initialization
const initializeCrews = async (companyId: string, userId: string) => {
  try {
    await safeSeedCrews(companyId, userId);
    console.log('Crews initialized successfully');
  } catch (error) {
    console.error('Error initializing crews:', error);
  }
};
```

### 3. Real-time Crew Management

The crew service provides real-time updates:

```typescript
import { subscribeToCrews, updateCrewLocation } from '@/lib/crew-service';

// Subscribe to crew updates
const unsubscribe = subscribeToCrews(companyId, (crews) => {
  console.log('Crews updated:', crews);
  // Update your UI with the new crew data
});

// Update crew location (for GPS tracking)
await updateCrewLocation(crewId, {
  lat: 28.5383,
  lng: -81.3792
});
```

## Integration with Route Progress

### 1. Crew Location Tracking

The route progress system uses crew locations to calculate real progress:

```typescript
import { useRouteProgress } from '@/hooks/use-route-progress';

const {
  progress,
  updateCrewLocation,
  markStopCompleted
} = useRouteProgress({
  routes: mockRoutes,
  updateInterval: 30000, // 30 seconds
  enableRealTime: true
});

// Update crew location when GPS changes
const handleLocationUpdate = (crewId: string, location: { lat: number; lng: number }) => {
  updateCrewLocation(crewId, location, new Date());
};
```

### 2. Progress Calculation

The system calculates progress based on:
- **Completed stops** (40% weight)
- **Distance traveled** (30% weight) 
- **Time elapsed** (30% weight)

```typescript
// Example progress calculation
const crewProgress = {
  crewId: 'crew-1',
  stopsCompleted: 3,
  totalStops: 5,
  distanceTraveled: 2500, // meters
  totalDistance: 5000,    // meters
  timeElapsed: 120,       // minutes
  estimatedTotalTime: 240, // minutes
  progressPercentage: 65,  // calculated weighted average
  status: 'in_progress',
  isOnSchedule: true,
  delayMinutes: 0
};
```

## API Functions

### Crew Management

```typescript
// Create a new crew
const crewId = await createCrew({
  name: 'New Crew',
  companyId: 'company-1',
  employees: [],
  services: [],
  status: 'active',
  isActive: true,
  createdBy: 'user-1'
});

// Update crew
await updateCrew(crewId, {
  name: 'Updated Crew Name',
  status: 'inactive'
});

// Delete crew (soft delete)
await deleteCrew(crewId);

// Add employee to crew
await addEmployeeToCrew(crewId, {
  id: 'emp-1',
  name: 'John Smith',
  email: 'john@example.com',
  role: 'driver',
  status: 'active'
});

// Remove employee from crew
await removeEmployeeFromCrew(crewId, 'emp-1');
```

### Real-time Subscriptions

```typescript
// Subscribe to all crews for a company
const unsubscribe = subscribeToCrews(companyId, (crews) => {
  // Handle crew updates
  setCrews(crews);
});

// Get crews by status
const activeCrews = await getCrewsByStatus(companyId, 'active');

// Get crews by service type
const mowingCrews = await getCrewsByService(companyId, 'lawn-mowing');
```

## Usage in Components

### Crew List Component

```typescript
import { subscribeToCrews } from '@/lib/crew-service';

function CrewList({ companyId }: { companyId: string }) {
  const [crews, setCrews] = useState<Crew[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCrews(companyId, setCrews);
    return unsubscribe;
  }, [companyId]);

  return (
    <div>
      {crews.map(crew => (
        <CrewCard key={crew.id} crew={crew} />
      ))}
    </div>
  );
}
```

### Route Progress Dashboard

```typescript
import { useRouteProgress } from '@/hooks/use-route-progress';

function RouteProgressDashboard({ routes }: { routes: Route[] }) {
  const { progress, summary } = useRouteProgress({
    routes,
    enableRealTime: true
  });

  return (
    <div>
      <h2>Route Progress</h2>
      <p>Average Progress: {summary.averageProgress}%</p>
      <p>Active Crews: {summary.activeCrews}</p>
      <p>Completed Routes: {summary.completedRoutes}</p>
    </div>
  );
}
```

## Benefits of Firebase Integration

### 1. **Real-time Updates**
- Crew locations update automatically
- Progress calculations happen in real-time
- UI updates without page refresh

### 2. **Data Persistence**
- Crew data survives app restarts
- Historical data for analytics
- Backup and recovery

### 3. **Scalability**
- Handles multiple companies
- Supports large numbers of crews
- Efficient queries and indexing

### 4. **Security**
- Role-based access control
- Company data isolation
- Secure API endpoints

### 5. **Integration**
- Works with existing customer data
- Connects to route optimization
- Supports GPS tracking

## Next Steps

1. **Set up Firebase project** with Firestore database
2. **Configure security rules** for crew data
3. **Seed initial crew data** using the provided script
4. **Integrate with existing components** using the crew service
5. **Test real-time updates** and GPS tracking
6. **Monitor performance** and optimize queries as needed

The Firebase crews collection provides a robust foundation for crew management and route progress tracking in the LawnRoute application. 