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

  const updateBlobUrl = useCallback((nextUrl) => {
    setAvatarBlobUrl((previousUrl) => {
      if (
        previousUrl &&
        previousUrl !== nextUrl &&
        typeof URL !== 'undefined' &&
        typeof URL.revokeObjectURL === 'function'
      ) {
        URL.revokeObjectURL(previousUrl)
      }
      return nextUrl ?? null
    })
  }, [])

  // Fonction pour r�cup�rer l'avatar
  const fetchAvatar = useCallback(async () => {
    // �viter les appels r�p�t�s ou parall�les
    if (avatarFetched || isFetchingRef.current || !user) {
      return
    }

    // Essayer de r�cup�rer l'avatar seulement si l'utilisateur est connect�
    isFetchingRef.current = true

    // Si le profil n'a pas encore d'avatar c�t� API, ne pas d�clencher d'appel 404
    if (!user?.avatar_url) {
      updateBlobUrl(null)
      setAvatarFetched(true)
      setAvatarLoading(false)
      isFetchingRef.current = false
      return
    }

    setAvatarFetched(true)
    setAvatarLoading(true)

    try {
      const blob = await getAvatar()
      const blobUrl = URL.createObjectURL(blob)
      updateBlobUrl(blobUrl)
    } catch {
      updateBlobUrl(null)
    } finally {
      setAvatarLoading(false)
      isFetchingRef.current = false
    }
  }, [user, avatarFetched, updateBlobUrl])

  // Stocker la fonction dans le ref
  useEffect(() => {
    fetchAvatarRef.current = fetchAvatar
  }, [fetchAvatar])

  // G�rer les changements d'utilisateur
  useEffect(() => {
    if (user?.id !== previousUserId) {
      setPreviousUserId(user?.id)
      // Reset tous les �tats quand l'utilisateur change
      setAvatarFetched(false)
      updateBlobUrl(null)
      setAvatarLoading(false)
      isFetchingRef.current = false
    }
  }, [user?.id, previousUserId, updateBlobUrl])

  // Charger l'avatar automatiquement
  useEffect(() => {
    if (user && !avatarFetched && !avatarLoading && fetchAvatarRef.current) {
      fetchAvatarRef.current()
    }
  }, [user, avatarFetched, avatarLoading])

  // Cleanup
  useEffect(() => {
    return () => {
      if (
        avatarBlobUrl &&
        typeof URL !== 'undefined' &&
        typeof URL.revokeObjectURL === 'function'
      ) {
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
      updateBlobUrl(null)
    }
  }
}
