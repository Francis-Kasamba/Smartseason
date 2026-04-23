import { useNavigate } from 'react-router-dom'
import { Maximize2 } from 'lucide-react'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <Maximize2 className="mx-auto mb-4 text-gray-400" size={48} />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-600 mb-2">Page not found</p>
        <p className="text-sm text-gray-500 mb-6">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
        >
          Back to login
        </button>
      </div>
    </div>
  )
}
