import { Navigate } from 'react-router-dom'
import { useSession } from '../lib/auth-client'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/signin" replace />
  }

  return <>{children}</>
}
