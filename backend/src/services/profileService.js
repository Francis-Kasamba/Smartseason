function normalizeRole(role) {
  return role === 'admin' || role === 'agent' ? role : 'agent'
}

function resolveRoleFromUser(user) {
  const email = String(user?.email || '').toLowerCase()
  if (email === 'admin@smartseason.com') return 'admin'

  return normalizeRole(user?.user_metadata?.role || user?.raw_user_meta_data?.role)
}

function fallbackName(user) {
  const metaName = user?.user_metadata?.name || user?.raw_user_meta_data?.name
  if (metaName && String(metaName).trim()) return String(metaName).trim()
  if (user?.email) return String(user.email).split('@')[0]
  return 'User'
}

export async function ensureProfileForAuthUser(supabase, user) {
  // Fetch existing profile first to avoid overwriting admin-managed values.
  const { data: existing, error: fetchError } = await supabase
    .from('profiles')
    .select('id, name, role')
    .eq('id', user.id)
    .maybeSingle()

  if (fetchError) throw fetchError

  if (existing) {
    const expectedRole = resolveRoleFromUser(user)

    if (existing.role !== expectedRole) {
      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({ role: expectedRole })
        .eq('id', user.id)
        .select('id, name, role')
        .single()

      if (updateError) throw updateError

      return {
        id: updated.id,
        name: updated.name || fallbackName(user),
        role: normalizeRole(updated.role),
      }
    }

    return {
      id: existing.id,
      name: existing.name || fallbackName(user),
      role: normalizeRole(existing.role),
    }
  }

  const profilePayload = {
    id: user.id,
    name: fallbackName(user),
    role: resolveRoleFromUser(user),
  }

  const { data: inserted, error: insertError } = await supabase
    .from('profiles')
    .insert(profilePayload)
    .select('id, name, role')
    .single()

  if (insertError) throw insertError

  return {
    id: inserted.id,
    name: inserted.name,
    role: normalizeRole(inserted.role),
  }
}
