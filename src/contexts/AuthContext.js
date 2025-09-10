import { createContext, useContext } from 'react'

// Auth Context
export const AuthContext = createContext(null)

// Auth Hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}