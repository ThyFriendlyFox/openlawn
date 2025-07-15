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
    <div className="p-4 bg-background/80 backdrop-blur-sm border-t h-full overflow-y-auto">
      <div className="grid grid-cols-1 gap-4">
        {customers.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onClick={() => onSelectCustomer(customer)}
          />
        ))}
        <CustomerCard isAddCard onClick={onAddCustomer} />
      </div>
    </div>
  )
}
