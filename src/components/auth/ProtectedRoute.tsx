import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireEmailConfirmed?: boolean
  requireOnboarding?: boolean
  allowedRoles?: ('admin' | 'user')[]
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireEmailConfirmed = false,
  requireOnboarding = false,
  allowedRoles
}: ProtectedRouteProps) {
  const location = useLocation()
  const { 
    isLoading, 
    isAuthenticated, 
    isEmailConfirmed, 
    isOnboardingCompleted, 
    role 
  } = useAuth()

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/auth/login?returnTo=${returnTo}`} replace />
  }

  // Check email confirmation requirement
  if (requireEmailConfirmed && isAuthenticated && !isEmailConfirmed) {
    return <Navigate to="/auth/verify-email" replace />
  }

  // Check onboarding requirement
  if (requireOnboarding && isAuthenticated && isEmailConfirmed && !isOnboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  // Check role-based access
  if (allowedRoles && isAuthenticated && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // If user is authenticated but trying to access auth pages, redirect to dashboard
  if (isAuthenticated && location.pathname.startsWith('/auth/')) {
    const urlParams = new URLSearchParams(location.search)
    const returnTo = urlParams.get('returnTo')
    
    if (returnTo) {
      return <Navigate to={decodeURIComponent(returnTo)} replace />
    } else {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}