import getSupabaseClient from '../lib/supabaseClient.js'
import { ensureProfileForAuthUser } from '../services/profileService.js'

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'No token provided' } })
  }

  const token = authHeader.split(' ')[1]
  let supabase
  try {
    supabase = getSupabaseClient()
  } catch (err) {
    return res.status(503).json({ error: { message: 'Auth service unavailable: ' + err.message } })
  }

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: { message: 'Invalid or expired token' } })
  }

  let profile
  try {
    profile = await ensureProfileForAuthUser(supabase, user)
  } catch (profileError) {
    return res.status(401).json({ error: { message: 'User profile not found' } })
  }

  req.user = {
    id: user.id,
    email: user.email,
    name: profile.name,
    role: profile.role,
    must_reset_password: Boolean(user.user_metadata?.must_reset_password),
  }

  req.authUser = user

  next()
}
