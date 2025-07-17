"use client"

import * as React from "react"
import type { Customer } from "@/lib/types"
import { mockCustomers } from "@/lib/data"

import { Header } from "@/components/lawn-route/Header"
import { CustomerList } from "@/components/lawn-route/CustomerList"
import { CustomerDetailsSheet } from "@/components/lawn-route/CustomerDetailsSheet"
import { AddCustomerSheet } from "@/components/lawn-route/AddCustomerSheet"
import { RouteMap } from "@/components/lawn-route/RouteMap"

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
  
  const handleAddCustomer = (newCustomerData: Omit<Customer, 'id' | 'lat' | 'lng'>) => {
    const newCustomer: Customer = {
      ...newCustomerData,
      id: `C${(customers.length + 1).toString().padStart(3, '0')}`,
      // Geocoding would be needed for a real app. We'll use random coordinates for now.
      lat: 40.7128 + (Math.random() - 0.5) * 0.1, 
      lng: -74.0060 + (Math.random() - 0.5) * 0.1,
    }
    setCustomers(prev => [...prev, newCustomer])
    setAddSheetOpen(false)
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
