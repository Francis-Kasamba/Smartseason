import { getSupabaseAuthClient, getSupabaseServiceClient } from '../lib/supabaseClient.js'
import { catchAsync } from '../middleware/errorHandler.js'
import { ensureProfileForAuthUser } from '../services/profileService.js'

export const login = catchAsync(async (req, res) => {
  let authSupabase
  let serviceSupabase
  try {
    authSupabase = getSupabaseAuthClient()
    serviceSupabase = getSupabaseServiceClient()
  } catch (err) {
    return res.status(503).json({ error: { message: 'Auth service unavailable: ' + err.message } })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: { message: 'Email and password are required' } })
  }

  const { data, error } = await authSupabase.auth.signInWithPassword({ email, password })

  if (error) {
    const msg = (error.message || '').toLowerCase()
    if (msg.includes('invalid login credentials')) {
      return res.status(401).json({ error: { message: 'Invalid email or password' } })
    }
    if (msg.includes('email not confirmed')) {
      return res.status(401).json({ error: { message: 'Email not confirmed. Confirm the user in Supabase Auth, then sign in again.' } })
    }
    return res.status(401).json({ error: { message: error.message } })
  }

  const profile = await ensureProfileForAuthUser(serviceSupabase, data.user)

  res.json({
    token: data.session.access_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      name: profile.name,
      role: profile.role,
      must_reset_password: Boolean(data.user.user_metadata?.must_reset_password),
    },
  })
})

export const resetPasswordFirstLogin = catchAsync(async (req, res) => {
  const { current_password, new_password } = req.body

  if (!current_password || !new_password) {
    return res.status(400).json({ error: { message: 'current_password and new_password are required' } })
  }

  if (new_password.length < 6) {
    return res.status(400).json({ error: { message: 'New password must be at least 6 characters' } })
  }

  if (!req.user?.must_reset_password) {
    return res.status(400).json({ error: { message: 'Password reset is not required for this account' } })
  }

  let authSupabase
  let serviceSupabase
  try {
    authSupabase = getSupabaseAuthClient()
    serviceSupabase = getSupabaseServiceClient()
  } catch (err) {
    return res.status(503).json({ error: { message: 'Auth service unavailable: ' + err.message } })
  }

  const { error: verifyError } = await authSupabase.auth.signInWithPassword({
    email: req.user.email,
    password: current_password,
  })

  if (verifyError) {
    return res.status(401).json({ error: { message: 'Current password is incorrect' } })
  }

  const updatedMetadata = {
    ...(req.authUser?.user_metadata || {}),
    must_reset_password: false,
  }

  const { error: updateError } = await serviceSupabase.auth.admin.updateUserById(req.user.id, {
    password: new_password,
    user_metadata: updatedMetadata,
  })

  if (updateError) {
    return res.status(400).json({ error: { message: updateError.message } })
  }

  res.json({
    message: 'Password reset successful',
    must_reset_password: false,
  })
})

export const logout = catchAsync(async (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

export const me = catchAsync(async (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
    must_reset_password: req.user.must_reset_password,
  })
})
