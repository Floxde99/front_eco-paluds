import { useState, useEffect } from 'react'
import { AuthContext } from '@/contexts/AuthContext'
import { useCurrentUser } from '@/hooks/useAuthQuery'
import { queryClient } from '@/lib/queryClient'

function normalizeUser(rawUser) {
  if (!rawUser || typeof rawUser !== 'object') {
    return null
  }

  const firstName =
    rawUser.firstName ??
    rawUser.prenom ??
    rawUser.first_name ??
    rawUser.given_name ??
    ''

  const lastName =
    rawUser.lastName ??
    rawUser.nom ??
    rawUser.last_name ??
    rawUser.family_name ??
    ''

  const email =
    rawUser.email ??
    rawUser.mail ??
    rawUser.emailAddress ??
    rawUser.user_email ??
    undefined

  return {
    ...rawUser,
    firstName,
    lastName,
    prenom: rawUser.prenom ?? firstName,
    nom: rawUser.nom ?? lastName,
    email: email ?? '',
  }
}

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Utiliser React Query pour r�cup�rer l'utilisateur (avec d�duplication)
  const { data: userData, isLoading, error: queryError } = useCurrentUser()

  useEffect(() => {
    // Mettre � jour l'�tat local bas� sur les donn�es React Query
    const normalizedUser = normalizeUser(userData?.user)
    setUser(normalizedUser)
    setLoading(isLoading)
    setError(queryError)

    // Si le token est invalide, le supprimer
    if (queryError?.response?.status === 401 || queryError?.response?.status === 403) {
      localStorage.removeItem('authToken')
      queryClient.clear()
    }
  }, [userData, isLoading, queryError])

  const updateUser = (userData) => {
    setUser(normalizeUser(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('authToken')
    queryClient.clear()
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
