import { Loader2 } from 'lucide-react'

/**
 * Loading spinner component for Suspense fallback
 */
export default function LoadingSpinner({ message = 'Chargement...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </div>
  )
}
