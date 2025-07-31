"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { RouteMap } from "@/components/lawn-route/RouteMap"
import { CustomerList } from "@/components/lawn-route/CustomerList"
import { ManagerMap } from "@/components/lawn-route/ManagerMap"
import { AddCustomerSheet } from "@/components/lawn-route/AddCustomerSheet"
import { AddEmployeeSheet } from "@/components/lawn-route/AddEmployeeSheet"
import { AddCrewSheet } from "@/components/lawn-route/AddCrewSheet"
import { Header } from "@/components/lawn-route/Header"
import { Button } from "@/components/ui/button"
import { Plus, User as UserIcon, Users, Building2 } from "lucide-react"
import { subscribeToCustomers, addCustomer } from "@/lib/customer-service"
import { subscribeToUsers } from "@/lib/user-service"
import { generateOptimalRoutes, getCachedRoute } from "@/lib/route-service"
import type { Customer, User as FirebaseUser, DailyRoute } from "@/lib/firebase-types"
import { useToast } from "@/hooks/use-toast"
import { googleMapsConfig } from "@/lib/env"

export default function LawnRoutePage() {
  const { userProfile } = useAuth()
  const { toast } = useToast()
  
  // State for customers and users
  const [customers, setCustomers] = useState<Customer[]>([])
  const [users, setUsers] = useState<FirebaseUser[]>([])
  const [routes, setRoutes] = useState<DailyRoute[]>([])
  
  // State for manager view
  const [activeView, setActiveView] = useState<'customers' | 'employees' | 'crews'>('customers')
  const [isAddCustomerSheetOpen, setIsAddCustomerSheetOpen] = useState(false)
  const [isAddEmployeeSheetOpen, setIsAddEmployeeSheetOpen] = useState(false)
  const [isAddCrewSheetOpen, setIsAddCrewSheetOpen] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  
  // Minimum swipe distance
  const minSwipeDistance = 30

  const isManager = userProfile?.role === 'manager' || userProfile?.role === 'admin'
  
  // Debug logging
  console.log('User Profile:', userProfile)
  console.log('Is Manager:', isManager)

  // Subscribe to customers
  useEffect(() => {
    if (!userProfile) return

    const unsubscribeCustomers = subscribeToCustomers((customers) => {
      setCustomers(customers)
    })

    return () => unsubscribeCustomers()
  }, [userProfile])

  // Subscribe to users (for manager view)
  useEffect(() => {
    if (!isManager) return

    const unsubscribeUsers = subscribeToUsers((users) => {
      setUsers(users)
    })

    return () => unsubscribeUsers()
  }, [isManager])

  // Generate routes for today
  useEffect(() => {
    if (!isManager) return

    const generateTodayRoutes = async () => {
      try {
        const todayRoutes = await generateOptimalRoutes(new Date())
        setRoutes(todayRoutes)
      } catch (error) {
        console.error('Error generating routes:', error)
        toast({
          title: "Route Generation Error",
          description: "Failed to generate optimal routes for today.",
          variant: "destructive",
        })
      }
    }

    generateTodayRoutes()
  }, [isManager, customers, users, toast])

  // Swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      // Swipe left - go to next view
      if (activeView === 'customers') setActiveView('employees')
      else if (activeView === 'employees') setActiveView('crews')
      else if (activeView === 'crews') setActiveView('customers')
    }

    if (isRightSwipe) {
      // Swipe right - go to previous view
      if (activeView === 'customers') setActiveView('crews')
      else if (activeView === 'employees') setActiveView('customers')
      else if (activeView === 'crews') setActiveView('employees')
    }
  }

  // Handle adding new customer
  const handleAddCustomer = async (data: any) => {
    try {
      const newCustomer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> = {
        name: data.name,
        address: data.address,
        lat: data.coordinates?.lat || 0,
        lng: data.coordinates?.lng || 0,
        notes: data.notes || '',
        billingInfo: {},
        status: 'active',
        services: [{
          id: Date.now().toString(),
          type: data.serviceType,
          description: `${data.serviceType} service`,
          price: 0,
          scheduledDate: new Date() as any,
          status: 'scheduled',
        }],
        lastServiceDate: undefined,
        nextServiceDate: undefined,
        createdBy: userProfile?.id || '',
        servicePreferences: {
          preferredDays: data.servicePreferences.preferredDays,
          preferredTimeRange: data.servicePreferences.preferredTimeRange,
          serviceFrequency: data.servicePreferences.serviceFrequency === 'weekly' ? 7 : 
                          data.servicePreferences.serviceFrequency === 'biweekly' ? 14 : 
                          data.servicePreferences.serviceFrequency === 'monthly' ? 30 : 1,
        },
        serviceHistory: [],
      }

      await addCustomer(newCustomer)
      setIsAddCustomerSheetOpen(false)
    } catch (error) {
      console.error('Error adding customer:', error)
      throw error
    }
  }

  // Handle adding new employee
  const handleAddEmployee = async (data: any) => {
    try {
      const { createDocument } = await import('@/lib/firebase-services');
      
      // Create the user document
      const userId = await createDocument('users', {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        role: data.role,
        title: data.title || null,
        notes: data.notes || '',
        schedule: data.schedule,
        status: 'available',
        currentLocation: null,
        capabilities: [],
        region: '',
        crewId: null,
        crewServiceType: null,
      });

      setIsAddEmployeeSheetOpen(false);
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  };

  // Handle adding new crew
  const handleAddCrew = async (data: any) => {
    try {
      // For now, we'll just store crew info in a separate collection
      // In a real app, you might want to create a crews collection
      console.log('Crew created:', data);
      setIsAddCrewSheetOpen(false);
    } catch (error) {
      console.error('Error adding crew:', error);
      throw error;
    }
  };

  // Navigation bar component
  const renderNavigationBar = () => (
    <div className="flex w-full bg-background border-t">
      <button
        onClick={() => setActiveView('customers')}
        className={`flex-1 py-3 px-4 text-center transition-colors ${
          activeView === 'customers' 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-muted'
        }`}
      >
        Customers
      </button>
      <button
        onClick={() => setActiveView('employees')}
        className={`flex-1 py-3 px-4 text-center transition-colors ${
          activeView === 'employees' 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-muted'
        }`}
      >
        Employees
      </button>
      <button
        onClick={() => setActiveView('crews')}
        className={`flex-1 py-3 px-4 text-center transition-colors ${
          activeView === 'crews' 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-muted'
        }`}
      >
        Crews
      </button>
    </div>
  )

  // Render customers view
  const renderCustomersView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <UserIcon className="w-5 h-5" />
          Customers ({customers.length})
        </h2>
      </div>
      
      <div className="space-y-4 p-4">
        {/* Add New Customer Card - Now at the top */}
        <div
          onClick={() => setIsAddCustomerSheetOpen(true)}
          className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary hover:text-primary transition-all bg-secondary/50 flex flex-col items-center justify-center text-center"
        >
          <Plus className="w-10 h-10 mb-2" />
          <p className="font-semibold">Add New Customer</p>
        </div>

        {/* Existing customers */}
        {customers.map((customer) => (
        <div
          key={customer.id}
          className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{customer.name}</h3>
              <p className="text-sm text-muted-foreground">{customer.address}</p>
              {customer.services.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Service: {customer.services[0].type}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className={`px-2 py-1 rounded-full text-xs ${
                customer.status === 'active' ? 'bg-green-100 text-green-800' :
                customer.status === 'inactive' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {customer.status}
              </span>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  )

  // Render employees view
  const renderEmployeesView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Employees ({users.filter(user => user.role === 'employee' || user.role === 'manager').length})
        </h2>
      </div>
      
      <div className="space-y-4 p-4">
      {/* Add New Employee Card */}
      <div 
        onClick={() => setIsAddEmployeeSheetOpen(true)}
        className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary hover:text-primary transition-all bg-secondary/50 flex flex-col items-center justify-center text-center"
      >
        <UserIcon className="w-10 h-10 mb-2" />
        <p className="font-semibold">Add New Employee</p>
      </div>

      {/* Existing employees */}
      {users.filter(user => user.role === 'employee' || user.role === 'manager').map((user) => (
        <div
          key={user.id}
          className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Role: {user.role === 'manager' ? 'Manager' : 'Employee'} {user.title && `(${user.title})`}
              </p>
            </div>
            <div className="text-right">
              <span className={`px-2 py-1 rounded-full text-xs ${
                user.status === 'available' ? 'bg-green-100 text-green-800' :
                user.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {user.status}
              </span>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  )

  // Render crews view
  const renderCrewsView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Crews ({routes.length})
        </h2>
      </div>
      
      <div className="space-y-4 p-4">
      {/* Add New Crew Card */}
      <div 
        onClick={() => setIsAddCrewSheetOpen(true)}
        className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary hover:text-primary transition-all bg-secondary/50 flex flex-col items-center justify-center text-center"
      >
        <Building2 className="w-10 h-10 mb-2" />
        <p className="font-semibold">Add New Crew</p>
      </div>

      {/* Route information */}
      {routes.map((route) => (
        <div
          key={route.crewId}
          className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">Crew {route.crewId}</h3>
              <p className="text-sm text-muted-foreground">
                {route.customers.length} customers assigned
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Estimated duration: {Math.round(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m
              </p>
              <p className="text-sm text-muted-foreground">
                Total distance: {route.totalDistance.toFixed(1)} miles
              </p>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Active
              </span>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  )

  if (isManager) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col h-svh bg-background text-foreground font-body">
          <Header />
          <main className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-3 flex-grow overflow-hidden">
            <div className="md:col-span-2 h-full w-full">
              <ManagerMap 
                customers={customers}
                employees={users.filter(user => user.role === 'employee' || user.role === 'manager')}
                selectedCustomer={null}
                onSelectCustomer={() => {}}
                apiKey={googleMapsConfig.apiKey}
              />
            </div>
            <div 
              className="md:col-span-1 flex flex-col overflow-hidden touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeView === 'customers' && renderCustomersView()}
                {activeView === 'employees' && renderEmployeesView()}
                {activeView === 'crews' && renderCrewsView()}
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-center p-4 border-t flex-shrink-0 bg-background">
                <div className="flex items-center w-full space-x-2">
                  <button
                    onClick={() => setActiveView('customers')}
                    className={`h-4 flex-1 rounded-full transition-colors ${activeView === 'customers' ? 'bg-primary' : 'bg-muted'} hover:opacity-80`}
                  />
                  <button
                    onClick={() => setActiveView('employees')}
                    className={`h-4 flex-1 rounded-full transition-colors ${activeView === 'employees' ? 'bg-primary' : 'bg-muted'} hover:opacity-80`}
                  />
                  <button
                    onClick={() => setActiveView('crews')}
                    className={`h-4 flex-1 rounded-full transition-colors ${activeView === 'crews' ? 'bg-primary' : 'bg-muted'} hover:opacity-80`}
                  />
                </div>
              </div>
            </div>
          </main>

          {/* Add Customer Sheet */}
          <AddCustomerSheet
            open={isAddCustomerSheetOpen}
            onOpenChange={setIsAddCustomerSheetOpen}
            onAddCustomer={handleAddCustomer}
          />

          {/* Add Employee Sheet */}
          <AddEmployeeSheet
            open={isAddEmployeeSheetOpen}
            onOpenChange={setIsAddEmployeeSheetOpen}
            onAddEmployee={handleAddEmployee}
          />

          {/* Add Crew Sheet */}
          <AddCrewSheet
            open={isAddCrewSheetOpen}
            onOpenChange={setIsAddCrewSheetOpen}
            onAddCrew={handleAddCrew}
          />
        </div>
      </ProtectedRoute>
    )
  }

  // Employee view (original simple interface)
  return (
    <ProtectedRoute>
      <div className="flex flex-col h-svh bg-background text-foreground font-body">
        <Header />
        <main className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-3 flex-grow overflow-hidden">
          <div className="md:col-span-2 h-full w-full">
            <RouteMap 
              customers={customers} 
              selectedCustomer={null}
              onSelectCustomer={() => {}}
              apiKey={googleMapsConfig.apiKey}
            />
          </div>
          <div className="md:col-span-1 flex-grow overflow-y-auto">
            <CustomerList 
              customers={customers} 
              onSelectCustomer={() => {}}
              onAddCustomer={() => setIsAddSheetOpen(true)}
            />
          </div>
        </main>

        {/* Add Customer Sheet */}
        <AddCustomerSheet
          open={isAddCustomerSheetOpen}
          onOpenChange={setIsAddCustomerSheetOpen}
          onAddCustomer={handleAddCustomer}
        />
      </div>
    </ProtectedRoute>
  )
}
