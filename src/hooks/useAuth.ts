import { useState, useEffect, useCallback } from 'react'
import { SessionService } from '../services/sessionService'
import { UserService } from '../services/userService'
import type { Session, User } from '@supabase/supabase-js'
import type { UserProfile } from '../lib/supabase'

export interface AuthState {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  isEmailConfirmed: boolean
  isOnboardingCompleted: boolean
  role: 'admin' | 'user' | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
    isEmailConfirmed: false,
    isOnboardingCompleted: false,
    role: null
  })

  const updateAuthState = useCallback(async (session: Session | null, user: User | null) => {
    setState(prev => ({ ...prev, isLoading: true }))

    if (!session || !user) {
      setState({
        session: null,
        user: null,
        profile: null,
        isLoading: false,
        isAuthenticated: false,
        isEmailConfirmed: false,
        isOnboardingCompleted: false,
        role: null
      })
      return
    }

    try {
      // Get user profile and additional data
      const [profile, role, isOnboardingCompleted] = await Promise.all([
        UserService.getUserProfile(user.id),
        UserService.getUserRole(user.id),
        UserService.isOnboardingCompleted(user.id)
      ])

      setState({
        session,
        user,
        profile,
        isLoading: false,
        isAuthenticated: true,
        isEmailConfirmed: SessionService.isEmailConfirmed(user),
        isOnboardingCompleted,
        role
      })
    } catch (error) {
      console.error('Error updating auth state:', error)
      setState({
        session,
        user,
        profile: null,
        isLoading: false,
        isAuthenticated: true,
        isEmailConfirmed: SessionService.isEmailConfirmed(user),
        isOnboardingCompleted: false,
        role: null
      })
    }
  }, [])

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const session = await SessionService.getCurrentSession()
        const user = session?.user || null
        await updateAuthState(session, user)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = SessionService.onAuthStateChange(updateAuthState)

    return () => {
      subscription.unsubscribe()
    }
  }, [updateAuthState])

  const refreshProfile = useCallback(async () => {
    if (!state.user) return

    try {
      const [profile, role, isOnboardingCompleted] = await Promise.all([
        UserService.getUserProfile(state.user.id),
        UserService.getUserRole(state.user.id),
        UserService.isOnboardingCompleted(state.user.id)
      ])

      setState(prev => ({
        ...prev,
        profile,
        role,
        isOnboardingCompleted
      }))
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  }, [state.user])

  return {
    ...state,
    refreshProfile
  }
}