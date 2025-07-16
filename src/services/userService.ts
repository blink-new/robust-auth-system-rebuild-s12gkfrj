import { supabase } from '../lib/supabase'
import type { UserProfile } from '../lib/supabase'

export interface UpdateProfileData {
  display_name?: string
  avatar_url?: string
}

export class UserService {
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  static async updateProfile(userId: string, updates: UpdateProfileData): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      return null
    }
  }

  static async completeOnboarding(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) {
        console.error('Error completing onboarding:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error completing onboarding:', error)
      return false
    }
  }

  static async getUserRole(userId: string): Promise<'admin' | 'user' | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        return null
      }

      return data.role
    } catch (error) {
      console.error('Error fetching user role:', error)
      return null
    }
  }

  static async isOnboardingCompleted(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error checking onboarding status:', error)
        return false
      }

      return data.onboarding_completed || false
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      return false
    }
  }
}