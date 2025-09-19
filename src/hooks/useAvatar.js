import { useState, useEffect, useCallback, useRef } from 'react'
import { getAvatar } from '@/services/Api'
import { useAuth } from '@/contexts/AuthContext'

export function useAvatar() {
  const { user } = useAuth()
  const [avatarBlobUrl, setAvatarBlobUrl] = useState(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarFetched, setAvatarFetched] = useState(false)
  const [previousUserId, setPreviousUserId] = useState(user?.id)
  const fetchAvatarRef = useRef(null)
  const isFetchingRef = useRef(false)

  // Fonction pour récupérer l'avatar
  const fetchAvatar = useCallback(async () => {
    // Éviter les appels répétés ou parallèles
    if (avatarFetched || isFetchingRef.current || !user) {
      return
    }

    // Essayer de récupérer l'avatar seulement si l'utilisateur est connecté
    isFetchingRef.current = true
    setAvatarFetched(true)
    setAvatarLoading(true)
    
    try {
      const blob = await getAvatar()
      const blobUrl = URL.createObjectURL(blob)
      setAvatarBlobUrl(blobUrl)
    } catch (error) {
      console.error('❌ Erreur récupération avatar:', error?.status || error?.message)
      // Si pas d'avatar trouvé (404), ce n'est pas grave, on affichera les initiales
      setAvatarBlobUrl(null)
    } finally {
      setAvatarLoading(false)
      isFetchingRef.current = false
    }
  }, [user, avatarFetched])

  // Stocker la fonction dans le ref
  useEffect(() => {
    fetchAvatarRef.current = fetchAvatar
  }, [fetchAvatar])

  // Gérer les changements d'utilisateur
  useEffect(() => {
    if (user?.id !== previousUserId) {
      setPreviousUserId(user?.id)
      // Reset tous les états quand l'utilisateur change
      setAvatarFetched(false)
      setAvatarBlobUrl(null)
      setAvatarLoading(false)
      isFetchingRef.current = false
    }
  }, [user?.id, previousUserId])

  // Charger l'avatar automatiquement
  useEffect(() => {
    if (user && !avatarFetched && !avatarLoading && fetchAvatarRef.current) {
      fetchAvatarRef.current()
    }
  }, [user, avatarFetched, avatarLoading])

  // Cleanup
  useEffect(() => {
    return () => {
      if (avatarBlobUrl) {
        URL.revokeObjectURL(avatarBlobUrl)
      }
    }
  }, [avatarBlobUrl])

  // Fonction pour obtenir les initiales
  const getInitials = useCallback(() => {
    const firstName = user?.firstName || ''
    const lastName = user?.lastName || ''
    if (!firstName || !lastName) return 'U'
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }, [user])

  // Fonction pour obtenir le nom d'affichage
  const getDisplayName = useCallback(() => {
    if (!user) return 'Utilisateur'
    const firstName = user?.firstName || ''
    const lastName = user?.lastName || ''
    return `${firstName} ${lastName}`.trim() || 'Utilisateur'
  }, [user])

  return {
    avatarBlobUrl,
    avatarLoading,
    getInitials,
    getDisplayName,
    refetchAvatar: () => {
      setAvatarFetched(false)
      setAvatarBlobUrl(null)
    }
  }
}