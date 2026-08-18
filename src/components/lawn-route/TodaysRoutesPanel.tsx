"use client"

import type { DailyRoute } from "@/lib/firebase-types"
import { MapPin, Route } from "lucide-react"

interface TodaysRoutesPanelProps {
  routes: DailyRoute[]
  onSelectRoute?: (route: DailyRoute) => void
}

export function TodaysRoutesPanel({ routes, onSelectRoute }: TodaysRoutesPanelProps) {
  const today = new Date()
  const todaysRoutes = routes.filter((route) => {
    const routeDate = route.date instanceof Date ? route.date : new Date(route.date)
    return routeDate.toDateString() === today.toDateString() && route.customers.length > 0
  })

  if (todaysRoutes.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-muted/40 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">No routes for today</p>
        <p>
          Crews need a weekday schedule and customers need a matching service type.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Route className="w-4 h-4" />
        Today&apos;s routes ({todaysRoutes.length})
      </h3>
      {todaysRoutes.map((route) => (
        <button
          key={route.crewId}
          type="button"
          className="w-full text-left p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
          onClick={() => onSelectRoute?.(route)}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold">Crew {route.crewId}</p>
            <span className="text-xs text-muted-foreground">
              {route.customers.length} stops · {Math.round(route.estimatedDuration || 0)} min
            </span>
          </div>
          <ol className="space-y-1">
            {route.customers.map((customer, index) => (
              <li key={customer.id} className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground w-5">{index + 1}.</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  {customer.name}
                </span>
              </li>
            ))}
          </ol>
        </button>
      ))}
    </div>
  )
}
