import getSupabaseClient from '../lib/supabaseClient.js'
import { computeStatus } from './statusService.js'

export async function getDashboardDataForAdmin() {
  const supabase = getSupabaseClient()

  // Fetch all fields with agent/creator info
  const { data: fields, error: fieldsError } = await supabase
    .from('fields')
    .select(`
      *,
      assigned_agent:profiles!fields_assigned_agent_id_fkey(id, name)
    `)
    .order('created_at', { ascending: false })
  if (fieldsError) throw fieldsError

  // Compute status for each field
  const fieldsWithStatus = fields.map(f => ({ ...f, status: computeStatus(f) }))

  // Totals by stage
  const by_stage = {
    planted: fieldsWithStatus.filter(f => f.stage === 'planted').length,
    growing: fieldsWithStatus.filter(f => f.stage === 'growing').length,
    ready: fieldsWithStatus.filter(f => f.stage === 'ready').length,
    harvested: fieldsWithStatus.filter(f => f.stage === 'harvested').length,
  }

  // Totals by status
  const by_status = {
    active: fieldsWithStatus.filter(f => f.status === 'active').length,
    at_risk: fieldsWithStatus.filter(f => f.status === 'at_risk').length,
    completed: fieldsWithStatus.filter(f => f.status === 'completed').length,
  }

  // Agent overview: count fields and at-risk count per agent
  const agentMap = new Map()
  fieldsWithStatus.forEach(f => {
    if (!f.assigned_agent_id) return
    const agentId = f.assigned_agent_id
    if (!agentMap.has(agentId)) {
      agentMap.set(agentId, {
        id: agentId,
        name: f.assigned_agent?.name || 'Unknown',
        field_count: 0,
        at_risk_count: 0,
      })
    }
    const agent = agentMap.get(agentId)
    agent.field_count += 1
    if (f.status === 'at_risk') agent.at_risk_count += 1
  })
  const agents = Array.from(agentMap.values()).sort((a, b) => b.field_count - a.field_count)

  // At-risk fields (max 5)
  const at_risk_fields = fieldsWithStatus
    .filter(f => f.status === 'at_risk')
    .slice(0, 5)
    .map(f => ({
      id: f.id,
      name: f.name,
      crop_type: f.crop_type,
      stage: f.stage,
      last_updated_at: f.last_updated_at,
      assigned_agent_name: f.assigned_agent?.name || null,
    }))

  // Recent updates (last 10)
  const { data: updates, error: updatesError } = await supabase
    .from('field_updates')
    .select(`
      id,
      field_id,
      fields(name),
      agent_id,
      profiles(name),
      new_stage,
      note,
      created_at
    `)
    .order('created_at', { ascending: false })
    .limit(10)
  if (updatesError) throw updatesError

  const recent_updates = updates.map(u => ({
    field_name: u.fields?.name || 'Unknown',
    agent_name: u.profiles?.name || 'Unknown',
    new_stage: u.new_stage,
    note: u.note,
    created_at: u.created_at,
  }))

  return {
    role: 'admin',
    totals: {
      fields: fieldsWithStatus.length,
      by_stage,
      by_status,
    },
    agents,
    at_risk_fields,
    recent_updates,
  }
}

export async function getDashboardDataForAgent(agentId) {
  const supabase = getSupabaseClient()

  // Fetch only agent's fields
  const { data: fields, error: fieldsError } = await supabase
    .from('fields')
    .select('*')
    .eq('assigned_agent_id', agentId)
    .order('created_at', { ascending: false })
  if (fieldsError) throw fieldsError

  // Compute status
  const fieldsWithStatus = fields.map(f => ({ ...f, status: computeStatus(f) }))

  // Totals
  const by_stage = {
    planted: fieldsWithStatus.filter(f => f.stage === 'planted').length,
    growing: fieldsWithStatus.filter(f => f.stage === 'growing').length,
    ready: fieldsWithStatus.filter(f => f.stage === 'ready').length,
    harvested: fieldsWithStatus.filter(f => f.stage === 'harvested').length,
  }

  const by_status = {
    active: fieldsWithStatus.filter(f => f.status === 'active').length,
    at_risk: fieldsWithStatus.filter(f => f.status === 'at_risk').length,
    completed: fieldsWithStatus.filter(f => f.status === 'completed').length,
  }

  // My fields with minimal info
  const my_fields = fieldsWithStatus.map(f => ({
    id: f.id,
    name: f.name,
    crop_type: f.crop_type,
    stage: f.stage,
    status: f.status,
    last_updated_at: f.last_updated_at,
  }))

  // Recent updates (last 5) for this agent's fields
  const { data: updates, error: updatesError } = await supabase
    .from('field_updates')
    .select(`
      id,
      field_id,
      fields(name),
      new_stage,
      note,
      created_at
    `)
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(5)
  if (updatesError) throw updatesError

  const recent_updates = updates.map(u => ({
    field_name: u.fields?.name || 'Unknown',
    new_stage: u.new_stage,
    note: u.note,
    created_at: u.created_at,
  }))

  return {
    role: 'agent',
    totals: {
      fields: fieldsWithStatus.length,
      by_stage,
      by_status,
    },
    my_fields,
    recent_updates,
  }
}
