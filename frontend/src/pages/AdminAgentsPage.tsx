import { useState } from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { UserPlus, Users, Shield, Calendar, Pencil, Trash2 } from 'lucide-react'
import { useAgents, useCreateAgent, useUpdateAgent, useDeleteAgent, Agent } from '../hooks/useFields'
import { SkeletonRow } from '../components/Skeleton'
import { useToast } from '../contexts/ToastContext'
import { getErrorMessage } from '../lib/errorUtils'

export function AdminAgentsPage() {
  const { data: agents, isLoading } = useAgents()
  const createAgent = useCreateAgent()
  const updateAgent = useUpdateAgent()
  const deleteAgent = useDeleteAgent()
  const toast = useToast()

  const [showForm, setShowForm] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [deletingAgent, setDeletingAgent] = useState<Agent | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState('')

  const openCreateForm = () => {
    setMode('create')
    setEditingAgent(null)
    setName('')
    setEmail('')
    setPassword('')
    setShowForm(true)
  }

  const openEditForm = (agent: Agent) => {
    setMode('edit')
    setEditingAgent(agent)
    setName(agent.name)
    setEmail(agent.email || '')
    setPassword('')
    setShowForm(true)
  }

  const onCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'create') {
      if (!name.trim() || !email.trim() || !password.trim()) {
        toast.show('Name, email, and password are required', 'error')
        return
      }
    } else if (!name.trim() || !email.trim()) {
      toast.show('Name and email are required', 'error')
      return
    }

    if (password && password.length < 6) {
      toast.show('Password must be at least 6 characters', 'error')
      return
    }

    try {
      if (mode === 'create') {
        const result = await createAgent.mutateAsync({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        })
        toast.show('Agent created successfully', 'success')

        const inviteMessage = result.invite_sent
          ? `Invitation email has been sent to ${email.trim().toLowerCase()}.`
          : (result.email_notice || 'Agent was created, but the invitation email could not be sent.')
        setConfirmMessage(inviteMessage)
        setConfirmOpen(true)
      } else if (editingAgent) {
        await updateAgent.mutateAsync({
          id: editingAgent.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          ...(password ? { password } : {}),
        })
        toast.show('Agent updated successfully', 'success')
      }

      setName('')
      setEmail('')
      setPassword('')
      setShowForm(false)
      setEditingAgent(null)
    } catch (err) {
      toast.show(getErrorMessage(err), 'error')
    }
  }

  const onDeleteAgent = async () => {
    if (!deletingAgent) return
    try {
      await deleteAgent.mutateAsync(deletingAgent.id)
      toast.show('Agent deleted successfully', 'success')
      setDeletingAgent(null)
      if (editingAgent?.id === deletingAgent.id) {
        setShowForm(false)
        setEditingAgent(null)
      }
    } catch (err) {
      toast.show(getErrorMessage(err), 'error')
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-auto">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {(agents || []).length} field agent{(agents || []).length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm && mode === 'create') {
              setShowForm(false)
            } else {
              openCreateForm()
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          <UserPlus size={18} /> {showForm ? 'Close' : 'New agent'}
        </button>
      </div>

      {showForm && (
        <div className="p-6 border-b border-gray-100 bg-white">
          <form onSubmit={onCreateAgent} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Agent name"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="agent@example.com"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'create' ? 'Temporary password' : 'Optional new temporary password'}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              disabled={createAgent.isPending || updateAgent.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
            >
              {mode === 'create'
                ? (createAgent.isPending ? 'Creating...' : 'Create agent')
                : (updateAgent.isPending ? 'Updating...' : 'Save changes')}
            </button>
          </form>
        </div>
      )}

      <div className="p-6">
        {isLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : !agents || agents.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Users size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No agents created yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first field agent to start assigning fields.</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">Role</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600">Created</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {agents.map(agent => (
                    <tr key={agent.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{agent.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{agent.email || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{agent.role}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {agent.created_at ? new Date(agent.created_at).toLocaleString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditForm(agent)}
                            className="p-2 rounded text-blue-600 hover:bg-blue-50"
                            title="Edit agent"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeletingAgent(agent)}
                            className="p-2 rounded text-red-600 hover:bg-red-50"
                            title="Delete agent"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {agents.map(agent => (
                <div key={agent.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <Users size={16} className="text-gray-500" />
                      {agent.name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield size={14} className="text-gray-400" />
                      {agent.role}
                    </div>
                    <div className="text-sm text-gray-600">{agent.email || '—'}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} className="text-gray-400" />
                      {agent.created_at ? new Date(agent.created_at).toLocaleString() : '—'}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => openEditForm(agent)}
                        className="px-3 py-1.5 text-xs rounded bg-blue-50 text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingAgent(agent)}
                        className="px-3 py-1.5 text-xs rounded bg-red-50 text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AlertDialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl w-full max-w-md z-50 shadow-xl p-6">
            <AlertDialog.Title className="font-semibold text-gray-900">Agent Created</AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-600 mt-2">
              {confirmMessage}
            </AlertDialog.Description>
            <div className="flex justify-end mt-6">
              <AlertDialog.Action asChild>
                <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                  OK
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <AlertDialog.Root open={!!deletingAgent} onOpenChange={() => setDeletingAgent(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl w-full max-w-md z-50 shadow-xl p-6">
            <AlertDialog.Title className="font-semibold text-gray-900">Delete agent?</AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-600 mt-2">
              {deletingAgent?.name ? `This will permanently remove ${deletingAgent.name}.` : 'This action cannot be undone.'}
            </AlertDialog.Description>
            <div className="flex justify-end gap-3 mt-6">
              <AlertDialog.Cancel asChild>
                <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={onDeleteAgent}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                  disabled={deleteAgent.isPending}
                >
                  {deleteAgent.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
}
