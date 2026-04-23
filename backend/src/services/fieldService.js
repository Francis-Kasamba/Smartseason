import getSupabaseClient from '../lib/supabaseClient.js'

// ─── Helpers ────────────────────────────────────────────────────────────────

const STAGE_ORDER = ['planted', 'growing', 'ready', 'harvested']

function nextStage(current) {
  const idx = STAGE_ORDER.indexOf(current)
  return idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : null
}

function buildFieldQuery(supabase) {
  return supabase
    .from('fields')
    .select(`
      *,
      assigned_agent:profiles!fields_assigned_agent_id_fkey(id, name),
      creator:profiles!fields_created_by_fkey(id, name)
    `)
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getAllFields() {
  const supabase = getSupabaseClient()
  const { data, error } = await buildFieldQuery(supabase).order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getFieldsForAgent(agentId) {
  const supabase = getSupabaseClient()
  const { data, error } = await buildFieldQuery(supabase)
    .eq('assigned_agent_id', agentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getFieldById(fieldId) {
  const supabase = getSupabaseClient()
  const { data, error } = await buildFieldQuery(supabase).eq('id', fieldId).single()
  if (error) throw error
  return data
}

export async function getFieldUpdates(fieldId) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('field_updates')
    .select(`
      *,
      agent:profiles!field_updates_agent_id_fkey(id, name)
    `)
    .eq('field_id', fieldId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function createField({ name, crop_type, planting_date, stage = 'planted', assigned_agent_id, created_by }) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('fields')
    .insert({ name, crop_type, planting_date, stage, assigned_agent_id: assigned_agent_id || null, created_by })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateField(fieldId, { name, crop_type, planting_date, assigned_agent_id }) {
  const supabase = getSupabaseClient()
  const updates = { last_updated_at: new Date().toISOString() }
  if (name !== undefined) updates.name = name
  if (crop_type !== undefined) updates.crop_type = crop_type
  if (planting_date !== undefined) updates.planting_date = planting_date
  if (assigned_agent_id !== undefined) updates.assigned_agent_id = assigned_agent_id || null

  const { data, error } = await supabase
    .from('fields')
    .update(updates)
    .eq('id', fieldId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteField(fieldId) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('fields').delete().eq('id', fieldId)
  if (error) throw error
}

export async function advanceStage(fieldId, agentId, newStage, note) {
  const supabase = getSupabaseClient()
  // Fetch current field to validate stage order
  const { data: field, error: fetchError } = await supabase
    .from('fields')
    .select('stage')
    .eq('id', fieldId)
    .single()
  if (fetchError) throw fetchError

  const expected = nextStage(field.stage)
  if (newStage !== expected) {
    const err = new Error(
      expected
        ? `Invalid stage transition. Current: ${field.stage}. Next allowed: ${expected}`
        : 'Field is already harvested'
    )
    err.statusCode = 400
    throw err
  }

  // Update stage and timestamp
  const { data: updatedField, error: updateError } = await supabase
    .from('fields')
    .update({ stage: newStage, last_updated_at: new Date().toISOString() })
    .eq('id', fieldId)
    .select()
    .single()
  if (updateError) throw updateError

  // Insert activity log entry
  await supabase.from('field_updates').insert({
    field_id: fieldId,
    agent_id: agentId,
    new_stage: newStage,
    note: note || null,
  })

  return updatedField
}

export async function adminSetStage(fieldId, actorId, newStage, note) {
  const supabase = getSupabaseClient()
  if (!STAGE_ORDER.includes(newStage)) {
    const err = new Error(`Invalid stage: ${newStage}`)
    err.statusCode = 400
    throw err
  }

  const { data: updatedField, error } = await supabase
    .from('fields')
    .update({ stage: newStage, last_updated_at: new Date().toISOString() })
    .eq('id', fieldId)
    .select()
    .single()
  if (error) throw error

  await supabase.from('field_updates').insert({
    field_id: fieldId,
    agent_id: actorId,
    new_stage: newStage,
    note: note || null,
  })

  return updatedField
}

export async function addNote(fieldId, agentId, note) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('field_updates')
    .insert({ field_id: fieldId, agent_id: agentId, note, new_stage: null })
    .select()
    .single()
  if (error) throw error

  await supabase
    .from('fields')
    .update({ last_updated_at: new Date().toISOString() })
    .eq('id', fieldId)

  return data
}

export async function updateNote(fieldId, updateId, note) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('field_updates')
    .update({ note })
    .eq('id', updateId)
    .eq('field_id', fieldId)
    .select(`
      *,
      agent:profiles!field_updates_agent_id_fkey(id, name)
    `)
    .single()

  if (error) throw error

  await supabase
    .from('fields')
    .update({ last_updated_at: new Date().toISOString() })
    .eq('id', fieldId)

  return data
}
