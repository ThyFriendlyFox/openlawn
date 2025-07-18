"use client"

import * as React from "react"
import type { Customer, DayOfWeek } from "@/lib/types"
import { mockCustomers } from "@/lib/data"
import { subscribeToCustomers, addCustomer as addCustomerToFirestore } from "@/lib/customer-service"
import { useAuth } from "@/hooks/use-auth"

import { Header } from "@/components/lawn-route/Header"
import { CustomerList } from "@/components/lawn-route/CustomerList"
import { CustomerDetailsSheet } from "@/components/lawn-route/CustomerDetailsSheet"
import { AddCustomerSheet } from "@/components/lawn-route/AddCustomerSheet"
import { RouteMap } from "@/components/lawn-route/RouteMap"
import { googleMapsConfig } from "@/lib/env"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"


export default function LawnRoutePage() {
  const { user } = useAuth();
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)
  const [isAddSheetOpen, setAddSheetOpen] = React.useState(false)
  


  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
  }

  const handleOpenAddSheet = () => {
    setAddSheetOpen(true)
  }


  
  // Subscribe to customers when user is authenticated
  React.useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToCustomers(user.uid, (customers) => {
      setCustomers(customers);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddCustomer = async (newCustomerData: { 
    name: string; 
    address: string; 
    serviceRequested: string; 
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
