import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from '@/contexts/AuthContext'
import { useCurrentUser, authKeys } from '@/hooks/useAuthQuery'
import { queryClient } from '@/lib/queryClient'
import { normalizeUser } from '@/lib/transformers'


// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Utiliser React Query pour récupérer l'utilisateur (avec déduplication)
  const { data: userData, isLoading, error: queryError, refetch } = useCurrentUser()

  useEffect(() => {
    // Vérifier si on a un token mais pas encore de données
    const hasToken = !!localStorage.getItem('authToken')
    
    // Si on a un token et qu'on charge, rester en loading
    // Si on n'a pas de token, ne pas être en loading
    if (!hasToken) {
      setLoading(false)
      setUser(null)
      return
    }

    // Mettre à jour l'état local basé sur les données React Query
    if (!isLoading) {
      const normalizedUser = normalizeUser(userData?.user)
      setUser(normalizedUser)
      setLoading(false)
    }
    
    setError(queryError)

    // Si le token est invalide, le supprimer
    if (queryError?.response?.status === 401 || queryError?.response?.status === 403) {
      localStorage.removeItem('authToken')
      queryClient.clear()
      setUser(null)
      setLoading(false)
    }
  }, [userData, isLoading, queryError])

  // Fonction pour mettre à jour l'utilisateur après login
  const updateUser = useCallback((userData) => {
    const normalizedUser = normalizeUser(userData)
    setUser(normalizedUser)
    setLoading(false)
    
    // Mettre à jour le cache React Query avec les nouvelles données
    queryClient.setQueryData(authKeys.user(), { user: userData })
  }, [])

  // Fonction pour rafraîchir les données utilisateur
  const refreshUser = useCallback(async () => {
    setLoading(true)
    try {
      await refetch()
    } finally {
      setLoading(false)
    }
  }, [refetch])

  const logout = useCallback(() => {
    setUser(null)
    setLoading(false)
    localStorage.removeItem('authToken')
    queryClient.clear()
  }, [])

  const value = {
    user,
    loading,
    error,
    updateUser,
    refreshUser,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
