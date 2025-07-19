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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PlacesAutocompleteSimple } from "@/components/ui/places-autocomplete-simple"
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
import { Calendar, Clock } from "lucide-react"
import type { DayOfWeek } from "@/lib/types"

interface AddCustomerSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCustomer: (data: z.infer<typeof formSchema>) => Promise<void>
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  address: z.string().min(5, { message: "Please enter a valid address." }),
  coordinates: z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
  }).optional(),
  serviceRequested: z.enum(['push-mow', 'edge', 'blow', 'detail', 'riding-mow']),
  notes: z.string().optional(),
  // Service preferences
  preferredDays: z.array(z.string()).min(1, { message: "Please select at least one preferred day." }),
  timeRangeStart: z.string(),
  timeRangeEnd: z.string(),
  serviceFrequency: z.enum(['weekly', 'biweekly', 'monthly', 'one-time']),
})

export function AddCustomerSheet({ open, onOpenChange, onAddCustomer }: AddCustomerSheetProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [timeRange, setTimeRange] = React.useState([480, 1020]) // 8:00 AM to 5:00 PM in minutes

  // Convert time string (HH:MM) to minutes since midnight
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes since midnight to time string (HH:MM)
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
    { value: 'monday', label: 'Monday', short: 'Mon' },
    { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { value: 'thursday', label: 'Thursday', short: 'Thu' },
    { value: 'friday', label: 'Friday', short: 'Fri' },
    { value: 'saturday', label: 'Saturday', short: 'Sat' },
    { value: 'sunday', label: 'Sunday', short: 'Sun' },
  ];

  const SERVICE_TYPES = [
    { value: 'push-mow', label: 'Push Mow' },
    { value: 'edge', label: 'Edge' },
    { value: 'blow', label: 'Blow' },
    { value: 'detail', label: 'Detail' },
    { value: 'riding-mow', label: 'Riding Mow' },
  ];

  const SERVICE_FREQUENCIES = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'one-time', label: 'One-time' },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      name: "",
      address: "",
      coordinates: undefined,
      serviceRequested: "push-mow",
      notes: "",
      preferredDays: [],
      timeRangeStart: "08:00",
      timeRangeEnd: "17:00",
      serviceFrequency: "weekly",
    },
  })

  // Sync slider with form values when form is reset
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'timeRangeStart' || name === 'timeRangeEnd') {
        const start = timeToMinutes(value.timeRangeStart || "08:00");
        const end = timeToMinutes(value.timeRangeEnd || "17:00");
        setTimeRange([start, end]);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      await onAddCustomer(values)
      toast({
        title: "Customer Added",
        description: `${values.name} has been added to your customer list.`,
      })
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-lg max-h-[90svh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          // Don't close if clicking on autocomplete
          if (e.target && (e.target as Element).closest('.pac-container')) {
            e.preventDefault()
          }
        }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <SheetHeader className="text-left">
              <SheetTitle>Add New Customer</SheetTitle>
              <SheetDescription>
                Fill in the details for the new customer. Click save when you're done.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                                        <FormControl>
                      <PlacesAutocompleteSimple
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Start typing an address..."
                        onPlaceSelect={(place: google.maps.places.PlaceResult) => {
                          // Extract coordinates when a place is selected
                          if (place.geometry?.location) {
                            const lat = place.geometry.location.lat()
                            const lng = place.geometry.location.lng()
                            form.setValue('coordinates', { lat, lng })
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceRequested"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SERVICE_TYPES.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            {service.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any important details..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Service Preferences Section */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Service Preferences</h3>
                </div>

                {/* Preferred Days */}
                <FormField
                  control={form.control}
                  name="preferredDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Service Days</FormLabel>
                      <div className="grid grid-cols-7 gap-4">
                        {DAYS_OF_WEEK.map((day) => (
                          <div key={day.value} className="flex flex-col items-center space-y-3">
                            <Checkbox
                              id={day.value}
                              checked={field.value.includes(day.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, day.value]);
                                } else {
                                  field.onChange(field.value.filter((d) => d !== day.value));
                                }
                              }}
                              className="w-8 h-8 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Label 
                              htmlFor={day.value} 
                              className="text-base font-semibold cursor-pointer text-center hover:text-primary transition-colors"
                            >
                              {day.short}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Time Range Slider */}
                <FormField
                  control={form.control}
                  name="timeRangeStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Preferred Time Range
                      </FormLabel>
                      <div className="px-2 py-4">
                        <Slider
                          value={timeRange}
                          onValueChange={(values) => {
                            setTimeRange(values);
                            // Update form values
                            field.onChange(minutesToTime(values[0]));
                            form.setValue('timeRangeEnd', minutesToTime(values[1]));
                          }}
                          max={1440} // 24 hours in minutes
                          min={0}
                          step={15} // 15-minute intervals
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-2">
                          <span>{minutesToTime(timeRange[0])}</span>
                          <span>{minutesToTime(timeRange[1])}</span>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Service Frequency */}
                <FormField
                  control={form.control}
                  name="serviceFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SERVICE_FREQUENCIES.map((frequency) => (
                            <SelectItem key={frequency.value} value={frequency.value}>
                              {frequency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />


              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                  <Button type="button" variant="ghost">Cancel</Button>
              </SheetClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? "Adding Customer..." : "Save Customer"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
