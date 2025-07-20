"use client"

import type { Customer } from "@/lib/firebase-types"
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
  const primaryService = customer.services?.[0];

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
          {primaryService && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-accent" />
                Service Details
              </h3>
              <div className="pl-7 space-y-1">
                <p className="text-muted-foreground">
                  <strong>Type:</strong> {primaryService.type}
                </p>
                <p className="text-muted-foreground">
                  <strong>Description:</strong> {primaryService.description}
                </p>
                <p className="text-muted-foreground">
                  <strong>Price:</strong> ${primaryService.price}
                </p>
                <p className="text-muted-foreground">
                  <strong>Status:</strong> {primaryService.status}
                </p>
                {primaryService.scheduledDate && (
                  <p className="text-muted-foreground">
                    <strong>Scheduled:</strong> {new Date(primaryService.scheduledDate.toDate()).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}

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
