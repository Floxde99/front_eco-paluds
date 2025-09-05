import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

export function RequireAuth({ children }) {
  const token = localStorage.getItem('authToken')
  const location = useLocation()
  if (!token) {
    // redirect to login, keep current location to come back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

export default RequireAuth
