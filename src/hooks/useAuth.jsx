import { useState, useEffect } from 'react'
import { AuthContext } from '@/contexts/AuthContext'
import { useCurrentUser } from '@/hooks/useAuthQuery'

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Utiliser React Query pour récupérer l'utilisateur (avec déduplication)
  const { data: userData, isLoading, error: queryError } = useCurrentUser()

  useEffect(() => {
    // Mettre à jour l'état local basé sur les données React Query
    setUser(userData?.user ?? null)
    setLoading(isLoading)
    setError(queryError)

    // Si le token est invalide, le supprimer
    if (queryError?.response?.status === 401 || queryError?.response?.status === 403) {
      localStorage.removeItem('authToken')
    }
  }, [userData, isLoading, queryError])

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
