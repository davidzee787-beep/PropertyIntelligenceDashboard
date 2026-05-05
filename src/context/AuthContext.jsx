import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes (login, logout, OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        setProfile(data)
        return
      }

      // Profile missing or RLS blocked read — upsert it
      const profileData = {
        id:         userId,
        email:      user?.email || '',
        full_name:  user?.user_metadata?.full_name || user?.user_metadata?.name || '',
        avatar_url: user?.user_metadata?.avatar_url || '',
        role:       user?.user_metadata?.role || 'owner',
      }

      const { data: upserted } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single()

      // If DB upsert succeeded use it; otherwise fall back to in-memory profile
      // so the app works even if the profiles table has restrictive RLS
      setProfile(upserted || profileData)
    } catch (e) {
      console.error('fetchProfile error', e)
      // Last resort: build a minimal profile from auth state so app doesn't break
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (user) {
        setProfile({
          id:        user.id,
          email:     user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          role:      user.user_metadata?.role || 'owner',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) setProfile(data)
  }

  const signOut = () => supabase.auth.signOut()

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

  const signInWithEmail = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signUpWithEmail = async (email, password, fullName, role = 'owner') => {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    })
    if (result.error) return { ...result, needsConfirmation: false }

    // If no session returned, Supabase requires email confirmation.
    // Try signing in immediately — succeeds if "Confirm email" is disabled in Supabase Auth settings.
    if (!result.data?.session) {
      const signInResult = await supabase.auth.signInWithPassword({ email, password })
      if (!signInResult.error) return { ...signInResult, needsConfirmation: false }
      return { ...result, needsConfirmation: true }
    }
    return { ...result, needsConfirmation: false }
  }

  const resetPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

  return (
    <AuthContext.Provider value={{
      session, profile, loading,
      signOut, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
