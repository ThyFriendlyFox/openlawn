"use client"

import * as React from "react"
import type { Customer } from "@/lib/types"
import { mockCustomers } from "@/lib/data"

import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { Header } from "@/components/lawn-route/Header"
import { CustomerList } from "@/components/lawn-route/CustomerList"
import { CustomerDetailsSheet } from "@/components/lawn-route/CustomerDetailsSheet"
import { AddCustomerSheet } from "@/components/lawn-route/AddCustomerSheet"
import { RouteMap } from "@/components/lawn-route/RouteMap"
import { LoginPage } from "@/components/auth/LoginPage"
import { AnalyticsService } from "@/lib/analytics"
import { testFirebaseConnection } from "@/lib/firebase-test"
import { testAuthOperations } from "@/lib/auth-test"

function LawnRouteApp() {
  const { user, loading } = useAuth();
  const [customers, setCustomers] = React.useState<Customer[]>(mockCustomers)
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)
  const [isAddSheetOpen, setAddSheetOpen] = React.useState(false)

  // Track page view when user is authenticated (commented out for now)
  // React.useEffect(() => {
  //   if (user) {
  //     AnalyticsService.trackPageView('dashboard');
  //     AnalyticsService.trackCompanySize(customers.length);
  //   }
  // }, [user, customers.length]);

  // Test Firebase connection on app load (commented out for now)
  // React.useEffect(() => {
  //   testFirebaseConnection();
  //   // Test auth operations after a short delay
  //   setTimeout(() => {
  //     testAuthOperations();
  //   }, 1000);
  // }, []);
  


  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
  }

  const handleOpenAddSheet = () => {
    setAddSheetOpen(true)
  }
  
  const handleAddCustomer = async (newCustomerData: { name: string; address: string; serviceRequested: string; notes?: string }) => {
    try {
      // Use Google Maps Geocoding API to get real coordinates from the address
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: newCustomerData.address });
      
      if (result.results.length > 0) {
        const location = result.results[0].geometry.location;
        const newCustomer: Customer = {
          ...newCustomerData,
          notes: newCustomerData.notes || '',
          id: `C${(customers.length + 1).toString().padStart(3, '0')}`,
          lat: location.lat(),
          lng: location.lng(),
        }
        setCustomers(prev => [...prev, newCustomer])
        setAddSheetOpen(false)
        
        // Track customer creation
        AnalyticsService.trackCustomerCreated(newCustomer.id);
      } else {
        // Fallback to Florida coordinates if geocoding fails
        console.warn('Geocoding failed, using fallback coordinates')
        const newCustomer: Customer = {
          ...newCustomerData,
          notes: newCustomerData.notes || '',
          id: `C${(customers.length + 1).toString().padStart(3, '0')}`,
          lat: 27.6648 + (Math.random() - 0.5) * 2,
          lng: -81.5158 + (Math.random() - 0.5) * 2,
        }
        setCustomers(prev => [...prev, newCustomer])
        setAddSheetOpen(false)
        
        // Track customer creation
        AnalyticsService.trackCustomerCreated(newCustomer.id);
      }
    } catch (error) {
      console.error('Error geocoding address:', error)
      // Fallback to Florida coordinates if geocoding fails
      const newCustomer: Customer = {
        ...newCustomerData,
        notes: newCustomerData.notes || '',
        id: `C${(customers.length + 1).toString().padStart(3, '0')}`,
        lat: 27.6648 + (Math.random() - 0.5) * 2,
        lng: -81.5158 + (Math.random() - 0.5) * 2,
      }
      setCustomers(prev => [...prev, newCustomer])
      setAddSheetOpen(false)
      
      // Track customer creation
      AnalyticsService.trackCustomerCreated(newCustomer.id);
    }
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    // Temporarily show the app without authentication for testing
    console.log('⚠️ Authentication not set up yet - showing app in demo mode');
    return (
      <div className="flex flex-col h-svh bg-background text-foreground font-body">
        <div className="flex items-center justify-between p-4 border-b bg-background z-10 shadow-sm">
          <div className="flex items-center">
            <div className="text-primary w-6 h-6 mr-2">🌱</div>
            <h1 className="text-xl font-bold text-gray-800 font-headline">
              LawnRoute (Demo Mode)
            </h1>
          </div>
          <div className="text-sm text-muted-foreground">
            🔧 Enable Firebase Auth to unlock full features
          </div>
        </div>
        <main className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-3 flex-grow overflow-hidden">
          <div className="md:col-span-2 h-full w-full">
              <RouteMap 
                customers={customers} 
                selectedCustomer={selectedCustomer} 
                onSelectCustomer={handleSelectCustomer}
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
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
    );
  }

  return (
    <div className="flex flex-col h-svh bg-background text-foreground font-body">
      <Header />
      <main className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-3 flex-grow overflow-hidden">
        <div className="md:col-span-2 h-full w-full">
            <RouteMap 
              customers={customers} 
              selectedCustomer={selectedCustomer} 
              onSelectCustomer={handleSelectCustomer}
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
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
  );
}

export default function LawnRoutePage() {
  return (
    <AuthProvider>
      <LawnRouteApp />
    </AuthProvider>
  );
}
