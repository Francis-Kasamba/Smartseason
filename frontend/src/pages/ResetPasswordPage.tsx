import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, ShieldCheck } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { getErrorMessage } from '../lib/errorUtils'
import { useToast } from '../contexts/ToastContext'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.show('All fields are required', 'error')
      return
    }

    if (newPassword.length < 6) {
      toast.show('New password must be at least 6 characters', 'error')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.show('New passwords do not match', 'error')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/auth/reset-password-first-login', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      toast.show('Password reset successful. Please sign in again.', 'success')
      localStorage.removeItem('token')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.show(getErrorMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Reset your password</h1>
            <p className="text-sm text-gray-500">Required for first login</p>
          </div>
        </div>

        <div className="mb-5 p-3 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-900">
          {user?.email ? `Hi ${user.email}, ` : ''}you must reset your temporary password before accessing the app.
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current temporary password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter temporary password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Repeat new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
          >
            <Lock size={16} /> {loading ? 'Updating...' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  )
}
