"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'

interface RoleBasedRouterProps {
  children: React.ReactNode
}

export function RoleBasedRouter({ children }: RoleBasedRouterProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't redirect while loading or if no user
    if (loading || !user) return

    // Always redirect to main route - role-based functionality is handled in the component
    if (pathname !== '/') {
      router.replace('/')
    }
  }, [user, userProfile, loading, router, pathname])

  // Show loading while determining route
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Don't render children until we have user info
  if (!user) {
    return <>{children}</>
  }

  return <>{children}</>
} 
 