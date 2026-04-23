import { Field } from '../hooks/useFields'

const stageConfig: Record<Field['stage'], { label: string; className: string }> = {
  planted:   { label: 'Planted',   className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  growing:   { label: 'Growing',   className: 'bg-teal-50 text-teal-700 border border-teal-200' },
  ready:     { label: 'Ready',     className: 'bg-lime-50 text-lime-700 border border-lime-200' },
  harvested: { label: 'Harvested', className: 'bg-gray-50 text-gray-500 border border-gray-200' },
}

export function StagePill({ stage }: { stage: Field['stage'] }) {
  const cfg = stageConfig[stage]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
