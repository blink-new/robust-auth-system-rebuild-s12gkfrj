import { supabase } from '../lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

export interface SessionState {
  session: Session | null
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export class SessionService {
  static async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    } catch (error) {
      console.error('Error getting current session:', error)
      return null
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  static async refreshSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.refreshSession()
      return session
    } catch (error) {
      console.error('Error refreshing session:', error)
      return null
    }
  }

  static onAuthStateChange(callback: (session: Session | null, user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session, session?.user || null)
    })
  }

  static isSessionValid(session: Session | null): boolean {
    if (!session) return false
    
    const now = Math.floor(Date.now() / 1000)
    return session.expires_at ? session.expires_at > now : false
  }

  static isEmailConfirmed(user: User | null): boolean {
    return user?.email_confirmed_at !== null
  }
}