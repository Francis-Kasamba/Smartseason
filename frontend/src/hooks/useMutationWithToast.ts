import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { useToast } from '../contexts/ToastContext'
import { getErrorMessage } from '../lib/errorUtils'

export function useMutationWithToast<TData, TError, TVariables>(
  options: UseMutationOptions<TData, TError, TVariables, unknown>
) {
  const toast = useToast()

  return useMutation({
    ...options,
    onError: (error, variables, onMutateResult, context) => {
      toast.show(getErrorMessage(error), 'error')
      options.onError?.(error, variables, onMutateResult, context)
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      if (options.onSuccess) {
        options.onSuccess(data, variables, onMutateResult, context)
      }
    },
  })
}
