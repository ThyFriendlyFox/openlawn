"use client"

import type { Customer } from "@/lib/types"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ClipboardList, MapPin, User, Wrench } from "lucide-react"
import { AIGeneratedSummary } from "./AIGeneratedSummary"
import { Separator } from "@/components/ui/separator"

interface CustomerDetailsSheetProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomerDetailsSheet({ customer, open, onOpenChange }: CustomerDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-lg max-h-[90svh] overflow-y-auto">
        <SheetHeader className="text-left mb-4">
          <SheetTitle className="text-2xl font-headline flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            {customer.name}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2 pt-1">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            {customer.address}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Wrench className="w-5 h-5 text-accent" />
              Service Details
            </h3>
            <p className="text-muted-foreground pl-7">{customer.serviceRequested}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-accent" />
              Notes
            </h3>
            <p className="text-muted-foreground pl-7">{customer.notes || "No notes provided."}</p>
          </div>

          <Separator />
          
          <AIGeneratedSummary customer={customer} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
