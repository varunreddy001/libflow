import { supabase } from '../lib/supabase'
import type { Profile } from '../types/database'

export interface SignUpData {
  email: string
  password: string
  fullName: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  error?: string
}

/**
 * Auth service - handles all authentication-related Supabase calls
 * Business logic is kept here, not in UI components
 */
export const authService = {
  /**
   * Sign up a new user
   * Profile creation is handled by database trigger (handle_new_user)
   */
  async signUp({ email, password, fullName }: SignUpData): Promise<AuthResult> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  /**
   * Sign in with email and password
   */
  async signIn({ email, password }: SignInData): Promise<AuthResult> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  /**
   * Sign out current user
   */
  async signOut(): Promise<AuthResult> {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return { session: null, error: error.message }
    }

    return { session, error: null }
  },

  /**
   * Fetch user profile from profiles table
   */
  async getProfile(userId: string): Promise<{ profile: Profile | null; error?: string }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      // Profile might not exist yet if trigger hasn't run
      if (error.code === 'PGRST116') {
        return { profile: null }
      }
      return { profile: null, error: error.message }
    }

    return { profile: data }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<Pick<Profile, 'full_name'>>): Promise<AuthResult> {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}

