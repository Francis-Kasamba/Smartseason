import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children, allowPasswordReset = false }: { children: ReactNode; allowPasswordReset?: boolean }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="flex h-screen items-center justify-center text-gray-400">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.must_reset_password && !allowPasswordReset) return <Navigate to="/reset-password" replace />
  if (!user.must_reset_password && allowPasswordReset) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard'} replace />
  }
  return children
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="flex h-screen items-center justify-center text-gray-400">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.must_reset_password) return <Navigate to="/reset-password" replace />
  if (user.role !== 'admin') return <Navigate to="/agent/dashboard" replace />
  return children
}
