import { Field } from '../hooks/useFields'

const statusConfig: Record<Field['status'], { label: string; className: string }> = {
  active:    { label: 'Active',    className: 'bg-green-100 text-green-800' },
  at_risk:   { label: 'At Risk',   className: 'bg-amber-100 text-amber-800' },
  completed: { label: 'Completed', className: 'bg-gray-100 text-gray-600' },
}

export function StatusBadge({ status }: { status: Field['status'] }) {
  const cfg = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
