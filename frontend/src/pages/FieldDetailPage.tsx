import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { ChevronLeft, Edit2, Trash2, Pencil } from 'lucide-react'
import { useField, useFieldUpdates, useAdvanceStage, useAddNote, useDeleteField, useUpdateNote, Field, FieldUpdate } from '../hooks/useFields'
import { useAuth } from '../contexts/AuthContext'
import { StagePill } from '../components/StagePill'
import { useToast } from '../contexts/ToastContext'
import { getErrorMessage } from '../lib/errorUtils'
import { StatusBadge } from '../components/StatusBadge'
import { RelativeTime } from '../components/RelativeTime'
import { SkeletonRow } from '../components/Skeleton'
import { FieldFormDialog } from '../components/FieldFormDialog'

export function FieldDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const { data: field, isLoading: fieldLoading } = useField(id!)
  const { data: updates, isLoading: updatesLoading } = useFieldUpdates(id!)
  const advanceStage = useAdvanceStage()
  const addNote = useAddNote()
  const updateNote = useUpdateNote()
  const deleteField = useDeleteField()

  const [editOpen, setEditOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null)
  const [editingNoteText, setEditingNoteText] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (fieldLoading) return <div className="h-full flex items-center justify-center text-gray-400">Loading...</div>
  if (!field) return <div className="h-full flex items-center justify-center text-gray-400">Field not found</div>

  const canAdvance = user?.role === 'agent' && field.stage !== 'harvested'
  const canSetStage = user?.role === 'admin'
  const canEdit = user?.role === 'admin'
  const canDelete = user?.role === 'admin'

  const nextStages: Record<Field['stage'], Field['stage'] | null> = {
    planted: 'growing',
    growing: 'ready',
    ready: 'harvested',
    harvested: null,
  }

  const onAdvance = async () => {
    const next = nextStages[field.stage]
    if (!next) return
    try {
      await advanceStage.mutateAsync({
        id: field.id,
        new_stage: next,
      })
      toast.show('Field advanced successfully', 'success')
    } catch (err: any) {
      toast.show(getErrorMessage(err), 'error')
      console.error(err)
    }
  }

  const onAddNote = async () => {
    if (!noteText.trim()) return
    try {
      await addNote.mutateAsync({ id: field.id, note: noteText.trim() })
      setNoteText('')
      toast.show('Observation saved', 'success')
    } catch (err: any) {
      toast.show(getErrorMessage(err), 'error')
      console.error(err)
    }
  }

  const onDelete = async () => {
    try {
      await deleteField.mutateAsync(field.id)
      toast.show('Field deleted successfully', 'success')
      navigate('/admin/fields')
    } catch (err: any) {
      toast.show(getErrorMessage(err), 'error')
      console.error(err)
    }
  }

  const canEditObservation = (update: FieldUpdate) => {
    if (!update.note) return false
    if (!user) return false
    const isOwner = update.agent_id === user.id
    const isAdmin = user.role === 'admin'
    if (!isOwner && !isAdmin) return false

    const createdAtMs = new Date(update.created_at).getTime()
    return Date.now() - createdAtMs <= 15 * 60 * 1000
  }

  const startEditingObservation = (update: FieldUpdate) => {
    setEditingUpdateId(update.id)
    setEditingNoteText(update.note || '')
  }

  const cancelEditingObservation = () => {
    setEditingUpdateId(null)
    setEditingNoteText('')
  }

  const saveObservationEdit = async (updateId: string) => {
    if (!editingNoteText.trim()) {
      toast.show('Observation note cannot be empty', 'error')
      return
    }

    try {
      await updateNote.mutateAsync({
        id: field.id,
        updateId,
        note: editingNoteText.trim(),
      })
      toast.show('Observation updated', 'success')
      cancelEditingObservation()
    } catch (err: any) {
      toast.show(getErrorMessage(err), 'error')
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{field.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{field.crop_type}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => setEditOpen(true)}
              className="p-2 rounded hover:bg-gray-100 text-gray-600"
            >
              <Edit2 size={18} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded hover:bg-red-50 text-red-500"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Stage</div>
                <div className="flex items-center gap-3">
                  <StagePill stage={field.stage} />
                  <span className="text-gray-600">{field.stage.charAt(0).toUpperCase() + field.stage.slice(1)}</span>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Status</div>
                <StatusBadge status={field.status} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Planting date</div>
                <p className="text-gray-900">{new Date(field.planting_date).toLocaleDateString()}</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Assigned agent</div>
                <p className="text-gray-900">{field.assigned_agent?.name || '—'}</p>
              </div>
            </div>
          </div>

          {/* Stage progression */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Progression</h2>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
              {['planted', 'growing', 'ready', 'harvested'].map((stage, idx) => (
                <div key={stage} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      field.stage === stage
                        ? 'bg-green-500 text-white'
                        : ['planted', 'growing', 'ready', 'harvested'].indexOf(field.stage) >= idx
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-xs text-gray-600">{stage}</span>
                </div>
              ))}
            </div>

            {(canAdvance || canSetStage) && field.stage !== 'harvested' && (
              <button
                onClick={onAdvance}
                disabled={advanceStage.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
              >
                {advanceStage.isPending ? 'Advancing...' : `Advance to ${nextStages[field.stage]}`}
              </button>
            )}
          </div>

          {/* Activity log */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Activity</h2>
            {updatesLoading ? (
              <div className="space-y-1">
                {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : !updates || updates.length === 0 ? (
              <p className="text-sm text-gray-400">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {updates.map(u => (
                  <div key={u.id} className="flex gap-4 pb-3 border-b border-gray-100 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {u.agent.name}
                        {u.new_stage ? (
                          <span> advanced to <strong>{u.new_stage}</strong></span>
                        ) : (
                          <span> added a note</span>
                        )}
                      </div>
                      {u.note && editingUpdateId === u.id ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editingNoteText}
                            onChange={e => setEditingNoteText(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => saveObservationEdit(u.id)}
                              disabled={updateNote.isPending}
                              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                              {updateNote.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={cancelEditingObservation}
                              className="px-3 py-1.5 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        u.note && <p className="text-sm text-gray-600 mt-1">{u.note}</p>
                      )}
                      <RelativeTime date={u.created_at} />
                      {u.note && editingUpdateId !== u.id && canEditObservation(u) && (
                        <button
                          onClick={() => startEditingObservation(u)}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <Pencil size={12} /> Edit note
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add note */}
          {user?.role === 'agent' || user?.role === 'admin' ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Add observation</h2>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Record your observations about this field..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows={3}
              />
              <button
                onClick={onAddNote}
                disabled={addNote.isPending || !noteText.trim()}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
              >
                {addNote.isPending ? 'Saving...' : 'Save observation'}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Edit dialog */}
      {field && <FieldFormDialog open={editOpen} onOpenChange={setEditOpen} mode="edit" field={field} />}

      {/* Delete confirm */}
      <AlertDialog.Root open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl w-full max-w-sm z-50 shadow-xl p-6">
            <AlertDialog.Title className="font-semibold text-gray-900">Delete field?</AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-600 mt-2">
              This will delete '{field.name}' and all associated activity records. This action cannot be undone.
            </AlertDialog.Description>
            <div className="flex gap-3 mt-6">
              <AlertDialog.Cancel asChild>
                <button className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={onDelete}
                  className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
}
