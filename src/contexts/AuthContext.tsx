import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { authService } from '../services/auth'
import { useToast } from './ToastContext'
import type { Profile } from '../types/database'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<boolean>
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  isAdmin: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  const fetchProfile = useCallback(async (userId: string) => {
    const { profile, error } = await authService.getProfile(userId)
    
    if (error) {
      // Don't show error toast for missing profile - it may be creating
      console.error('Error fetching profile:', error)
    }
    
    return profile
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profile = await fetchProfile(user.id)
      setProfile(profile)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Fetch profile with retry for new users (trigger may not have run yet)
          let profile = await fetchProfile(session.user.id)
          
          // Retry once if profile doesn't exist (give trigger time to execute)
          if (!profile) {
            await new Promise(resolve => setTimeout(resolve, 500))
            profile = await fetchProfile(session.user.id)
          }
          
          if (mounted) {
            setProfile(profile)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Small delay for new signups to let the trigger create the profile
          if (event === 'SIGNED_IN') {
            await new Promise(resolve => setTimeout(resolve, 300))
          }
          
          const profile = await fetchProfile(session.user.id)
          if (mounted) {
            setProfile(profile)
          }
        } else {
          setProfile(null)
        }

        // Show appropriate toast messages
        if (event === 'SIGNED_IN') {
          addToast('Welcome back!', 'success')
        } else if (event === 'SIGNED_OUT') {
          addToast('Signed out successfully', 'info')
        } else if (event === 'PASSWORD_RECOVERY') {
          addToast('Check your email for password reset instructions', 'info')
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [addToast, fetchProfile])

  const signUp = useCallback(async (email: string, password: string, fullName: string): Promise<boolean> => {
    const result = await authService.signUp({ email, password, fullName })

    if (!result.success) {
      addToast(result.error || 'Failed to create account', 'error')
      return false
    }

    addToast('Account created! Please check your email to verify your account.', 'success')
    return true
  }, [addToast])

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    const result = await authService.signIn({ email, password })

    if (!result.success) {
      addToast(result.error || 'Failed to sign in', 'error')
      return false
    }

    return true
  }, [addToast])

  const signOut = useCallback(async () => {
    const result = await authService.signOut()

    if (!result.success) {
      addToast(result.error || 'Failed to sign out', 'error')
    }
  }, [addToast])

  const isAdmin = profile?.role === 'admin'
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        isAdmin,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to access auth context
 * Must be used within an AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
