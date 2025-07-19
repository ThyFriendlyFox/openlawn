# Multi-Crew Management System - OpenLawn

## Overview
Transform OpenLawn from a single-crew routing app into a comprehensive multi-crew management system with role-based access (Admin/Manager vs Employee views).

## Core Features

### 1. Role-Based Access Control
- **Admin/Manager View**: Multi-crew management, employee management, route oversight
- **Employee View**: Current day's route (existing functionality)
- **User Settings**: Role-based dropdown with appropriate options

### 2. Crew Management System

#### Crew Creation & Management
- **Crew Setup Tab**: New "Team" tab in user settings dropdown
- **Crew CRUD Operations**: Create, edit, delete crews
- **Crew Assignment**: Assign employees to crews
- **Service Assignment**: Assign specific services to crews

#### Service Types
Predefined service list:
- Push Mow
- Edge
- Blow
- Detail
- Riding Mow

#### Crew Service Scheduling
- **Day Selection**: Use existing 7-day checkbox interface for each service
- **Service-Specific Scheduling**: Each crew can have different services on different days
- **Hideable Sections**: Collapsible service sections for better UI organization

### 3. Employee Management

#### Employee Assignment
- **Crew Assignment**: Assign employees to specific crews
- **Role Management**: Admin/Manager vs Employee roles
- **Employee Profiles**: Basic employee information and preferences

#### Real-Time Location Tracking
- **Google Maps API Integration**: Track crew member locations
- **Live Location Display**: Show employee locations on manager's map view
- **Privacy Considerations**: Location tracking permissions and controls

### 4. Enhanced Customer Management

#### Service Cost Tracking
- **Cost Field**: Add cost tracking for each customer's services
- **Service History**: Track costs over time
- **Pricing Management**: Set and update service prices

#### Service Types for Customers
- **Recurring Services**: Existing functionality with day/time preferences
- **One-Time Services**: Non-recurring services with specific dates
- **Service Selection**: Allow customers to select from available service types

### 5. Advanced Routing System

#### Multi-Crew Routing
- **Automatic Route Generation**: Based on customer preferences and crew availability
- **Priority-Based Routing**: 
  - Primary: Time preferences
  - Secondary: Nearest next location
  - Configurable: Easy to modify priority order later

#### Route Display
- **Manager View**: 
  - Crew cards instead of customer cards
  - Multi-crew routes on map (different colors per crew)
  - Employee locations on routes
- **Employee View**: 
  - Current day's route (existing functionality)
  - Simplified interface focused on task completion

### 6. Manager Dashboard

#### Map Enhancements
- **Multi-Crew Visualization**: Different colored routes for each crew
- **Employee Location Tracking**: Real-time crew member locations
- **Route Optimization**: Visual representation of optimized routes

#### Crew Management Interface
- **Crew Cards**: Replace customer cards with crew information
- **Crew Status**: Active/inactive, current location, route progress
- **Quick Actions**: Edit crew, reassign employees, view route details

## Technical Implementation

### Database Schema Updates

#### Crew Collection
```typescript
interface Crew {
  id: string;
  name: string;
  employees: string[]; // Employee IDs
  services: {
    serviceType: string;
    days: DayOfWeek[];
  }[];
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // Manager ID
}
```

#### Employee Collection
```typescript
interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'employee';
  crewId?: string;
  location?: {
    lat: number;
    lng: number;
    lastUpdated: Timestamp;
  };
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Enhanced Customer Schema
```typescript
interface Customer {
  // ... existing fields
  services: {
    type: string;
    frequency: 'recurring' | 'one-time';
    cost: number;
    preferredDays: DayOfWeek[];
    preferredTimeRange: {
      start: string;
      end: string;
    };
  }[];
}
```

### API Integrations

#### Google Maps APIs
- **Geocoding API**: Address to coordinates (existing)
- **Directions API**: Route optimization
- **Location Services**: Real-time employee tracking
- **Maps JavaScript API**: Enhanced map visualization

### UI/UX Considerations

#### Manager Interface
- **Dashboard Layout**: 
  - Left: Crew list/cards
  - Right: Map with multi-crew routes
  - Top: Navigation and quick actions
- **Color Coding**: Different colors for each crew's route
- **Real-Time Updates**: Live location and status updates

#### Employee Interface
- **Simplified View**: Focus on current day's tasks
- **Route Navigation**: Turn-by-turn directions
- **Task Completion**: Mark services as completed
- **Location Sharing**: Opt-in location tracking

## Implementation Phases

### Phase 1: Foundation
1. Role-based access control
2. Basic crew management (CRUD)
3. Employee management
4. Enhanced customer schema with costs

### Phase 2: Service Management
1. Service type definitions
2. Crew service scheduling
3. Customer service selection
4. One-time vs recurring services

### Phase 3: Advanced Routing
1. Multi-crew route generation
2. Priority-based optimization
3. Manager dashboard with crew cards
4. Enhanced map visualization

### Phase 4: Real-Time Features
1. Employee location tracking
2. Live route updates
3. Real-time crew status
4. Performance optimization

## Security Considerations

### Location Privacy
- **Opt-in Tracking**: Employees must consent to location sharing
- **Data Retention**: Define how long location data is stored
- **Access Control**: Only managers/admins can view employee locations
- **GDPR Compliance**: Handle location data according to privacy regulations

### Role-Based Permissions
- **Admin**: Full system access
- **Manager**: Crew and employee management, route oversight
- **Employee**: Personal route view, task completion

## Future Enhancements

### Analytics & Reporting
- **Crew Performance**: Track efficiency and completion rates
- **Route Optimization**: Analyze and improve routing algorithms
- **Cost Analysis**: Service profitability and pricing optimization

### Mobile App Features
- **Offline Support**: Work without internet connection
- **Photo Capture**: Before/after service photos
- **Digital Signatures**: Customer service confirmation
- **Push Notifications**: Route updates and task assignments

### Integration Possibilities
- **Accounting Software**: QuickBooks, Xero integration
- **CRM Systems**: Customer relationship management
- **Weather APIs**: Route optimization based on weather conditions
- **Inventory Management**: Track equipment and supplies

## Success Metrics

### Operational Efficiency
- **Route Optimization**: Reduced travel time and fuel costs
- **Crew Utilization**: Better employee productivity
- **Customer Satisfaction**: Improved service timing and quality

### Business Intelligence
- **Service Analytics**: Most profitable services and routes
- **Employee Performance**: Individual and crew efficiency metrics
- **Customer Insights**: Service preferences and patterns

---

*This document serves as a comprehensive guide for implementing multi-crew management in OpenLawn, transforming it from a single-crew routing tool into a full-featured lawn care business management platform.* 