# OpenLawn Architecture Overview: Crew Management & Route Optimization

## 🏗️ System Architecture

### Core Components

#### 1. **Data Models & Types** (`src/lib/types.ts`)
- **Customer**: Enhanced with service preferences, history, and scheduling data
- **Crew**: Team management with members, vehicles, and company association
- **Schedule**: Daily/weekly crew assignments with customer allocations
- **Route**: Optimized route with stops, distances, and timing
- **UserProfile**: Extended with crew membership and scheduling preferences

#### 2. **Service Layer**
- **Auth Service** (`src/lib/auth.ts`): User authentication and profile management
- **Customer Service** (`src/lib/customer-service.ts`): Customer CRUD with service preferences
- **Crew Service** (`src/lib/crew-service.ts`): Crew management and member operations
- **Schedule Service** (`src/lib/schedule-service.ts`): Scheduling and customer assignment
- **Route Service** (`src/lib/route-service.ts`): Route optimization and management

#### 3. **UI Components**
- **ServicePreferencesForm**: Customer service day/time preferences
- **ScheduleView**: Crew schedule management (day/week views)
- **Enhanced CustomerCard**: Shows service preferences and history
- **RouteMap**: Optimized route visualization

## 🔄 Data Flow

### Customer Management Flow
```
1. Customer Creation → Service Preferences Setup
2. Service Preferences → Available for Scheduling
3. Scheduling Algorithm → Route Optimization
4. Route Optimization → Crew Assignment
```

### Crew Management Flow
```
1. Crew Creation → Member Assignment
2. Member Assignment → Schedule Creation
3. Schedule Creation → Customer Assignment
4. Customer Assignment → Route Generation
```

## 📊 Database Schema

### Collections Structure

#### `users`
```typescript
{
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'manager' | 'supervisor' | 'operator' | 'helper';
  companyId?: string;
  crewId?: string;
  schedule?: UserSchedule;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}
```

#### `customers`
```typescript
{
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  notes: string;
  serviceRequested: string;
  servicePreferences: ServicePreferences;
  serviceHistory: ServiceRecord[];
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  companyId?: string;
}
```

#### `crews`
```typescript
{
  id: string;
  name: string;
  description?: string;
  members: CrewMember[];
  vehicle?: Vehicle;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `schedules`
```typescript
{
  id: string;
  crewId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  assignedCustomers: ScheduledCustomer[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `routes`
```typescript
{
  id: string;
  scheduleId: string;
  crewId: string;
  date: Date;
  stops: RouteStop[];
  totalDistance: number;
  totalDuration: number;
  optimizedAt: Date;
  status: 'draft' | 'optimized' | 'active' | 'completed';
}
```

## 🎯 Key Features

### 1. **Customer Service Preferences**
- **Day Selection**: 7-day toggle for preferred service days
- **Time Range**: Double-ended slider for preferred time windows
- **Service Frequency**: Weekly, bi-weekly, monthly, one-time
- **Special Instructions**: Notes for crew members

### 2. **Crew Management**
- **Member Roles**: Driver, Operator, Helper, Supervisor
- **Vehicle Assignment**: Truck, trailer, mower tracking
- **Company Association**: Multi-company support
- **Active/Inactive Status**: Soft delete functionality

### 3. **Schedule Management**
- **Day/Week Views**: Flexible calendar interface
- **Customer Assignment**: Drag-and-drop or bulk assignment
- **Time Estimation**: Automatic duration calculation
- **Status Tracking**: Real-time progress updates

### 4. **Route Optimization**
- **Nearest Neighbor Algorithm**: Simple but effective optimization
- **Distance Calculation**: Haversine formula for accurate distances
- **Time Estimation**: Travel time + service time calculations
- **Priority Handling**: High/medium/low priority customers

## 🔧 Technical Implementation

### Route Optimization Algorithm
```typescript
// Nearest Neighbor Algorithm
const optimizeRoute = (customers: Customer[]): RouteStop[] => {
  const stops: RouteStop[] = [];
  const unvisited = [...customers];
  let currentLocation = startLocation;

  while (unvisited.length > 0) {
    // Find nearest unvisited customer
    const nearest = findNearestCustomer(currentLocation, unvisited);
    
    // Create route stop
    const stop = createRouteStop(nearest, stops.length + 1);
    stops.push(stop);
    
    // Update location and remove visited
    currentLocation = { lat: nearest.lat, lng: nearest.lng };
    unvisited.splice(nearestIndex, 1);
  }

  return stops;
};
```

### Service Preferences UI
```typescript
// Day Selection Grid
<div className="grid grid-cols-7 gap-2">
  {DAYS_OF_WEEK.map((day) => (
    <Checkbox
      checked={preferences.preferredDays.includes(day.value)}
      onCheckedChange={() => handleDayToggle(day.value)}
    />
  ))}
</div>

// Time Range Slider
<Slider
  value={[startMinutes, endMinutes]}
  onValueChange={handleTimeRangeChange}
  max={1440} // 24 hours in minutes
  step={15} // 15-minute intervals
/>
```

## 🚀 Future Enhancements

### 1. **Advanced Route Optimization**
- **Genetic Algorithms**: More sophisticated optimization
- **Traffic Integration**: Real-time traffic data
- **Weather Considerations**: Weather-dependent routing
- **Multi-vehicle Optimization**: Fleet management

### 2. **Real-time Features**
- **Live Tracking**: GPS tracking for crews
- **ETA Updates**: Real-time arrival estimates
- **Status Notifications**: Push notifications for customers
- **Emergency Rerouting**: Dynamic route adjustments

### 3. **Analytics & Reporting**
- **Performance Metrics**: Crew efficiency tracking
- **Customer Satisfaction**: Service quality metrics
- **Route Analytics**: Optimization effectiveness
- **Financial Reporting**: Cost analysis and billing

### 4. **Mobile App Features**
- **Offline Support**: Work without internet
- **Photo Capture**: Before/after service photos
- **Digital Signatures**: Customer confirmation
- **Inventory Tracking**: Equipment and supplies

## 🔐 Security & Permissions

### Firestore Security Rules
```javascript
// Users can only access their company's data
match /customers/{customerId} {
  allow read, write: if request.auth != null && 
    resource.data.createdBy == request.auth.uid;
}

// Crew members can view their crew's schedules
match /schedules/{scheduleId} {
  allow read: if request.auth != null && 
    resource.data.crewId in get(/databases/$(db.name)/documents/users/$(request.auth.uid)).data.crewId;
}
```

### Role-Based Access
- **Admin**: Full system access
- **Manager**: Crew and schedule management
- **Supervisor**: Route and crew oversight
- **Operator**: Service execution and updates
- **Helper**: Basic service tasks

## 📱 Mobile Considerations

### Capacitor Integration
- **Environment Variables**: Separate mobile configs
- **Offline Storage**: Local data caching
- **Push Notifications**: Service updates
- **GPS Integration**: Location services

### Performance Optimization
- **Lazy Loading**: On-demand data fetching
- **Image Optimization**: Compressed photos
- **Caching Strategy**: Intelligent data caching
- **Background Sync**: Offline data synchronization

This architecture provides a solid foundation for a comprehensive lawn service management system with room for future enhancements and scalability. 