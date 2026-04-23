import { catchAsync } from '../middleware/errorHandler.js'
import {
  getAllFields, getFieldsForAgent, getFieldById,
  createField, updateField, deleteField,
  advanceStage, adminSetStage, addNote, getFieldUpdates, updateNote,
} from '../services/fieldService.js'
import { withStatus } from '../services/statusService.js'

// ─── Guard helpers ────────────────────────────────────────────────────────────

async function assertFieldAccess(fieldId, user) {
  const field = await getFieldById(fieldId)
  if (!field) {
    const err = new Error('Field not found')
    err.statusCode = 404
    throw err
  }
  if (user.role === 'agent' && field.assigned_agent_id !== user.id) {
    const err = new Error('You do not have access to this field')
    err.statusCode = 403
    throw err
  }
  return field
}

// ─── Handlers ────────────────────────────────────────────────────────────────

export const listFields = catchAsync(async (req, res) => {
  const fields = req.user.role === 'admin'
    ? await getAllFields()
    : await getFieldsForAgent(req.user.id)
  res.json({ fields: withStatus(fields) })
})

export const createFieldHandler = catchAsync(async (req, res) => {
  const { name, crop_type, planting_date, stage, assigned_agent_id } = req.body
  if (!name || !crop_type || !planting_date) {
    return res.status(400).json({ error: { message: 'name, crop_type, and planting_date are required' } })
  }
  const field = await createField({ name, crop_type, planting_date, stage, assigned_agent_id, created_by: req.user.id })
  res.status(201).json({ field: withStatus(field) })
})

export const getField = catchAsync(async (req, res) => {
  const field = await assertFieldAccess(req.params.id, req.user)
  res.json({ field: withStatus(field) })
})

export const updateFieldHandler = catchAsync(async (req, res) => {
  const { name, crop_type, planting_date, assigned_agent_id } = req.body
  const field = await updateField(req.params.id, { name, crop_type, planting_date, assigned_agent_id })
  res.json({ field: withStatus(field) })
})

export const deleteFieldHandler = catchAsync(async (req, res) => {
  await deleteField(req.params.id)
  res.status(204).send()
})

export const updateStageHandler = catchAsync(async (req, res) => {
  const { new_stage, note } = req.body
  if (!new_stage) {
    return res.status(400).json({ error: { message: 'new_stage is required' } })
  }

  await assertFieldAccess(req.params.id, req.user)

  const field = req.user.role === 'admin'
    ? await adminSetStage(req.params.id, req.user.id, new_stage, note)
    : await advanceStage(req.params.id, req.user.id, new_stage, note)

  res.json({ field: withStatus(field) })
})

export const listUpdates = catchAsync(async (req, res) => {
  await assertFieldAccess(req.params.id, req.user)
  const updates = await getFieldUpdates(req.params.id)
  res.json({ updates })
})

export const addNoteHandler = catchAsync(async (req, res) => {
  const { note } = req.body
  if (!note?.trim()) {
    return res.status(400).json({ error: { message: 'note is required' } })
  }
  await assertFieldAccess(req.params.id, req.user)
  const update = await addNote(req.params.id, req.user.id, note)
  res.status(201).json({ update })
})

export const editNoteHandler = catchAsync(async (req, res) => {
  const { note } = req.body
  if (!note?.trim()) {
    return res.status(400).json({ error: { message: 'note is required' } })
  }

  await assertFieldAccess(req.params.id, req.user)

  const updates = await getFieldUpdates(req.params.id)
  const target = updates.find((u) => u.id === req.params.updateId)

  if (!target) {
    return res.status(404).json({ error: { message: 'Observation not found' } })
  }

  if (!target.note) {
    return res.status(400).json({ error: { message: 'Only note observations can be edited' } })
  }

  const isAdmin = req.user.role === 'admin'
  const isOwner = target.agent_id === req.user.id
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ error: { message: 'You can only edit your own observations' } })
  }

  const createdAtMs = new Date(target.created_at).getTime()
  const windowMs = 15 * 60 * 1000
  if (Date.now() - createdAtMs > windowMs) {
    return res.status(403).json({ error: { message: 'Observation can only be edited within 15 minutes' } })
  }

  const updated = await updateNote(req.params.id, req.params.updateId, note.trim())
  res.json({ update: updated })
})
