import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export interface AuthRedirectOptions {
  requireAuth?: boolean
  requireEmailConfirmed?: boolean
  requireOnboarding?: boolean
  allowedRoles?: ('admin' | 'user')[]
  redirectTo?: string
}

export function useAuthRedirect(options: AuthRedirectOptions = {}) {
  const {
    requireAuth = false,
    requireEmailConfirmed = false,
    requireOnboarding = false,
    allowedRoles,
    redirectTo
  } = options

  const navigate = useNavigate()
  const location = useLocation()
  const { 
    isLoading, 
    isAuthenticated, 
    isEmailConfirmed, 
    isOnboardingCompleted, 
    role 
  } = useAuth()

  useEffect(() => {
    if (isLoading) return

    // If auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      const returnTo = encodeURIComponent(location.pathname + location.search)
      navigate(`/auth/login?returnTo=${returnTo}`, { replace: true })
      return
    }

    // If user is authenticated but shouldn't be on auth pages
    if (isAuthenticated && location.pathname.startsWith('/auth/')) {
      const urlParams = new URLSearchParams(location.search)
      const returnTo = urlParams.get('returnTo')
      
      if (returnTo) {
        navigate(decodeURIComponent(returnTo), { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
      return
    }

    // If email confirmation is required
    if (requireEmailConfirmed && isAuthenticated && !isEmailConfirmed) {
      navigate('/auth/verify-email', { replace: true })
      return
    }

    // If onboarding is required
    if (requireOnboarding && isAuthenticated && isEmailConfirmed && !isOnboardingCompleted) {
      navigate('/onboarding', { replace: true })
      return
    }

    // If specific roles are required
    if (allowedRoles && isAuthenticated && role && !allowedRoles.includes(role)) {
      navigate('/unauthorized', { replace: true })
      return
    }

    // If a specific redirect is requested
    if (redirectTo && redirectTo !== location.pathname) {
      navigate(redirectTo, { replace: true })
      return
    }
  }, [
    isLoading,
    isAuthenticated,
    isEmailConfirmed,
    isOnboardingCompleted,
    role,
    requireAuth,
    requireEmailConfirmed,
    requireOnboarding,
    allowedRoles,
    redirectTo,
    navigate,
    location
  ])

  return {
    isLoading,
    isAuthenticated,
    isEmailConfirmed,
    isOnboardingCompleted,
    role
  }
}