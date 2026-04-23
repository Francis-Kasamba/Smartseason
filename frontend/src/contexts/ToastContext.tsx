import { createContext, useContext, ReactNode, useState, useCallback } from 'react'
import * as Toast from '@radix-ui/react-toast'
import { X } from 'lucide-react'

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  show: (message: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const show = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      <Toast.Provider swipeDirection="right">
        {children}

        {/* Toast viewport */}
        <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-3 p-6 pointer-events-none max-w-sm">
          {toasts.map(toast => (
            <Toast.Root
              key={toast.id}
              className={`rounded-lg shadow-lg px-5 py-4 text-sm font-medium text-white flex items-center justify-between gap-3 pointer-events-auto ${
                toast.type === 'success'
                  ? 'bg-green-600'
                  : toast.type === 'error'
                    ? 'bg-red-600'
                    : 'bg-gray-900'
              }`}
            >
              <Toast.Title>{toast.message}</Toast.Title>
              <Toast.Close asChild>
                <button className="p-0.5 hover:opacity-70">
                  <X size={16} />
                </button>
              </Toast.Close>
            </Toast.Root>
          ))}
        </div>
      </Toast.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
