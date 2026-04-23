import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AdminRoute, ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import { FieldListPage } from './pages/FieldListPage'
import { FieldDetailPage } from './pages/FieldDetailPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AgentDashboardPage } from './pages/AgentDashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AdminAgentsPage } from './pages/AdminAgentsPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/reset-password"
                  element={
                    <ProtectedRoute allowPasswordReset>
                      <ResetPasswordPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin routes */}
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute>
                      <AppLayout>
                        <Routes>
                          <Route index element={<Navigate to="dashboard" replace />} />
                          <Route path="dashboard" element={<AdminDashboardPage />} />
                          <Route path="fields" element={<FieldListPage />} />
                          <Route path="fields/:id" element={<FieldDetailPage />} />
                          <Route path="agents" element={<AdminAgentsPage />} />
                        </Routes>
                      </AppLayout>
                    </AdminRoute>
                  }
                />

                {/* Agent routes */}
                <Route
                  path="/agent/*"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Routes>
                          <Route index element={<Navigate to="dashboard" replace />} />
                          <Route path="dashboard" element={<AgentDashboardPage />} />
                          <Route path="fields" element={<FieldListPage />} />
                          <Route path="fields/:id" element={<FieldDetailPage />} />
                        </Routes>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
