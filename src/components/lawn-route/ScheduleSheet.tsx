"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Calendar, MapPin } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { DailyRoute } from "@/lib/firebase-types"

interface ScheduleSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  routes?: DailyRoute[]
}

export function ScheduleSheet({ open, onOpenChange, routes = [] }: ScheduleSheetProps) {
  const { userProfile } = useAuth()
  const [selectedDate, setSelectedDate] = React.useState(new Date())

  // Get days of the week (Monday - Sunday)
  const getDaysOfWeek = () => {
    const today = new Date()
    const days = []
    const currentDay = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - currentDay + 1) // Monday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const weekDays = getDaysOfWeek()

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const getDayNumber = (date: Date) => {
    return date.getDate()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  // Get user schedule for a specific day
  const getScheduleForDay = (date: Date) => {
    if (!userProfile?.schedule) return null;
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof userProfile.schedule
    return userProfile.schedule[dayName] as { start: string; end: string } | undefined
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-lg max-h-[90svh] overflow-y-auto"
      >
        <SheetHeader className="text-left">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <SheetTitle>My Schedule</SheetTitle>
          </div>
          <SheetDescription>
            View your weekly schedule and availability
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Week Calendar */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isSelected(day)
                    ? 'bg-primary text-primary-foreground'
                    : isToday(day)
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-muted'
                }`}
              >
                <span className="text-xs font-medium">{getDayName(day)}</span>
                <span className="text-lg font-bold">{getDayNumber(day)}</span>
              </button>
            ))}
          </div>

          {/* Selected Day Schedule */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>

            {(() => {
              const daySchedule = getScheduleForDay(selectedDate)
              const dayRoutes = routes.filter((route) => {
                const routeDate = route.date instanceof Date ? route.date : new Date(route.date)
                return routeDate.toDateString() === selectedDate.toDateString()
              })
              const assignedStops = dayRoutes.flatMap((route) =>
                route.customers.map((customer, index) => ({
                  ...customer,
                  stop: index + 1,
                  crewId: route.crewId,
                }))
              )

              return (
                <div className="space-y-4">
                  {daySchedule ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Working Hours</p>
                          <p className="text-lg font-semibold text-green-800">
                            {daySchedule.start} - {daySchedule.end}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Status</p>
                          <p className="text-sm font-medium text-green-800">Available</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No working hours set for this day</p>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Assigned stops</h4>
                    {assignedStops.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No customers routed for this day</p>
                    ) : (
                      <ol className="space-y-2">
                        {assignedStops.map((stop) => (
                          <li key={`${stop.crewId}-${stop.id}`} className="flex items-start gap-2 p-3 border rounded-lg">
                            <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{stop.stop}. {stop.name}</p>
                              <p className="text-xs text-muted-foreground">{stop.address}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
