"use client"

import * as React from "react"
import type { Customer, DayOfWeek, ServiceType } from "@/lib/types"
import { subscribeToCustomers, addCustomer as addCustomerToFirestore } from "@/lib/customer-service"
import { subscribeToCrews, createCrew, updateCrew, deleteCrew } from "@/lib/crew-service"
import { subscribeToEmployees } from "@/lib/firebase-services"

import { useAuth } from "@/hooks/use-auth"

import { Header } from "@/components/lawn-route/Header"
import { CrewList } from "@/components/lawn-route/CrewList"
import { CustomerDetailsSheet } from "@/components/lawn-route/CustomerDetailsSheet"
import { AddCustomerSheet } from "@/components/lawn-route/AddCustomerSheet"
import { CrewManagementSheet } from "@/components/lawn-route/CrewManagementSheet"
import { ManagerMap } from "@/components/lawn-route/ManagerMap"
import { googleMapsConfig } from "@/lib/env"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"


// Import the real Crew type from types.ts
import type { Crew } from '@/lib/types'

interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager';
  status: 'active' | 'inactive';
}





export default function ManagerPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [crews, setCrews] = React.useState<Crew[]>([])
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [selectedCrew, setSelectedCrew] = React.useState<Crew | null>(null)
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)
  const [isAddSheetOpen, setAddSheetOpen] = React.useState(false)
  const [isCrewManagementOpen, setIsCrewManagementOpen] = React.useState(false)
  const [editingCrew, setEditingCrew] = React.useState<Crew | null>(null)
  // Simple real progress calculation for crews
  const calculateCrewProgress = React.useCallback((crew: Crew): number => {
    // For now, return 0 since we're not using mock routes
    // In the future, this would calculate from real route data in Firebase
    return 0;
  }, []);

  const handleSelectCrew = (crew: Crew) => {
    setSelectedCrew(crew)
  }

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
  }

  const handleOpenAddSheet = () => {
    setAddSheetOpen(true)
  }

  const handleEditCrew = (crew: Crew) => {
    setEditingCrew(crew)
    setIsCrewManagementOpen(true)
  }

  const handleCreateCrew = () => {
    setEditingCrew(null)
    setIsCrewManagementOpen(true)
  }

  const handleSaveCrew = async (crewData: any) => {
    if (editingCrew) {
      // Update existing crew
      const updatedCrews = crews.map(crew => 
        crew.id === editingCrew.id 
          ? { 
              ...crew, 
              name: crewData.name,
              status: crewData.status,
              employees: employees.filter(emp => crewData.employeeIds.includes(emp.id)),
              services: crewData.services
            }
          : crew
      )
      setCrews(updatedCrews)
    } else {
      // Create new crew
      const newCrew: Crew = {
        id: `crew-${Date.now()}`,
        name: crewData.name,
        status: crewData.status,
        employees: employees.filter(emp => crewData.employeeIds.includes(emp.id)),
        services: crewData.services,
        currentLocation: undefined,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user?.uid || 'unknown',
        companyId: user?.uid || 'unknown',
      }
      setCrews([...crews, newCrew])
    }
  }

  // Subscribe to customers, crews, and employees when user is authenticated
  React.useEffect(() => {
    if (!user) return;

    const unsubscribeCustomers = subscribeToCustomers(user.uid, (customers) => {
      setCustomers(customers);
    });

    // For now, use a default company ID - in a real app, this would come from user profile
    const companyId = user.uid; // Using user ID as company ID for demo
    

    
    const unsubscribeCrews = subscribeToCrews(companyId, (crews) => {
      console.log('Real crews from Firebase:', crews);
      setCrews(crews);
    });

    const unsubscribeEmployees = subscribeToEmployees((employees) => {
      console.log('Real employees from Firebase:', employees);
      // Remove duplicates based on email (keep first occurrence)
      const uniqueEmployees = employees.filter((employee, index, self) => 
        index === self.findIndex(e => e.email === employee.email)
      );
      console.log('Unique employees after deduplication:', uniqueEmployees);
      setEmployees(uniqueEmployees);
    });

    return () => {
      unsubscribeCustomers();
      unsubscribeCrews();
      unsubscribeEmployees();
    };
  }, [user]);

  const handleAddCustomer = async (newCustomerData: { 
    name: string; 
    address: string; 
    serviceRequested: ServiceType; 
    notes?: string;
    preferredDays: string[];
    timeRangeStart: string;
    timeRangeEnd: string;
    serviceFrequency: 'weekly' | 'biweekly' | 'monthly' | 'one-time';
  }) => {
    if (!user) return;

    const createCustomerData = (lat: number, lng: number) => ({
      ...newCustomerData,
      lat,
      lng,
      notes: newCustomerData.notes || '',
      servicePreferences: {
        preferredDays: newCustomerData.preferredDays as DayOfWeek[],
        preferredTimeRange: { 
          start: newCustomerData.timeRangeStart, 
          end: newCustomerData.timeRangeEnd 
        },
        serviceFrequency: newCustomerData.serviceFrequency,
      },
      serviceHistory: [],
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    try {
      // Use Google Maps Geocoding API to get real coordinates from the address
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: newCustomerData.address });
      
      let lat: number, lng: number;
      
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

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-svh bg-background text-foreground font-body">
        <Header />
        <main className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-3 flex-grow overflow-hidden">
          <div className="md:col-span-2 h-full w-full">
            <ManagerMap 
              customers={customers}
              crews={crews}
              selectedCrew={selectedCrew} 
              selectedCustomer={selectedCustomer}
              onSelectCrew={handleSelectCrew}
              onSelectCustomer={handleSelectCustomer}
              apiKey={googleMapsConfig.apiKey}
            />
          </div>
          <div className="md:col-span-1 flex-grow overflow-y-auto">
              <CrewList
                crews={crews}
                onSelectCrew={handleSelectCrew}
                onAddCustomer={handleCreateCrew}
                onEditCrew={handleEditCrew}
                calculateProgress={calculateCrewProgress}
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

        <CrewManagementSheet
          open={isCrewManagementOpen}
          onOpenChange={setIsCrewManagementOpen}
          crew={editingCrew || undefined}
          availableEmployees={employees}
          onSaveCrew={handleSaveCrew}
        />
        

      </div>
    </ProtectedRoute>
  );
} 