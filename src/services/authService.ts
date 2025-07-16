import { supabase } from '../lib/supabase'
import type { AuthError, User } from '@supabase/supabase-js'

export interface SignUpData {
  email: string
  password: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResponse {
  user: User | null
  error: AuthError | null
}

export class AuthService {
  static async signUp({ email, password }: SignUpData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { user: null, error }
      }

      // If this is the first user, make them admin
      if (data.user) {
        await this.checkAndSetFirstUserAsAdmin(data.user.id)
      }

      return { user: data.user, error: null }
    } catch (error) {
      return { 
        user: null, 
        error: { 
          message: 'An unexpected error occurred during sign up',
          name: 'UnexpectedError'
        } as AuthError 
      }
    }
  }

  static async signIn({ email, password }: SignInData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { user: null, error }
      }

      return { user: data.user, error: null }
    } catch (error) {
      return { 
        user: null, 
        error: { 
          message: 'An unexpected error occurred during sign in',
          name: 'UnexpectedError'
        } as AuthError 
      }
    }
  }

  static async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { 
        error: { 
          message: 'An unexpected error occurred during sign out',
          name: 'UnexpectedError'
        } as AuthError 
      }
    }
  }

  static async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      return { error }
    } catch (error) {
      return { 
        error: { 
          message: 'An unexpected error occurred during password reset',
          name: 'UnexpectedError'
        } as AuthError 
      }
    }
  }

  static async resendConfirmation(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { error }
    } catch (error) {
      return { 
        error: { 
          message: 'An unexpected error occurred while resending confirmation',
          name: 'UnexpectedError'
        } as AuthError 
      }
    }
  }

  private static async checkAndSetFirstUserAsAdmin(userId: string): Promise<void> {
    try {
      // Check if this is the first user
      const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      if (count === 0) {
        // This is the first user, make them admin
        await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            role: 'admin',
            onboarding_completed: false
          })
      } else {
        // Regular user
        await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            role: 'user',
            onboarding_completed: false
          })
      }
    } catch (error) {
      console.error('Error setting user role:', error)
    }
  }
}