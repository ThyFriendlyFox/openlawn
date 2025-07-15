"use client"

import type { Customer } from "@/lib/types"
import { CustomerCard } from "./CustomerCard"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface CustomerCarouselProps {
  customers: Customer[]
  onSelectCustomer: (customer: Customer) => void
  onAddCustomer: () => void
}

export function CustomerCarousel({
  customers,
  onSelectCustomer,
  onAddCustomer,
}: CustomerCarouselProps) {
  return (
    <div className="py-8 px-4 bg-background/80 backdrop-blur-sm border-t">
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {customers.map((customer) => (
            <CarouselItem
              key={customer.id}
              className="pl-4 basis-4/5 md:basis-1/3 lg:basis-1/4"
            >
              <div className="h-full">
                <CustomerCard
                  customer={customer}
                  onClick={() => onSelectCustomer(customer)}
                />
              </div>
            </CarouselItem>
          ))}
          <CarouselItem className="pl-4 basis-4/5 md:basis-1/3 lg:basis-1/4">
             <div className="h-full">
                <CustomerCard isAddCard={true} onClick={onAddCustomer} />
             </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  )
}
