import getSupabaseClient from '../lib/supabaseClient.js'
import { catchAsync } from '../middleware/errorHandler.js'
import { ensureProfileForAuthUser } from '../services/profileService.js'
import { sendAgentWelcomeEmail } from '../services/mailService.js'

export const listAgents = catchAsync(async (req, res) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, role, created_at')
    .eq('role', 'agent')
    .order('name')
  if (error) throw error

  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (usersError) throw usersError

  const authById = new Map((usersData?.users || []).map((u) => [u.id, u]))
  const enriched = data.map((agent) => ({
    ...agent,
    email: authById.get(agent.id)?.email || null,
  }))

  res.json({ users: enriched })
})

export const createAgent = catchAsync(async (req, res) => {
  const supabase = getSupabaseClient()
  const { name, email, password } = req.body
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!name || !email || !password) {
    return res.status(400).json({ error: { message: 'name, email, and password are required' } })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: { message: 'Password must be at least 6 characters' } })
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: { name, role: 'agent', must_reset_password: true },
  })

  if (error) {
    if (error.message.includes('already')) {
      // Recover existing auth user and make sure profile exists with agent role.
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
      if (usersError) throw usersError

      const existing = (usersData?.users || []).find(
        (u) => u.email?.toLowerCase() === normalizedEmail
      )

      if (!existing) {
        return res.status(409).json({ error: { message: 'A user with this email already exists' } })
      }

      const { data: updatedUserData, error: updateUserError } = await supabase.auth.admin.updateUserById(existing.id, {
        password,
        user_metadata: {
          ...(existing.user_metadata || {}),
          name,
          role: 'agent',
          must_reset_password: true,
        },
      })

      if (updateUserError) throw updateUserError

      const profile = await ensureProfileForAuthUser(supabase, {
        ...(updatedUserData?.user || existing),
        user_metadata: { ...(existing.user_metadata || {}), name, role: 'agent' },
      })

      if (profile.role !== 'agent') {
        return res.status(409).json({ error: { message: 'This email belongs to a non-agent account' } })
      }

      let inviteResult
      try {
        inviteResult = await sendAgentWelcomeEmail({
          name,
          email: normalizedEmail,
          password,
        })
      } catch (mailError) {
        inviteResult = {
          sent: false,
          reason: 'Agent synced, but invitation email could not be sent',
        }
      }

      return res.status(200).json({
        user: profile,
        message: 'Agent already existed and was synced',
        invite_sent: inviteResult.sent,
        email_notice: inviteResult.sent ? null : inviteResult.reason,
      })
    }
    throw error
  }

  const profile = await ensureProfileForAuthUser(supabase, {
    ...data.user,
    user_metadata: { ...(data.user.user_metadata || {}), name, role: 'agent' },
  })

  let emailNotice = null
  let inviteSent = true
  try {
    const mailResult = await sendAgentWelcomeEmail({
      name,
      email: normalizedEmail,
      password,
    })
    inviteSent = mailResult.sent
    if (!mailResult.sent) {
      emailNotice = mailResult.reason
    }
  } catch (mailError) {
    inviteSent = false
    emailNotice = 'Agent created, but welcome email could not be sent'
  }

  res.status(201).json({ user: profile, invite_sent: inviteSent, email_notice: emailNotice })
})

export const updateAgent = catchAsync(async (req, res) => {
  const supabase = getSupabaseClient()
  const { id } = req.params
  const { name, email, password } = req.body

  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : undefined

  if (!name && !normalizedEmail && !password) {
    return res.status(400).json({ error: { message: 'Provide at least one field to update' } })
  }

  if (password && password.length < 6) {
    return res.status(400).json({ error: { message: 'Password must be at least 6 characters' } })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', id)
    .single()

  if (profileError || !profile) {
    return res.status(404).json({ error: { message: 'Agent not found' } })
  }

  if (profile.role !== 'agent') {
    return res.status(409).json({ error: { message: 'Only agent accounts can be updated here' } })
  }

  const { data: authUserData, error: authUserError } = await supabase.auth.admin.getUserById(id)
  if (authUserError || !authUserData?.user) {
    return res.status(404).json({ error: { message: 'Auth user not found' } })
  }

  const currentUser = authUserData.user
  const updatePayload = {
    user_metadata: {
      ...(currentUser.user_metadata || {}),
      ...(name ? { name } : {}),
      role: 'agent',
      ...(password ? { must_reset_password: true } : {}),
    },
    ...(normalizedEmail ? { email: normalizedEmail } : {}),
    ...(password ? { password } : {}),
  }

  const { data: updatedAuth, error: updateError } = await supabase.auth.admin.updateUserById(id, updatePayload)
  if (updateError) {
    if (updateError.message?.toLowerCase().includes('already')) {
      return res.status(409).json({ error: { message: 'A user with this email already exists' } })
    }
    throw updateError
  }

  const updatedProfile = await ensureProfileForAuthUser(supabase, {
    ...(updatedAuth?.user || currentUser),
    user_metadata: updatePayload.user_metadata,
  })

  res.json({
    user: {
      ...updatedProfile,
      email: (updatedAuth?.user || currentUser).email || null,
    },
  })
})

export const deleteAgent = catchAsync(async (req, res) => {
  const supabase = getSupabaseClient()
  const { id } = req.params

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', id)
    .single()

  if (profileError || !profile) {
    return res.status(404).json({ error: { message: 'Agent not found' } })
  }

  if (profile.role !== 'agent') {
    return res.status(409).json({ error: { message: 'Only agent accounts can be deleted here' } })
  }

  const { error } = await supabase.auth.admin.deleteUser(id)
  if (error) throw error

  res.json({ message: 'Agent deleted successfully' })
})
