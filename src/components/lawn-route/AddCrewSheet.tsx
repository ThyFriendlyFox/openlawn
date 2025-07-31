"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { Building2, Truck, Users } from "lucide-react"
import { getAvailableServiceTypes } from "@/lib/crew-assignment-service"

interface AddCrewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCrew: (data: z.infer<typeof formSchema>) => Promise<void>
}

const formSchema = z.object({
  crewId: z.string().min(3, { message: "Crew ID must be at least 3 characters." }),
  name: z.string().min(2, { message: "Crew name must be at least 2 characters." }),
  description: z.string().optional(),
  serviceType: z.string().min(1, { message: "Service type is required." }),
  vehicle: z.object({
    type: z.string().optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.string().optional(),
    licensePlate: z.string().optional(),
  }).optional(),
  equipment: z.array(z.string()).default([]),
  notes: z.string().optional(),
})

export function AddCrewSheet({ open, onOpenChange, onAddCrew }: AddCrewSheetProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [serviceTypes, setServiceTypes] = React.useState<string[]>([])

  React.useEffect(() => {
    setServiceTypes(getAvailableServiceTypes())
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      crewId: "",
      name: "",
      description: "",
      serviceType: "",
      vehicle: {
        type: "",
        make: "",
        model: "",
        year: "",
        licensePlate: "",
      },
      equipment: [],
      notes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      await onAddCrew(values)
      toast({
        title: "Crew Created",
        description: `${values.name} has been created successfully.`,
      })
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create crew. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const EQUIPMENT_OPTIONS = [
    "Lawn Mower",
    "Edger",
    "Blower",
    "Trimmer",
    "Fertilizer Spreader",
    "Irrigation Tools",
    "Safety Equipment",
    "GPS Device",
    "Tablet/Phone",
    "First Aid Kit",
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-lg max-h-[90svh] overflow-y-auto"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <SheetHeader className="text-left">
              <SheetTitle>Create New Crew</SheetTitle>
              <SheetDescription>
                Set up a new crew with equipment and service capabilities.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-6">
              <FormField
                control={form.control}
                name="crewId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crew ID</FormLabel>
                    <FormControl>
                      <Input placeholder="crew-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crew Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Crew Alpha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description of the crew..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {serviceTypes.map((serviceType) => (
                          <SelectItem key={serviceType} value={serviceType}>
                            {serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Vehicle Information */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Vehicle Information</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicle.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Truck, Van, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle.make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input placeholder="Ford, Chevrolet, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle.model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="F-150, Silverado, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle.year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input placeholder="2020" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle.licensePlate"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>License Plate</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC-123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Equipment */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Equipment</h3>
                </div>

                <FormField
                  control={form.control}
                  name="equipment"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 gap-3">
                        {EQUIPMENT_OPTIONS.map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="equipment"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {item}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Crew"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
} 