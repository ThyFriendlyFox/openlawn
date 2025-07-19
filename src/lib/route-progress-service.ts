import { calculateDistance } from './location-utils'
import type { Route, RouteStop } from './types'

export interface RouteProgress {
  crewId: string
  routeId: string
  date: Date
  
  // Progress metrics
  stopsCompleted: number
  totalStops: number
  progressPercentage: number
  
  // Distance metrics
  distanceTraveled: number // meters
  totalDistance: number // meters
  distanceProgress: number // percentage
  
  // Time metrics
  timeElapsed: number // minutes
  estimatedTotalTime: number // minutes
  timeProgress: number // percentage
  
  // Current status
  currentStop?: RouteStop
  nextStop?: RouteStop
  currentLocation?: { lat: number; lng: number; timestamp: Date }
  
  // Performance metrics
  averageTimePerStop: number // minutes
  estimatedCompletionTime: Date
  isOnSchedule: boolean
  delayMinutes: number
  
  // Status
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed'
  lastUpdated: Date
}

export interface CrewLocation {
  crewId: string
  location: { lat: number; lng: number; timestamp: Date }
  employeeCount: number
}

export class RouteProgressCalculator {
  private static readonly ON_TIME_THRESHOLD = 15 // minutes
  private static readonly PROGRESS_WEIGHTS = {
    stops: 0.4,      // 40% weight for completed stops
    distance: 0.3,   // 30% weight for distance traveled
    time: 0.3        // 30% weight for time elapsed
  }

  /**
   * Calculate comprehensive route progress for a crew
   */
  static calculateRouteProgress(
    route: Route,
    crewLocation?: CrewLocation,
    completedStops: string[] = []
  ): RouteProgress {
    const now = new Date()
    const routeStartTime = this.getRouteStartTime(route)
    const timeElapsed = routeStartTime ? 
      Math.max(0, (now.getTime() - routeStartTime.getTime()) / (1000 * 60)) : 0
    
    // Calculate stop-based progress
    const stopsCompleted = completedStops.length
    const totalStops = route.stops.length
    const stopProgress = totalStops > 0 ? (stopsCompleted / totalStops) * 100 : 0
    
    // Calculate distance-based progress
    const distanceProgress = this.calculateDistanceProgress(route, completedStops, crewLocation)
    
    // Calculate time-based progress
    const timeProgress = this.calculateTimeProgress(route, timeElapsed)
    
    // Calculate weighted overall progress
    const overallProgress = (
      stopProgress * this.PROGRESS_WEIGHTS.stops +
      distanceProgress.percentage * this.PROGRESS_WEIGHTS.distance +
      timeProgress.percentage * this.PROGRESS_WEIGHTS.time
    )
    
    // Determine current and next stops
    const currentStop = this.getCurrentStop(route, completedStops, crewLocation)
    const nextStop = this.getNextStop(route, completedStops)
    
    // Calculate performance metrics
    const averageTimePerStop = this.calculateAverageTimePerStop(route, timeElapsed, stopsCompleted)
    const estimatedCompletionTime = this.estimateCompletionTime(route, timeElapsed, stopsCompleted, averageTimePerStop)
    const delayMinutes = this.calculateDelay(route, timeElapsed, stopsCompleted)
    const isOnSchedule = delayMinutes <= this.ON_TIME_THRESHOLD
    
    // Determine status
    const status = this.determineStatus(route, stopsCompleted, totalStops, isOnSchedule)
    
    return {
      crewId: route.crewId,
      routeId: route.id,
      date: route.date,
      
      // Progress metrics
      stopsCompleted,
      totalStops,
      progressPercentage: Math.round(overallProgress),
      
      // Distance metrics
      distanceTraveled: distanceProgress.traveled,
      totalDistance: route.totalDistance,
      distanceProgress: distanceProgress.percentage,
      
      // Time metrics
      timeElapsed: Math.round(timeElapsed),
      estimatedTotalTime: route.totalDuration,
      timeProgress: timeProgress.percentage,
      
      // Current status
      currentStop,
      nextStop,
      currentLocation: crewLocation?.location,
      
      // Performance metrics
      averageTimePerStop: Math.round(averageTimePerStop),
      estimatedCompletionTime,
      isOnSchedule,
      delayMinutes: Math.round(delayMinutes),
      
      // Status
      status,
      lastUpdated: now
    }
  }

  /**
   * Calculate distance-based progress considering actual travel
   */
  private static calculateDistanceProgress(
    route: Route,
    completedStops: string[],
    crewLocation?: CrewLocation
  ): { traveled: number; percentage: number } {
    if (route.stops.length === 0) {
      return { traveled: 0, percentage: 0 }
    }

    let distanceTraveled = 0
    
    // Calculate distance for completed segments
    for (let i = 0; i < route.stops.length - 1; i++) {
      const currentStop = route.stops[i]
      const nextStop = route.stops[i + 1]
      
      // If current stop is completed, add distance to next stop
      if (completedStops.includes(currentStop.customerId)) {
        distanceTraveled += calculateDistance(
          currentStop.lat,
          currentStop.lng,
          nextStop.lat,
          nextStop.lng
        )
      }
    }
    
    // If crew has current location, add distance from last completed stop to current location
    if (crewLocation && completedStops.length > 0) {
      const lastCompletedStop = route.stops.find(stop => 
        completedStops.includes(stop.customerId)
      )
      
      if (lastCompletedStop) {
        const distanceToCurrentLocation = calculateDistance(
          lastCompletedStop.lat,
          lastCompletedStop.lng,
          crewLocation.location.lat,
          crewLocation.location.lng
        )
        distanceTraveled += distanceToCurrentLocation
      }
    }
    
    const percentage = route.totalDistance > 0 ? 
      Math.min(100, (distanceTraveled / route.totalDistance) * 100) : 0
    
    return { traveled: Math.round(distanceTraveled), percentage: Math.round(percentage) }
  }

  /**
   * Calculate time-based progress
   */
  private static calculateTimeProgress(route: Route, timeElapsed: number): { percentage: number } {
    const percentage = route.totalDuration > 0 ? 
      Math.min(100, (timeElapsed / route.totalDuration) * 100) : 0
    
    return { percentage: Math.round(percentage) }
  }

  /**
   * Get the current stop based on completed stops and crew location
   */
  private static getCurrentStop(
    route: Route,
    completedStops: string[],
    crewLocation?: CrewLocation
  ): RouteStop | undefined {
    if (completedStops.length === route.stops.length) {
      return undefined // All stops completed
    }
    
    // Find the first incomplete stop
    const currentStop = route.stops.find(stop => 
      !completedStops.includes(stop.customerId)
    )
    
    // If crew has location, find the closest incomplete stop
    if (crewLocation && currentStop) {
      const closestStop = route.stops
        .filter(stop => !completedStops.includes(stop.customerId))
        .reduce((closest, stop) => {
          const distanceToClosest = calculateDistance(
            crewLocation.location.lat,
            crewLocation.location.lng,
            closest.lat,
            closest.lng
          )
          const distanceToStop = calculateDistance(
            crewLocation.location.lat,
            crewLocation.location.lng,
            stop.lat,
            stop.lng
          )
          return distanceToStop < distanceToClosest ? stop : closest
        })
      
      return closestStop
    }
    
    return currentStop
  }

  /**
   * Get the next stop after the current one
   */
  private static getNextStop(route: Route, completedStops: string[]): RouteStop | undefined {
    const currentStopIndex = route.stops.findIndex(stop => 
      !completedStops.includes(stop.customerId)
    )
    
    if (currentStopIndex === -1 || currentStopIndex >= route.stops.length - 1) {
      return undefined
    }
    
    return route.stops[currentStopIndex + 1]
  }

  /**
   * Calculate average time per stop
   */
  private static calculateAverageTimePerStop(
    route: Route,
    timeElapsed: number,
    stopsCompleted: number
  ): number {
    if (stopsCompleted === 0) return 0
    
    return timeElapsed / stopsCompleted
  }

  /**
   * Estimate completion time based on current progress
   */
  private static estimateCompletionTime(
    route: Route,
    timeElapsed: number,
    stopsCompleted: number,
    averageTimePerStop: number
  ): Date {
    const remainingStops = route.stops.length - stopsCompleted
    const estimatedRemainingTime = remainingStops * averageTimePerStop
    
    const estimatedCompletion = new Date()
    estimatedCompletion.setMinutes(estimatedCompletion.getMinutes() + estimatedRemainingTime)
    
    return estimatedCompletion
  }

  /**
   * Calculate delay in minutes
   */
  private static calculateDelay(
    route: Route,
    timeElapsed: number,
    stopsCompleted: number
  ): number {
    if (route.stops.length === 0) return 0
    
    const expectedProgress = timeElapsed / route.totalDuration
    const actualProgress = stopsCompleted / route.stops.length
    
    if (actualProgress >= expectedProgress) return 0
    
    const expectedStops = expectedProgress * route.stops.length
    const missingStops = expectedStops - stopsCompleted
    
    // Estimate delay based on average time per stop
    const averageTimePerStop = route.totalDuration / route.stops.length
    return missingStops * averageTimePerStop
  }

  /**
   * Determine route status
   */
  private static determineStatus(
    route: Route,
    stopsCompleted: number,
    totalStops: number,
    isOnSchedule: boolean
  ): RouteProgress['status'] {
    if (stopsCompleted === 0) return 'not_started'
    if (stopsCompleted === totalStops) return 'completed'
    if (!isOnSchedule) return 'delayed'
    return 'in_progress'
  }

  /**
   * Get route start time (estimated based on first stop)
   */
  private static getRouteStartTime(route: Route): Date | null {
    if (route.stops.length === 0) return null
    
    const firstStop = route.stops[0]
    const [hours, minutes] = firstStop.estimatedArrival.split(':').map(Number)
    
    const startTime = new Date(route.date)
    startTime.setHours(hours, minutes, 0, 0)
    
    return startTime
  }

  /**
   * Calculate progress for multiple crews
   */
  static calculateAllCrewProgress(
    routes: Route[],
    crewLocations: CrewLocation[],
    completedStops: Record<string, string[]> = {}
  ): Record<string, RouteProgress> {
    const progress: Record<string, RouteProgress> = {}
    
    routes.forEach(route => {
      const crewLocation = crewLocations.find(cl => cl.crewId === route.crewId)
      const crewCompletedStops = completedStops[route.crewId] || []
      
      progress[route.crewId] = this.calculateRouteProgress(
        route,
        crewLocation,
        crewCompletedStops
      )
    })
    
    return progress
  }

  /**
   * Get progress summary for dashboard
   */
  static getProgressSummary(progress: RouteProgress[]): {
    totalCrews: number
    activeCrews: number
    completedRoutes: number
    averageProgress: number
    delayedCrews: number
    onTimeCrews: number
  } {
    const totalCrews = progress.length
    const activeCrews = progress.filter(p => p.status === 'in_progress').length
    const completedRoutes = progress.filter(p => p.status === 'completed').length
    const delayedCrews = progress.filter(p => p.status === 'delayed').length
    const onTimeCrews = progress.filter(p => p.isOnSchedule).length
    
    const averageProgress = progress.length > 0 ? 
      progress.reduce((sum, p) => sum + p.progressPercentage, 0) / progress.length : 0
    
    return {
      totalCrews,
      activeCrews,
      completedRoutes,
      averageProgress: Math.round(averageProgress),
      delayedCrews,
      onTimeCrews
    }
  }
} 