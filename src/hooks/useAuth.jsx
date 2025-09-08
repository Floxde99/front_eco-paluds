import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/services/Api'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    const fetchUser = async () => {
      const token = localStorage.getItem('authToken')

      if (!token) {
        if (mounted) setLoading(false)
        return
      }

      try {
        const userData = await getCurrentUser()
        if (mounted) {
          setUser(userData?.user ?? null)
          setError(null)
        }
      } catch (err) {
        console.error('Auth error:', err)
        if (mounted) {
          setError(err)
          // If token is invalid, remove it
          if (err?.response?.status === 401 || err?.response?.status === 403) {
            localStorage.removeItem('authToken')
          }
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchUser()

    return () => {
      mounted = false
    }
  }, [])

  const updateUser = (userData) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('authToken')
  }

  const value = {
    user,
    loading,
    error,
    updateUser,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
