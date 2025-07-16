import { useCallback } from 'react'
import { toast } from 'react-hot-toast'
import type { AuthError } from '@supabase/supabase-js'

export interface AuthErrorHandler {
  handleAuthError: (error: AuthError | null, context?: string) => void
  getErrorMessage: (error: AuthError | null) => string
}

export function useAuthErrors(): AuthErrorHandler {
  const getErrorMessage = useCallback((error: AuthError | null): string => {
    if (!error) return 'An unknown error occurred'

    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please check your credentials and try again.'
      case 'Email not confirmed':
        return 'Please check your email and click the confirmation link before signing in.'
      case 'User already registered':
        return 'An account with this email already exists. Please sign in instead.'
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long.'
      case 'Unable to validate email address: invalid format':
        return 'Please enter a valid email address.'
      case 'Email rate limit exceeded':
        return 'Too many emails sent. Please wait a few minutes before trying again.'
      case 'Signup is disabled':
        return 'New account registration is currently disabled.'
      case 'Invalid email or password':
        return 'Invalid email or password. Please check your credentials and try again.'
      case 'Too many requests':
        return 'Too many login attempts. Please wait a few minutes before trying again.'
      case 'Network request failed':
        return 'Network error. Please check your connection and try again.'
      case 'Failed to fetch':
        return 'Connection error. Please check your internet connection and try again.'
      default:
        // Handle specific error patterns
        if (error.message.includes('rate limit')) {
          return 'Too many requests. Please wait a few minutes before trying again.'
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return 'Connection error. Please check your internet connection and try again.'
        }
        if (error.message.includes('password')) {
          return 'Password requirements not met. Please ensure your password is at least 6 characters long.'
        }
        if (error.message.includes('email')) {
          return 'Email address issue. Please check your email format and try again.'
        }
        
        return error.message || 'An unexpected error occurred. Please try again.'
    }
  }, [])

  const handleAuthError = useCallback((error: AuthError | null, context?: string) => {
    if (!error) return

    const message = getErrorMessage(error)
    const contextMessage = context ? `${context}: ${message}` : message

    toast.error(contextMessage, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#fee2e2',
        color: '#dc2626',
        border: '1px solid #fecaca'
      }
    })

    // Log error for debugging
    console.error('Auth Error:', {
      context,
      error: error.message,
      name: error.name,
      status: (error as any).status
    })
  }, [getErrorMessage])

  return {
    handleAuthError,
    getErrorMessage
  }
}