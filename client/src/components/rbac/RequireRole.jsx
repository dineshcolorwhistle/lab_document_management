import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function RequireRole({ children, allowedRoles, fallbackPath = '/dashboard' }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const hasAccess = Array.isArray(allowedRoles)
    ? allowedRoles.includes(user.role)
    : user.role === allowedRoles

  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />
  }

  return children
}
