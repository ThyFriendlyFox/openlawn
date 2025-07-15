"use client"

import type { Customer } from "@/lib/types"
import { CustomerCard } from "./CustomerCard"

interface CustomerListProps {
  customers: Customer[]
  onSelectCustomer: (customer: Customer) => void
  onAddCustomer: () => void
}

export function CustomerList({
  customers,
  onSelectCustomer,
  onAddCustomer,
}: CustomerListProps) {
  return (
    <div className="py-4 px-4 bg-background/80 backdrop-blur-sm border-t h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {customers.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onClick={() => onSelectCustomer(customer)}
          />
        ))}
        <CustomerCard isAddCard={true} onClick={onAddCustomer} />
      </div>
    </div>
  )
}
