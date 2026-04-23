import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Field, useCreateField, useUpdateField, useAgents } from '../hooks/useFields'
import { useToast } from '../contexts/ToastContext'
import { getErrorMessage } from '../lib/errorUtils'

interface FormValues {
  name: string
  crop_type: string
  planting_date: string
  stage: Field['stage']
  assigned_agent_id: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  field?: Field
}

const CROP_SUGGESTIONS = ['Maize', 'Wheat', 'Sorghum', 'Beans', 'Rice', 'Barley', 'Sunflower', 'Cotton']
const STAGES = ['planted', 'growing', 'ready', 'harvested']

export function FieldFormDialog({ open, onOpenChange, mode, field }: Props) {
  const toast = useToast()
  const createField = useCreateField()
  const updateField = useUpdateField()
  const { data: agents } = useAgents()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      name: '',
      crop_type: '',
      planting_date: '',
      stage: 'planted',
      assigned_agent_id: '',
    }
  })

  useEffect(() => {
    if (open && field && mode === 'edit') {
      reset({
        name: field.name,
        crop_type: field.crop_type,
        planting_date: field.planting_date,
        stage: field.stage,
        assigned_agent_id: field.assigned_agent_id ?? '',
      })
    } else if (open && mode === 'create') {
      reset({ name: '', crop_type: '', planting_date: '', stage: 'planted', assigned_agent_id: '' })
    }
  }, [open, field, mode, reset])

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      assigned_agent_id: values.assigned_agent_id || null,
    }
    try {
      if (mode === 'create') {
        await createField.mutateAsync(payload)
        toast.show('Field created successfully', 'success')
      } else if (field) {
        await updateField.mutateAsync({ id: field.id, ...payload })
        toast.show('Field updated successfully', 'success')
      }
      onOpenChange(false)
    } catch (err: any) {
      toast.show(getErrorMessage(err), 'error')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl w-full max-w-md z-50 shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <Dialog.Title className="text-base font-medium text-gray-900">
              {mode === 'create' ? 'New field' : 'Edit field'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
            {/* Field name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field name</label>
              <input
                {...register('name', { required: 'Field name is required' })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. North Block A"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            {/* Crop type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop type</label>
              <input
                {...register('crop_type', { required: 'Crop type is required' })}
                list="crop-suggestions"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Maize"
              />
              <datalist id="crop-suggestions">
                {CROP_SUGGESTIONS.map(c => <option key={c} value={c} />)}
              </datalist>
              {errors.crop_type && <p className="text-xs text-red-500 mt-1">{errors.crop_type.message}</p>}
            </div>

            {/* Planting date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Planting date</label>
              <input
                type="date"
                {...register('planting_date', { required: 'Planting date is required' })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.planting_date && <p className="text-xs text-red-500 mt-1">{errors.planting_date.message}</p>}
            </div>

            {/* Stage (create only) */}
            {mode === 'create' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Starting stage</label>
                <select
                  {...register('stage')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {STAGES.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Assign agent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign agent</label>
              <select
                {...register('assigned_agent_id')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Unassigned</option>
                {agents?.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <button type="button" className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create field' : 'Save changes'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
