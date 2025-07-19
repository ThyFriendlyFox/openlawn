"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Navigation,
  Timer,
  RefreshCw
} from "lucide-react"
import type { RouteProgress } from "@/lib/route-progress-service"

interface RouteProgressDashboardProps {
  summary: {
    totalCrews: number
    activeCrews: number
    completedRoutes: number
    averageProgress: number
    delayedCrews: number
    onTimeCrews: number
  }
  progress: Record<string, RouteProgress>
  isLoading?: boolean
  lastUpdated?: Date
  onRefresh?: () => void
}

export function RouteProgressDashboard({
  summary,
  progress,
  isLoading = false,
  lastUpdated,
  onRefresh
}: RouteProgressDashboardProps) {
  const progressArray = Object.values(progress)
  
  // Calculate additional metrics
  const totalDistance = progressArray.reduce((sum, p) => sum + p.distanceTraveled, 0)
  const totalTime = progressArray.reduce((sum, p) => sum + p.timeElapsed, 0)
  const averageTimePerStop = progressArray.length > 0 ? 
    progressArray.reduce((sum, p) => sum + p.averageTimePerStop, 0) / progressArray.length : 0
  
  // Format metrics
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDistance = (meters: number) => {
    const km = meters / 1000
    return km >= 1 ? `${km.toFixed(1)} km` : `${Math.round(meters)} m`
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    if (percentage >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Route Progress Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time tracking of all crew routes and performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Crews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Crews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCrews}</div>
            <p className="text-xs text-muted-foreground">
              {summary.activeCrews} active, {summary.completedRoutes} completed
            </p>
          </CardContent>
        </Card>

        {/* Average Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getProgressColor(summary.averageProgress)}`}>
              {summary.averageProgress}%
            </div>
            <Progress value={summary.averageProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>

        {/* On Time Crews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Schedule</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.onTimeCrews}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalCrews > 0 ? Math.round((summary.onTimeCrews / summary.totalCrews) * 100) : 0}% of crews
            </p>
          </CardContent>
        </Card>

        {/* Delayed Crews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.delayedCrews}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalCrews > 0 ? Math.round((summary.delayedCrews / summary.totalCrews) * 100) : 0}% of crews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distance Traveled</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDistance(totalDistance)}</div>
            <p className="text-xs text-muted-foreground">
              Across all active routes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time Elapsed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalTime)}</div>
            <p className="text-xs text-muted-foreground">
              Combined work time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time per Stop</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(averageTimePerStop)}</div>
            <p className="text-xs text-muted-foreground">
              Across all crews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Crew Progress List */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Crew Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressArray.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active routes found
              </div>
            ) : (
              progressArray.map((crewProgress) => (
                <div key={crewProgress.crewId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">Crew {crewProgress.crewId}</h3>
                      <Badge 
                        variant={
                          crewProgress.status === 'completed' ? 'default' :
                          crewProgress.status === 'delayed' ? 'destructive' :
                          crewProgress.status === 'in_progress' ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {crewProgress.status.replace('_', ' ')}
                      </Badge>
                      {crewProgress.isOnSchedule && crewProgress.status === 'in_progress' && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          On Schedule
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="ml-2 font-medium">{crewProgress.progressPercentage}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Stops:</span>
                        <span className="ml-2 font-medium">{crewProgress.stopsCompleted}/{crewProgress.totalStops}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Distance:</span>
                        <span className="ml-2 font-medium">{formatDistance(crewProgress.distanceTraveled)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time:</span>
                        <span className="ml-2 font-medium">{formatTime(crewProgress.timeElapsed)}</span>
                      </div>
                    </div>

                    {crewProgress.currentStop && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Current: {crewProgress.currentStop.customerName}
                      </div>
                    )}

                    {crewProgress.delayMinutes > 0 && (
                      <div className="mt-1 text-sm text-red-600">
                        {formatTime(crewProgress.delayMinutes)} behind schedule
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <Progress 
                      value={crewProgress.progressPercentage} 
                      className="w-20 h-2" 
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 