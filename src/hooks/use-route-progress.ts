"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { RouteProgressCalculator, type RouteProgress, type CrewLocation } from '@/lib/route-progress-service'
import type { Route } from '@/lib/types'

interface UseRouteProgressOptions {
  routes: Route[]
  updateInterval?: number // milliseconds, default 30 seconds
  enableRealTime?: boolean
}

interface RouteProgressState {
  progress: Record<string, RouteProgress>
  crewLocations: CrewLocation[]
  completedStops: Record<string, string[]>
  summary: {
    totalCrews: number
    activeCrews: number
    completedRoutes: number
    averageProgress: number
    delayedCrews: number
    onTimeCrews: number
  }
  isLoading: boolean
  error: string | null
}

export function useRouteProgress({
  routes,
  updateInterval = 30000, // 30 seconds
  enableRealTime = true
}: UseRouteProgressOptions) {
  const [state, setState] = useState<RouteProgressState>({
    progress: {},
    crewLocations: [],
    completedStops: {},
    summary: {
      totalCrews: 0,
      activeCrews: 0,
      completedRoutes: 0,
      averageProgress: 0,
      delayedCrews: 0,
      onTimeCrews: 0
    },
    isLoading: true,
    error: null
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const routesRef = useRef(routes)

  // Update routes ref when routes change
  useEffect(() => {
    routesRef.current = routes
  }, [routes])

  // Calculate progress for all routes
  const calculateProgress = useCallback(() => {
    try {
      const progress = RouteProgressCalculator.calculateAllCrewProgress(
        routesRef.current,
        state.crewLocations,
        state.completedStops
      )

      const progressArray = Object.values(progress)
      const summary = RouteProgressCalculator.getProgressSummary(progressArray)

      setState(prev => ({
        ...prev,
        progress,
        summary,
        isLoading: false,
        error: null
      }))
    } catch (error) {
      console.error('Error calculating route progress:', error)
      setState(prev => ({
        ...prev,
        error: 'Failed to calculate route progress',
        isLoading: false
      }))
    }
  }, [state.crewLocations, state.completedStops])

  // Update crew location
  const updateCrewLocation = useCallback((crewId: string, location: { lat: number; lng: number; timestamp: Date }, employeeCount: number = 1) => {
    setState(prev => {
      const existingIndex = prev.crewLocations.findIndex(cl => cl.crewId === crewId)
      const newLocation: CrewLocation = {
        crewId,
        location,
        employeeCount
      }

      let newLocations: CrewLocation[]
      if (existingIndex >= 0) {
        newLocations = [...prev.crewLocations]
        newLocations[existingIndex] = newLocation
      } else {
        newLocations = [...prev.crewLocations, newLocation]
      }

      return {
        ...prev,
        crewLocations: newLocations
      }
    })
  }, [])

  // Mark stop as completed
  const markStopCompleted = useCallback((crewId: string, customerId: string) => {
    setState(prev => {
      const crewCompletedStops = prev.completedStops[crewId] || []
      if (!crewCompletedStops.includes(customerId)) {
        const newCompletedStops = {
          ...prev.completedStops,
          [crewId]: [...crewCompletedStops, customerId]
        }
        return {
          ...prev,
          completedStops: newCompletedStops
        }
      }
      return prev
    })
  }, [])

  // Mark stop as incomplete
  const markStopIncomplete = useCallback((crewId: string, customerId: string) => {
    setState(prev => {
      const crewCompletedStops = prev.completedStops[crewId] || []
      const newCompletedStops = {
        ...prev.completedStops,
        [crewId]: crewCompletedStops.filter(id => id !== customerId)
      }
      return {
        ...prev,
        completedStops: newCompletedStops
      }
    })
  }, [])

  // Get progress for a specific crew
  const getCrewProgress = useCallback((crewId: string): RouteProgress | null => {
    return state.progress[crewId] || null
  }, [state.progress])

  // Get all active crews
  const getActiveCrews = useCallback(() => {
    return Object.values(state.progress).filter(p => p.status === 'in_progress')
  }, [state.progress])

  // Get delayed crews
  const getDelayedCrews = useCallback(() => {
    return Object.values(state.progress).filter(p => p.status === 'delayed')
  }, [state.progress])

  // Get completed routes
  const getCompletedRoutes = useCallback(() => {
    return Object.values(state.progress).filter(p => p.status === 'completed')
  }, [state.progress])

  // Start real-time updates
  const startRealTimeUpdates = useCallback(() => {
    if (!enableRealTime || intervalRef.current) return

    intervalRef.current = setInterval(() => {
      calculateProgress()
    }, updateInterval)
  }, [enableRealTime, updateInterval, calculateProgress])

  // Stop real-time updates
  const stopRealTimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Initialize progress calculation
  useEffect(() => {
    calculateProgress()
  }, [calculateProgress])

  // Start/stop real-time updates based on enableRealTime flag
  useEffect(() => {
    if (enableRealTime) {
      startRealTimeUpdates()
    } else {
      stopRealTimeUpdates()
    }

    return () => {
      stopRealTimeUpdates()
    }
  }, [enableRealTime, startRealTimeUpdates, stopRealTimeUpdates])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRealTimeUpdates()
    }
  }, [stopRealTimeUpdates])

  return {
    // State
    progress: state.progress,
    crewLocations: state.crewLocations,
    completedStops: state.completedStops,
    summary: state.summary,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    updateCrewLocation,
    markStopCompleted,
    markStopIncomplete,
    calculateProgress,
    startRealTimeUpdates,
    stopRealTimeUpdates,

    // Getters
    getCrewProgress,
    getActiveCrews,
    getDelayedCrews,
    getCompletedRoutes
  }
} 
 