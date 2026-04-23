import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle, Zap } from 'lucide-react'
import { useDashboard, DashboardAgent } from '../hooks/useFields'
import { RelativeTime } from '../components/RelativeTime'
import { StagePill } from '../components/StagePill'
import { StatusBadge } from '../components/StatusBadge'
import { SkeletonStatCard, SkeletonCard } from '../components/Skeleton'

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

export function AgentDashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useDashboard()

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-gray-400">Loading dashboard...</div>
  }

  if (!data || data.role !== 'agent') {
    return <div className="h-full flex items-center justify-center text-gray-400">Dashboard not available</div>
  }

  const dashboard = data as DashboardAgent
  const { totals, my_fields } = dashboard

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-900">My dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{totals.fields} field{totals.fields !== 1 ? 's' : ''} assigned to you</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Row 1: Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={AlertTriangle}
            label="My fields"
            value={totals.fields}
            color="text-blue-700"
          />
          <StatCard
            icon={CheckCircle}
            label="Active"
            value={totals.by_status.active}
            color="text-green-700"
          />
          <StatCard
            icon={Zap}
            label="At risk"
            value={totals.by_status.at_risk}
            color="text-amber-700"
          />
        </div>

        {/* Row 2: My fields grid */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">My fields</h2>
          {my_fields.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-400">No fields assigned yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {my_fields.map(f => (
                <div
                  key={f.id}
                  className={`bg-white rounded-xl border border-gray-200 p-5 flex flex-col transition ${
                    f.status === 'at_risk'
                      ? 'border-l-4 border-l-amber-400'
                      : ''
                  } ${
                    f.status === 'completed'
                      ? 'opacity-60'
                      : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{f.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {f.crop_type} • Planted {new Date(f.last_updated_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <StagePill stage={f.stage as any} />
                      <StatusBadge status={f.status} />
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Updated <RelativeTime date={f.last_updated_at} />
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/agent/fields/${f.id}`)}
                    className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition"
                  >
                    View & update
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
