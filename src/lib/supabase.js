import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn('Supabase env vars not set. Create a .env file from .env.example')
}

export const SUPABASE_URL     = url  || 'https://placeholder.supabase.co'
export const SUPABASE_ANON_KEY = key || 'placeholder'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
