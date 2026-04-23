import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, LogOut, Sprout, LayoutDashboard, Map, Users, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  children: React.ReactNode
}

export function AppLayout({ children }: Props) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const isAdmin = user?.role === 'admin'
  const basePath = isAdmin ? '/admin' : '/agent'

  const navItems = isAdmin
    ? [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/fields', label: 'Fields', icon: Map },
        { path: '/agents', label: 'Agents', icon: Users },
      ]
    : [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/fields', label: 'My Fields', icon: Map },
      ]

  const isActive = (path: string) => location.pathname.startsWith(`${basePath}${path}`)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 w-64 ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'} bg-white border-r border-gray-100 flex flex-col transition-all duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className={`h-16 border-b border-gray-100 flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-6'} gap-2`}>
          <div className={`flex items-center gap-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <Sprout size={24} className="text-green-700" />
            {!sidebarCollapsed && <span className="font-bold text-gray-900">SmartSeason</span>}
          </div>
          <button
            onClick={() => setSidebarCollapsed(v => !v)}
            className="hidden md:flex p-1.5 rounded hover:bg-gray-100 text-gray-500"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className={`flex-1 py-6 space-y-2 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={`${basePath}${item.path}`}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-lg text-sm font-medium transition ${
                  isActive(item.path)
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                {!sidebarCollapsed && item.label}
                {sidebarCollapsed && (
                  <span className="hidden md:block absolute left-full ml-2 whitespace-nowrap px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User info */}
        <div className={`border-t border-gray-100 py-4 space-y-3 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
          {!sidebarCollapsed ? (
            <div className="text-sm">
              <div className="text-gray-500">Logged in as</div>
              <div className="font-medium text-gray-900">{user?.name}</div>
              <div className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                {user?.role}
              </div>
            </div>
          ) : (
            <div className="group relative hidden md:flex justify-center">
              <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                {user?.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <span className="absolute left-full ml-2 whitespace-nowrap px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {user?.name} ({user?.role})
              </span>
            </div>
          )}
          <button
            onClick={logout}
            className={`group relative w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-2 px-3'} py-2 rounded-lg text-red-600 hover:bg-red-50 text-sm font-medium transition`}
          >
            <LogOut size={16} /> {!sidebarCollapsed && 'Logout'}
            {sidebarCollapsed && (
              <span className="hidden md:block absolute left-full ml-2 whitespace-nowrap px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="h-16 bg-white border-b border-gray-100 px-4 flex items-center justify-between md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          {/* Mobile user avatar */}
          <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
            {user?.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
