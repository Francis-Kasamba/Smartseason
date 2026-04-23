import { AxiosError } from 'axios'

export function getErrorMessage(error: any): string {
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message
  }
  if (error?.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}
