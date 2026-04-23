import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

let serviceClient = null
let authClient = null

function getSupabaseUrl() {
  const supabaseUrl = process.env.SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL must be set in .env.')
  }
  return supabaseUrl
}

function getServiceKey() {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

  if (!supabaseServiceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) must be set in .env. ' +
      'Copy .env.example to .env and populate with your Supabase credentials.'
    )
  }

  if (supabaseServiceRoleKey.startsWith('sb_publishable_')) {
    throw new Error(
      'Invalid Supabase server key: publishable key detected. ' +
      'Use the Secret/Service Role key for backend SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  return supabaseServiceRoleKey
}

function getAnonKey() {
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
  if (!supabaseAnonKey) {
    throw new Error('SUPABASE_ANON_KEY must be set in .env for password login.')
  }
  return supabaseAnonKey
}

export function getSupabaseServiceClient() {
  if (serviceClient) return serviceClient

  const supabaseUrl = getSupabaseUrl()
  const supabaseServiceRoleKey = getServiceKey()

  serviceClient = createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  return serviceClient
}

export function getSupabaseAuthClient() {
  if (authClient) return authClient

  const supabaseUrl = getSupabaseUrl()
  const supabaseAnonKey = getAnonKey()

  authClient = createClient(
    supabaseUrl,
    supabaseAnonKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  return authClient
}

function getSupabaseClient() {
  return getSupabaseServiceClient()
}

export default getSupabaseClient
