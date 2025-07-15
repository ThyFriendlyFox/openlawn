"use client"

import * as React from "react"
import type { Customer } from "@/lib/types"
import { mockCustomers } from "@/lib/data"

import { Header } from "@/components/lawn-route/Header"
import { MapPlaceholder } from "@/components/lawn-route/MapPlaceholder"
import { CustomerList } from "@/components/lawn-route/CustomerList"
import { CustomerDetailsSheet } from "@/components/lawn-route/CustomerDetailsSheet"
import { AddCustomerSheet } from "@/components/lawn-route/AddCustomerSheet"

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
      <main className="flex flex-col flex-grow overflow-hidden">
        <div className="h-1/2">
            <MapPlaceholder customers={customers} />
        </div>
        <div className="flex-grow overflow-y-auto">
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
  )
}
