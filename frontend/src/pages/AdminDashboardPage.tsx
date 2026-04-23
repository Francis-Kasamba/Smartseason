import { useNavigate } from 'react-router-dom'
import { LayoutGrid, CheckCircle, AlertTriangle, Archive } from 'lucide-react'
import { useDashboard, DashboardAdmin } from '../hooks/useFields'
import { RelativeTime } from '../components/RelativeTime'
import { StagePill } from '../components/StagePill'
import { SkeletonStatCard, SkeletonPanel } from '../components/Skeleton'

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500 mb-1">{label}</div>
          <div className={`text-3xl font-bold ${color}`}>{value}</div>
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-700', '-50')}`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  )
}

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useDashboard()

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-gray-400">Loading dashboard...</div>
  }

  if (!data || data.role !== 'admin') {
    return <div className="h-full flex items-center justify-center text-gray-400">Dashboard not available</div>
  }

  const dashboard = data as DashboardAdmin
  const { totals, agents, at_risk_fields, recent_updates } = dashboard

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of all fields and team activity</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Row 1: Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={LayoutGrid}
            label="Total fields"
            value={totals.fields}
            color="text-blue-700"
          />
          <StatCard
            icon={CheckCircle}
            label="Active fields"
            value={totals.by_status.active}
            color="text-green-700"
          />
          <StatCard
            icon={AlertTriangle}
            label="At risk"
            value={totals.by_status.at_risk}
            color="text-amber-700"
          />
          <StatCard
            icon={Archive}
            label="Completed"
            value={totals.by_status.completed}
            color="text-gray-700"
          />
        </div>

        {/* Row 2: At-risk fields and agent overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* At-risk fields (60%) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Fields at risk</h2>
            {at_risk_fields.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500">All fields are healthy</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {at_risk_fields.map(f => (
                  <button
                    key={f.id}
                    onClick={() => navigate(`/admin/fields/${f.id}`)}
                    className="block w-full text-left bg-amber-50 border border-amber-100 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{f.name}</div>
                        <div className="text-sm text-gray-600 mt-0.5">{f.crop_type}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <StagePill stage={f.stage as any} />
                          <span className="text-xs text-gray-500">
                            {f.assigned_agent_name ? `Assigned to ${f.assigned_agent_name}` : 'Unassigned'}
                          </span>
                        </div>
                      </div>
                      <RelativeTime date={f.last_updated_at} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Agent overview (40%) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Agent overview</h2>
            {agents.length === 0 ? (
              <p className="text-sm text-gray-400">No agents assigned</p>
            ) : (
              <div className="space-y-1">
                {agents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => navigate(`/admin/fields?agent=${agent.id}`)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                        <div className="text-xs text-gray-500">
                          {agent.field_count} field{agent.field_count !== 1 ? 's' : ''} •{' '}
                          <span className={agent.at_risk_count > 0 ? 'text-amber-600 font-medium' : 'text-gray-500'}>
                            {agent.at_risk_count} at risk
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Recent activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Recent activity</h2>
          {recent_updates.length === 0 ? (
            <p className="text-sm text-gray-400">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {recent_updates.map((u, idx) => {
                const initials = u.agent_name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                const colors = [
                  'bg-blue-100 text-blue-700',
                  'bg-green-100 text-green-700',
                  'bg-purple-100 text-purple-700',
                  'bg-pink-100 text-pink-700',
                ]
                const bgColor = colors[idx % colors.length]

                return (
                  <div key={idx} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${bgColor}`}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-900">
                        <strong>{u.agent_name}</strong> on <strong>{u.field_name}</strong>
                        {u.new_stage ? ` advanced to ${u.new_stage}` : ' added a note'}
                      </div>
                      {u.note && <p className="text-sm text-gray-600 mt-1 truncate">{u.note}</p>}
                      <RelativeTime date={u.created_at} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
