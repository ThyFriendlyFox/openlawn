"use client"

import * as React from "react"
import type { Customer, User } from "@/lib/firebase-types"
import { subscribeToCustomers, addCustomer as addCustomerToFirestore } from "@/lib/customer-service"
import { subscribeToUsers } from "@/lib/user-service"
import { useAuth } from "@/hooks/use-auth"
import { Timestamp } from "firebase/firestore"
import { Users, User as UserIcon, Building, Plus } from "lucide-react"

import { Header } from "@/components/lawn-route/Header"
import { CustomerList } from "@/components/lawn-route/CustomerList"
import { CustomerDetailsSheet } from "@/components/lawn-route/CustomerDetailsSheet"
import { AddCustomerSheet } from "@/components/lawn-route/AddCustomerSheet"
import { RouteMap } from "@/components/lawn-route/RouteMap"
import { ManagerMap } from "@/components/lawn-route/ManagerMap"
import { googleMapsConfig } from "@/lib/env"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

type ViewType = 'customers' | 'employees' | 'crews';

export default function LawnRoutePage() {
  const { user, userProfile } = useAuth();
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [employees, setEmployees] = React.useState<User[]>([])
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)
  const [isAddSheetOpen, setAddSheetOpen] = React.useState(false)
  const [currentView, setCurrentView] = React.useState<ViewType>('customers')
  const [touchStart, setTouchStart] = React.useState<number | null>(null)
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 30

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
  }

  const handleOpenAddSheet = () => {
    setAddSheetOpen(true)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      // Swipe left - go to next view
      if (currentView === 'customers') setCurrentView('employees')
      else if (currentView === 'employees') setCurrentView('crews')
      else if (currentView === 'crews') setCurrentView('customers')
    }
    
    if (isRightSwipe) {
      // Swipe right - go to previous view
      if (currentView === 'customers') setCurrentView('crews')
      else if (currentView === 'employees') setCurrentView('customers')
      else if (currentView === 'crews') setCurrentView('employees')
    }
  }

  // Subscribe to customers and employees when user is authenticated
  React.useEffect(() => {
    if (!user) return;

    const unsubscribeCustomers = subscribeToCustomers(user.uid, (customers) => {
      setCustomers(customers);
    });

    // Only subscribe to employees if user is manager/admin
    if (userProfile?.role === 'manager' || userProfile?.role === 'admin') {
      const unsubscribeEmployees = subscribeToUsers((users) => {
        // Filter to only show employees (not managers/admins)
        const employeeUsers = users.filter(u => u.role === 'employee');
        setEmployees(employeeUsers);
      });

      return () => {
        unsubscribeCustomers();
        unsubscribeEmployees();
      };
    }

    return () => {
      unsubscribeCustomers();
    };
  }, [user, userProfile]);

  const handleAddCustomer = async (newCustomerData: { 
    name: string; 
    address: string; 
    coordinates?: { lat?: number; lng?: number };
    notes?: string;
    serviceType: 'push-mow' | 'edge' | 'blow' | 'detail' | 'riding-mow';
    servicePreferences: {
      preferredDays: string[];
      preferredTimeRange: {
        start: string;
        end: string;
      };
      serviceFrequency: 'weekly' | 'biweekly' | 'monthly' | 'one-time';
      specialInstructions?: string;
    };
  }) => {
    if (!user) return;

    const createCustomerData = (lat: number, lng: number) => ({
      name: newCustomerData.name,
      address: newCustomerData.address,
      lat,
      lng,
      notes: newCustomerData.notes || '',
      billingInfo: {},
      status: 'active' as const,
      services: [{
        id: Date.now().toString(),
        type: newCustomerData.serviceType,
        description: newCustomerData.servicePreferences.specialInstructions || '',
        price: 0, // Default price since it's not in the new form
        scheduledDate: Timestamp.now(),
        status: 'scheduled' as const,
        notes: '',
        photos: [],
      }],
      lastServiceDate: undefined,
      nextServiceDate: undefined,
      createdBy: user.uid,
    });

    try {
      let lat: number, lng: number;
      
      if (newCustomerData.coordinates?.lat && newCustomerData.coordinates?.lng) {
        lat = newCustomerData.coordinates.lat;
        lng = newCustomerData.coordinates.lng;
      } else {
        // Use Google Maps Geocoding API to get real coordinates from the address
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({ address: newCustomerData.address });
        
        if (result.results.length > 0) {
          const location = result.results[0].geometry.location;
          lat = location.lat();
          lng = location.lng();
        } else {
          // Fallback to Florida coordinates if geocoding fails
          console.warn('Geocoding failed, using fallback coordinates')
          lat = 27.6648 + (Math.random() - 0.5) * 2;
          lng = -81.5158 + (Math.random() - 0.5) * 2;
        }
      }

      const customerData = createCustomerData(lat, lng);
      await addCustomerToFirestore(customerData, user.uid);
      setAddSheetOpen(false);
    } catch (error) {
      console.error('Error adding customer:', error)
      // Fallback to Florida coordinates if geocoding fails
      const customerData = createCustomerData(
        27.6648 + (Math.random() - 0.5) * 2,
        -81.5158 + (Math.random() - 0.5) * 2
      );

      try {
        await addCustomerToFirestore(customerData, user.uid);
        setAddSheetOpen(false);
      } catch (firestoreError) {
        console.error('Error saving to Firestore:', firestoreError);
      }
    }
  }

  // Group employees by crew
  const crewGroups = React.useMemo(() => {
    const groups: { [crewId: string]: User[] } = {};
    employees.forEach(employee => {
      const crewId = employee.crewId || 'unassigned';
      if (!groups[crewId]) {
        groups[crewId] = [];
      }
      groups[crewId].push(employee);
    });
    return groups;
  }, [employees]);

  // Check if user is manager/admin
  const isManager = userProfile?.role === 'manager' || userProfile?.role === 'admin';

  // Manager view with swipeable interface
  if (isManager) {
    const renderCustomersView = () => (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Customers ({customers.length})
          </h2>
        </div>
        
        {/* Add New Customer Card - Now at the top */}
        <div
          onClick={handleOpenAddSheet}
          className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary hover:text-primary transition-all bg-secondary/50 flex flex-col items-center justify-center text-center"
        >
          <Plus className="w-10 h-10 mb-2" />
          <p className="font-semibold">Add New Customer</p>
        </div>
        
        <div className="space-y-2">
          {customers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => handleSelectCustomer(customer)}
              className="p-3 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <div className="font-medium">{customer.name}</div>
              <div className="text-sm text-muted-foreground">{customer.address}</div>
              {customer.services?.[0] && (
                <div className="text-xs text-muted-foreground mt-1">
                  {customer.services[0].type} - ${customer.services[0].price}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );

    const renderEmployeesView = () => (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Employees ({employees.length})
          </h2>
        </div>
        
        <div className="space-y-2">
          {employees.map((employee) => (
            <div key={employee.id} className="p-3 border rounded-lg">
              <div className="font-medium">{employee.name}</div>
              <div className="text-sm text-muted-foreground">{employee.email}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Status: {employee.status}
              </div>
              {employee.crewId && (
                <div className="text-xs text-muted-foreground">
                  Crew: {employee.crewId}
                </div>
              )}
            </div>
          ))}
          
          {/* Add New Employee Card */}
          <div
            onClick={() => {/* TODO: Add employee functionality */}}
            className="p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary hover:text-primary transition-all bg-secondary/50 flex flex-col items-center justify-center text-center"
          >
            <Plus className="w-10 h-10 mb-2" />
            <p className="font-semibold">Add New Employee</p>
          </div>
        </div>
      </div>
    );

    const renderCrewsView = () => (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Building className="w-5 h-5" />
            Crews ({Object.keys(crewGroups).length})
          </h2>
        </div>
        
        <div className="space-y-2">
          {Object.entries(crewGroups).map(([crewId, crewMembers]) => (
            <div key={crewId} className="p-3 border rounded-lg">
              <div className="font-medium">
                {crewId === 'unassigned' ? 'Unassigned' : `Crew ${crewId}`}
              </div>
              <div className="text-sm text-muted-foreground">
                {crewMembers.length} member{crewMembers.length !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {crewMembers.map(member => member.name).join(', ')}
              </div>
            </div>
          ))}
          
          {/* Add New Crew Card */}
          <div
            onClick={() => {/* TODO: Add crew functionality */}}
            className="p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary hover:text-primary transition-all bg-secondary/50 flex flex-col items-center justify-center text-center"
          >
            <Plus className="w-10 h-10 mb-2" />
            <p className="font-semibold">Add New Crew</p>
          </div>
        </div>
      </div>
    );

    return (
      <ProtectedRoute>
        <div className="flex flex-col h-svh bg-background text-foreground font-body">
          <Header />
          <main className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-3 flex-grow overflow-hidden">
            <div className="md:col-span-2 h-full w-full">
              <ManagerMap 
                customers={customers}
                employees={employees}
                selectedCustomer={selectedCustomer}
                onSelectCustomer={handleSelectCustomer}
                apiKey={googleMapsConfig.apiKey}
              />
            </div>
            <div 
              className="md:col-span-1 flex flex-col overflow-hidden p-4 touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Content Area */}
              <div 
                className="flex-1 overflow-y-auto"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {currentView === 'customers' && renderCustomersView()}
                {currentView === 'employees' && renderEmployeesView()}
                {currentView === 'crews' && renderCrewsView()}
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-center mt-4 pt-4 border-t flex-shrink-0">
                <div className="flex items-center w-full">
                  <button
                    onClick={() => setCurrentView('customers')}
                    className={`h-2 flex-1 rounded-full transition-colors ${currentView === 'customers' ? 'bg-primary' : 'bg-muted'} hover:opacity-80`}
                  />
                  <button
                    onClick={() => setCurrentView('employees')}
                    className={`h-2 flex-1 rounded-full transition-colors mx-1 ${currentView === 'employees' ? 'bg-primary' : 'bg-muted'} hover:opacity-80`}
                  />
                  <button
                    onClick={() => setCurrentView('crews')}
                    className={`h-2 flex-1 rounded-full transition-colors ${currentView === 'crews' ? 'bg-primary' : 'bg-muted'} hover:opacity-80`}
                  />
                </div>
              </div>
            </div>
          </main>

          {selectedCustomer && (
            <CustomerDetailsSheet
              customer={selectedCustomer}
              open={!!selectedCustomer}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedCustomer(null)
                }
              }}
            />
          )}

          <AddCustomerSheet 
            open={isAddSheetOpen}
            onOpenChange={setAddSheetOpen}
            onAddCustomer={handleAddCustomer}
          />
        </div>
      </ProtectedRoute>
    );
  }

  // Employee view (original simple interface)
  return (
    <ProtectedRoute>
      <div className="flex flex-col h-svh bg-background text-foreground font-body">
        <Header />
        <main className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-3 flex-grow overflow-hidden">
          <div className="md:col-span-2 h-full w-full">
              <RouteMap 
                customers={customers} 
                selectedCustomer={selectedCustomer} 
                onSelectCustomer={handleSelectCustomer}
                apiKey={googleMapsConfig.apiKey}
              />
          </div>
          <div className="md:col-span-1 flex-grow overflow-y-auto">
              <CustomerList
                customers={customers}
                onSelectCustomer={handleSelectCustomer}
                onAddCustomer={handleOpenAddSheet}
              />
          </div>
        </main>

        {selectedCustomer && (
          <CustomerDetailsSheet
            customer={selectedCustomer}
            open={!!selectedCustomer}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedCustomer(null)
              }
            }}
          />
        )}

        <AddCustomerSheet 
          open={isAddSheetOpen}
          onOpenChange={setAddSheetOpen}
          onAddCustomer={handleAddCustomer}
        />
      </div>
    </ProtectedRoute>
  );
}
