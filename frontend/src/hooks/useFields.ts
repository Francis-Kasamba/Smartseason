import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Field {
  id: string
  name: string
  crop_type: string
  planting_date: string
  stage: 'planted' | 'growing' | 'ready' | 'harvested'
  status: 'active' | 'at_risk' | 'completed'
  assigned_agent_id: string | null
  assigned_agent: { id: string; name: string } | null
  created_by: string
  last_updated_at: string
  created_at: string
}

export interface FieldUpdate {
  id: string
  field_id: string
  agent_id: string
  agent: { id: string; name: string }
  new_stage: string | null
  note: string | null
  created_at: string
}

export interface Agent {
  id: string
  name: string
  role: 'admin' | 'agent'
  created_at?: string
  email?: string | null
}

export interface CreateAgentResponse {
  user: Agent
  message?: string
  invite_sent: boolean
  email_notice?: string | null
}

export interface DashboardAdmin {
  role: 'admin'
  totals: {
    fields: number
    by_stage: { planted: number; growing: number; ready: number; harvested: number }
    by_status: { active: number; at_risk: number; completed: number }
  }
  agents: Array<{ id: string; name: string; field_count: number; at_risk_count: number }>
  at_risk_fields: Array<{
    id: string
    name: string
    crop_type: string
    stage: string
    last_updated_at: string
    assigned_agent_name: string | null
  }>
  recent_updates: Array<{
    field_name: string
    agent_name: string
    new_stage: string | null
    note: string | null
    created_at: string
  }>
}

export interface DashboardAgent {
  role: 'agent'
  totals: {
    fields: number
    by_stage: { planted: number; growing: number; ready: number; harvested: number }
    by_status: { active: number; at_risk: number; completed: number }
  }
  my_fields: Array<{
    id: string
    name: string
    crop_type: string
    stage: string
    status: 'active' | 'at_risk' | 'completed'
    last_updated_at: string
  }>
  recent_updates: Array<{
    field_name: string
    new_stage: string | null
    note: string | null
    created_at: string
  }>
}

export type Dashboard = DashboardAdmin | DashboardAgent

// ─── Query hooks ─────────────────────────────────────────────────────────────

export function useFields() {
  return useQuery({
    queryKey: ['fields'],
    queryFn: async () => {
      const res = await api.get('/api/fields')
      return res.data.fields as Field[]
    },
  })
}

export function useField(id: string) {
  return useQuery({
    queryKey: ['fields', id],
    queryFn: async () => {
      const res = await api.get(`/api/fields/${id}`)
      return res.data.field as Field
    },
    enabled: !!id,
  })
}

export function useFieldUpdates(id: string) {
  return useQuery({
    queryKey: ['fields', id, 'updates'],
    queryFn: async () => {
      const res = await api.get(`/api/fields/${id}/updates`)
      return res.data.updates as FieldUpdate[]
    },
    enabled: !!id,
  })
}

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await api.get('/api/users')
      return res.data.users as Agent[]
    },
  })
}

export function useCreateAgent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      api.post('/api/users', data).then(r => r.data as CreateAgentResponse),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agents'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateAgent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; email?: string; password?: string }) =>
      api.put(`/api/users/${id}`, data).then(r => r.data.user as Agent),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agents'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteAgent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agents'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['fields'] })
    },
  })
}

// ─── Mutation hooks ───────────────────────────────────────────────────────────

export function useCreateField() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Field>) => api.post('/api/fields', data).then(r => r.data.field),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fields'] }),
  })
}

export function useUpdateField() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Field> & { id: string }) =>
      api.put(`/api/fields/${id}`, data).then(r => r.data.field),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['fields'] })
      qc.invalidateQueries({ queryKey: ['fields', vars.id] })
    },
  })
}

export function useDeleteField() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/fields/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fields'] }),
  })
}

export function useAdvanceStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, new_stage, note }: { id: string; new_stage: string; note?: string }) =>
      api.patch(`/api/fields/${id}/stage`, { new_stage, note }).then(r => r.data.field),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['fields'] })
      qc.invalidateQueries({ queryKey: ['fields', vars.id] })
      qc.invalidateQueries({ queryKey: ['fields', vars.id, 'updates'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useAddNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      api.post(`/api/fields/${id}/updates`, { note }).then(r => r.data.update),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['fields', vars.id, 'updates'] })
      qc.invalidateQueries({ queryKey: ['fields', vars.id] })
    },
  })
}

export function useUpdateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updateId, note }: { id: string; updateId: string; note: string }) =>
      api.patch(`/api/fields/${id}/updates/${updateId}`, { note }).then(r => r.data.update as FieldUpdate),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['fields', vars.id, 'updates'] })
      qc.invalidateQueries({ queryKey: ['fields', vars.id] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/api/dashboard')
      return res.data as Dashboard
    },
  })
}
