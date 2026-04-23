import { useState } from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Search, Plus, ChevronRight, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFields, useDeleteField, Field } from '../hooks/useFields'
import { useAuth } from '../contexts/AuthContext'
import { StagePill } from '../components/StagePill'
import { StatusBadge } from '../components/StatusBadge'
import { useToast } from '../contexts/ToastContext'
import { getErrorMessage } from '../lib/errorUtils'
import { RelativeTime } from '../components/RelativeTime'
import { SkeletonRow, SkeletonCard } from '../components/Skeleton'
import { FieldFormDialog } from '../components/FieldFormDialog'

export function FieldListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { data: fields, isLoading } = useFields()
  const deleteField = useDeleteField()

  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteFieldId, setDeleteFieldId] = useState<string | null>(null)

  const filtered = (fields || []).filter(f => {
    const matches = () => {
      const q = search.toLowerCase()
      return f.name.toLowerCase().includes(q) ||
             f.crop_type.toLowerCase().includes(q) ||
             f.assigned_agent?.name.toLowerCase().includes(q)
    }
    return matches() &&
           (!stageFilter || f.stage === stageFilter) &&
           (!statusFilter || f.status === statusFilter)
  })

  const onDeleteConfirm = async () => {
    if (deleteFieldId) {
      try {
        await deleteField.mutateAsync(deleteFieldId)
        toast.show('Field deleted successfully', 'success')
        setDeleteFieldId(null)
      } catch (err) {
        toast.show(getErrorMessage(err), 'error')
        console.error(err)
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fields</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} field{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            <Plus size={18} /> New field
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, crop, agent..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Filters */}
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">All stages</option>
            <option value="planted">Planted</option>
            <option value="growing">Growing</option>
            <option value="ready">Ready</option>
            <option value="harvested">Harvested</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="at_risk">At Risk</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-sm">No fields found</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white">
              <table className="w-full">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">Field</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">Crop</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">Stage</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">Agent</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">Updated</th>
                    {user?.role === 'admin' && <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(f => (
                    <tr key={f.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/fields/${f.id}`)}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{f.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{f.crop_type}</td>
                      <td className="px-6 py-4"><StagePill stage={f.stage} /></td>
                      <td className="px-6 py-4"><StatusBadge status={f.status} /></td>
                      <td className="px-6 py-4 text-sm text-gray-600">{f.assigned_agent?.name || '—'}</td>
                      <td className="px-6 py-4"><RelativeTime date={f.last_updated_at} /></td>
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              setDeleteFieldId(f.id)
                            }}
                            className="p-1.5 rounded text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.map(f => (
                <button
                  key={f.id}
                  onClick={() => navigate(`/agent/fields/${f.id}`)}
                  className="block w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{f.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{f.crop_type}</div>
                      <div className="flex gap-2 mt-2">
                        <StagePill stage={f.stage} />
                        <StatusBadge status={f.status} />
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400 mt-1" size={18} />
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Dialogs */}
      <FieldFormDialog open={dialogOpen} onOpenChange={setDialogOpen} mode="create" />

      <AlertDialog.Root open={!!deleteFieldId} onOpenChange={() => setDeleteFieldId(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl w-full max-w-sm z-50 shadow-xl p-6">
            <AlertDialog.Title className="font-semibold text-gray-900">Delete field?</AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-600 mt-2">
              This action cannot be undone. All associated field updates will be deleted.
            </AlertDialog.Description>
            <div className="flex gap-3 mt-6">
              <AlertDialog.Cancel asChild>
                <button className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={onDeleteConfirm}
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
