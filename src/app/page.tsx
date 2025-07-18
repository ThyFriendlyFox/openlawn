"use client"

import * as React from "react"
import type { Customer } from "@/lib/types"
import { mockCustomers } from "@/lib/data"

import { Header } from "@/components/lawn-route/Header"
import { CustomerList } from "@/components/lawn-route/CustomerList"
import { CustomerDetailsSheet } from "@/components/lawn-route/CustomerDetailsSheet"
import { AddCustomerSheet } from "@/components/lawn-route/AddCustomerSheet"
import { RouteMap } from "@/components/lawn-route/RouteMap"
import { googleMapsConfig } from "@/lib/env"

export default function LawnRoutePage() {
  const [customers, setCustomers] = React.useState<Customer[]>(mockCustomers)
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)
  const [isAddSheetOpen, setAddSheetOpen] = React.useState(false)
  


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
          id: `C${(customers.length + 1).toString().padStart(3, '0')}`,
          lat: location.lat(),
          lng: location.lng(),
          notes: newCustomerData.notes || '',
        }
        setCustomers(prev => [...prev, newCustomer])
        setAddSheetOpen(false)
      } else {
        // Fallback to Florida coordinates if geocoding fails
        console.warn('Geocoding failed, using fallback coordinates')
        const newCustomer: Customer = {
          ...newCustomerData,
          id: `C${(customers.length + 1).toString().padStart(3, '0')}`,
          lat: 27.6648 + (Math.random() - 0.5) * 2,
          lng: -81.5158 + (Math.random() - 0.5) * 2,
          notes: newCustomerData.notes || '',
        }
        setCustomers(prev => [...prev, newCustomer])
        setAddSheetOpen(false)
      }
    } catch (error) {
      console.error('Error geocoding address:', error)
      // Fallback to Florida coordinates if geocoding fails
      const newCustomer: Customer = {
        ...newCustomerData,
        id: `C${(customers.length + 1).toString().padStart(3, '0')}`,
        lat: 27.6648 + (Math.random() - 0.5) * 2,
        lng: -81.5158 + (Math.random() - 0.5) * 2,
        notes: newCustomerData.notes || '',
      }
      setCustomers(prev => [...prev, newCustomer])
      setAddSheetOpen(false)
    }
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
  );
}
