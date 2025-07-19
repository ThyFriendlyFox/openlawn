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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
import { Users, Plus, X } from "lucide-react"
import type { ServiceType, DayOfWeek } from "@/lib/types"

interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager';
  status: 'active' | 'inactive';
}

interface Crew {
  id: string;
  name: string;
  employees: Employee[];
  services: {
    serviceType: ServiceType;
    days: DayOfWeek[];
  }[];
  status: 'active' | 'inactive';
}

interface CrewManagementSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  crew?: Crew
  availableEmployees: Employee[]
  onSaveCrew: (crewData: z.infer<typeof formSchema>) => Promise<void>
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Crew name must be at least 2 characters." }),
  status: z.enum(['active', 'inactive']),
  employeeIds: z.array(z.string()).min(1, { message: "Please assign at least one employee." }),
  services: z.array(z.object({
    serviceType: z.enum(['push-mow', 'edge', 'blow', 'detail', 'riding-mow']),
    days: z.array(z.string())
  })).min(1, { message: "Please assign at least one service." }),
})

const SERVICE_TYPES = [
  { value: 'push-mow', label: 'Push Mow' },
  { value: 'edge', label: 'Edge' },
  { value: 'blow', label: 'Blow' },
  { value: 'detail', label: 'Detail' },
  { value: 'riding-mow', label: 'Riding Mow' },
]

const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 'monday', label: 'Monday', short: 'Mon' },
  { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { value: 'thursday', label: 'Thursday', short: 'Thu' },
  { value: 'friday', label: 'Friday', short: 'Fri' },
  { value: 'saturday', label: 'Saturday', short: 'Sat' },
  { value: 'sunday', label: 'Sunday', short: 'Sun' },
]

export function CrewManagementSheet({ 
  open, 
  onOpenChange, 
  crew, 
  availableEmployees, 
  onSaveCrew 
}: CrewManagementSheetProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      name: crew?.name || "",
      status: crew?.status || "active",
      employeeIds: crew?.employees.map(emp => emp.id) || [],
      services: crew?.services || [{ serviceType: 'push-mow', days: [] }],
    },
  })

  // Reset form when crew changes
  React.useEffect(() => {
    if (crew) {
      form.reset({
        name: crew.name,
        status: crew.status,
        employeeIds: crew.employees.map(emp => emp.id),
        services: crew.services,
      })
    } else {
      form.reset({
        name: "",
        status: "active",
        employeeIds: [],
        services: [{ serviceType: 'push-mow', days: [] }],
      })
    }
  }, [crew, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      await onSaveCrew(values)
      toast({
        title: crew ? "Crew Updated" : "Crew Created",
        description: `${values.name} has been ${crew ? 'updated' : 'created'} successfully.`,
      })
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${crew ? 'update' : 'create'} crew. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addService = () => {
    const currentServices = form.getValues('services')
    form.setValue('services', [...currentServices, { serviceType: 'push-mow', days: [] }])
  }

  const removeService = (index: number) => {
    const currentServices = form.getValues('services')
    if (currentServices.length > 1) {
      form.setValue('services', currentServices.filter((_, i) => i !== index))
    }
  }

  const selectedEmployeeIds = form.watch('employeeIds')
  const selectedEmployees = availableEmployees.filter(emp => selectedEmployeeIds.includes(emp.id))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-lg max-h-[90svh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <SheetHeader className="text-left">
              <SheetTitle>{crew ? 'Edit Crew' : 'Create New Crew'}</SheetTitle>
              <SheetDescription>
                {crew ? 'Update crew information and assignments.' : 'Set up a new crew with employees and services.'}
              </SheetDescription>
            </SheetHeader>
            
            <div className="grid gap-4 py-6">
              {/* Crew Name */}
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

              {/* Crew Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Employee Assignment */}
              <FormField
                control={form.control}
                name="employeeIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Employees</FormLabel>
                    <div className="grid grid-cols-1 gap-2">
                      {availableEmployees.map((employee) => (
                        <div key={employee.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={employee.id}
                            checked={field.value.includes(employee.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, employee.id])
                              } else {
                                field.onChange(field.value.filter(id => id !== employee.id))
                              }
                            }}
                          />
                      <Label htmlFor={employee.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{employee.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {employee.role}
                            </Badge>
                            <Badge variant={employee.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                              {employee.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      </Label>
                    </div>
                  ))}
                </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Selected Employees Summary */}
              {selectedEmployees.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Employees ({selectedEmployees.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployees.map((employee) => (
                      <Badge key={employee.id} variant="secondary" className="text-sm">
                        {employee.name} ({employee.role})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Services Assignment */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Services & Schedule</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addService}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Service
                  </Button>
                </div>

                {form.watch('services').map((service, serviceIndex) => (
                  <div key={serviceIndex} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Service {serviceIndex + 1}</h4>
                      {form.watch('services').length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(serviceIndex)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Service Type */}
                    <FormField
                      control={form.control}
                      name={`services.${serviceIndex}.serviceType`}
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

                    {/* Service Days */}
                    <FormField
                      control={form.control}
                      name={`services.${serviceIndex}.days`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Days</FormLabel>
                          <div className="grid grid-cols-7 gap-2">
                            {DAYS_OF_WEEK.map((day) => (
                              <div key={day.value} className="flex flex-col items-center space-y-2">
                                <Checkbox
                                  id={`${serviceIndex}-${day.value}`}
                                  checked={field.value.includes(day.value)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, day.value])
                                    } else {
                                      field.onChange(field.value.filter((d) => d !== day.value))
                                    }
                                  }}
                                />
                                <Label 
                                  htmlFor={`${serviceIndex}-${day.value}`} 
                                  className="text-xs font-medium cursor-pointer text-center"
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
                  </div>
                ))}
              </div>
            </div>

            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </SheetClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? (crew ? "Updating..." : "Creating...") : (crew ? "Update Crew" : "Create Crew")}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
} 
 