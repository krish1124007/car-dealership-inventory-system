import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  /** When set, only ADMIN users may enter; others go back to the home page. */
  adminOnly?: boolean
}

export function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { user, isAdmin } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
