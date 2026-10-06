import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { Role } from '../types/user'

interface ProtectedRouteProps {
  children: ReactNode
  // Khali ho to har logged-in user aa sakta hai
  roles?: Role[]
}

function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <p className="text-center text-gray-500">Loading...</p>
  }

  if (!user) {
    // Login ke baad wapas isi page pe aane ke liye location saath bhejo
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <p className="text-center text-red-600">
        You do not have permission to view this page.
      </p>
    )
  }

  return children
}

export default ProtectedRoute
