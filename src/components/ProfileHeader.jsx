import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useProfileNew } from '@/hooks/useProfileNew'
import { getAvatar } from '@/services/Api'
import { toast } from 'sonner'

export function ProfileHeader() {
  const { user } = useAuth()
  const { updateAvatar, isUploadingAvatar } = useProfileNew()
  const fileInputRef = useRef(null)
  const [avatarBlobUrl, setAvatarBlobUrl] = useState(null) // 🔥 AJOUT : URL blob pour l'avatar
  const [avatarLoading, setAvatarLoading] = useState(false) // 🔥 AJOUT : État de chargement
  const [avatarFetched, setAvatarFetched] = useState(false) // 🔥 AJOUT : État pour éviter les appels répétés
  const [previousUserId, setPreviousUserId] = useState(user?.id) // 🔥 AJOUT : Suivi du changement d'utilisateur
  const fetchAvatarRef = useRef(null) // 🔥 AJOUT : Ref pour éviter les dépendances circulaires
  const retryTimeoutRef = useRef(null) // 🔥 AJOUT : Ref pour gérer les timeouts
  const isFetchingRef = useRef(false) // 🔥 AJOUT : Empêche les requêtes parallèles (StrictMode double mount)

  // 🔥 AJOUT : Effet pour détecter les changements d'avatar
  useEffect(() => {
    if (user?.avatar_url) {
      // Plus besoin de forcer le re-render avec une clé
    }
  }, [user?.avatar_url])

  // 🔥 CORRECTION : Fonction optimisée avec cache
  const fetchAvatar = useCallback(async () => {
    // Éviter les appels répétés ou parallèles
    if (!user?.avatar_url || avatarFetched || isFetchingRef.current) {
      return
    }

    // Marquer immédiatement comme "fetch en cours / déjà traité" pour bloquer le second passage StrictMode
    isFetchingRef.current = true
    setAvatarFetched(true) // ✅ Marqué tôt pour empêcher un second appel concurrent (StrictMode remount)
    setAvatarLoading(true)
    
    try {
      console.log('🔄 Récupération avatar via API...')
      const blob = await getAvatar()
      const blobUrl = URL.createObjectURL(blob)
      console.log('✅ Avatar récupéré avec succès')
      setAvatarBlobUrl(blobUrl)
    } catch (error) {
      console.error('❌ Erreur récupération avatar:', error?.status || error?.message, error)
      // Gestion spécifique des erreurs HTTP
      if (error?.status === 404) {
        console.log('ℹ️ Aucun avatar trouvé')
        setAvatarBlobUrl(null)
      } else if (error?.status === 429) {
        console.warn('⚠️ Limite de débit atteinte, aucune nouvelle tentative')
      } else if (error?.status === 401) {
        console.error('❌ Token invalide ou expiré')
      } else if (error?.status === 403) {
        console.error('❌ Accès refusé')
      } else {
        console.error('❌ Erreur réseau ou serveur')
      }
      setAvatarBlobUrl(null)
    } finally {
      setAvatarLoading(false)
      isFetchingRef.current = false // (On pourrait le laisser à true si on veut vraiment ne jamais retenter avant reset explicite)
    }
  }, [user?.avatar_url, avatarFetched])

  // 🔥 AJOUT : Stocker la fonction dans le ref
  useEffect(() => {
    fetchAvatarRef.current = fetchAvatar
  }, [fetchAvatar])

  // 🔥 CORRECTION : useEffect pour gérer les changements d'utilisateur
  useEffect(() => {
    if (user?.id !== previousUserId) {
      setPreviousUserId(user?.id)
      // Reset tous les états quand l'utilisateur change
      setAvatarFetched(false)
      setAvatarBlobUrl(null)
      setAvatarLoading(false)
      isFetchingRef.current = false
      // 🔥 AJOUT : Nettoyer les timeouts existants
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [user?.id, previousUserId])

  // 🔥 CORRECTION : useEffect pour charger l'avatar automatiquement (utilise le ref)
  useEffect(() => {
    // Appeler fetchAvatar seulement si nécessaire et pas déjà en cours
    if (user?.avatar_url && !avatarFetched && !avatarLoading && fetchAvatarRef.current) {
      fetchAvatarRef.current()
    }
  }, [user?.avatar_url, avatarFetched, avatarLoading]) // Plus de dépendance à fetchAvatar

  // 🔥 CORRECTION : Cleanup amélioré
  useEffect(() => {
    return () => {
      if (avatarBlobUrl) {
        URL.revokeObjectURL(avatarBlobUrl)
      }
      // 🔥 AJOUT : Nettoyer les timeouts au démontage
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [avatarBlobUrl])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB')
      return
    }

    try {
      await updateAvatar(file)
      // 🔥 CORRECTION : Reset de l'état après upload
      setAvatarFetched(false)
      setAvatarBlobUrl(null)
      // Recharger après un court délai en utilisant le ref
      setTimeout(() => {
        if (fetchAvatarRef.current) {
          fetchAvatarRef.current()
        }
      }, 500)
    } catch {
      // Error already handled in mutation
    }
  }

  const getInitials = () => {
    const firstName = user?.firstName || ''
    const lastName = user?.lastName || ''
    if (!firstName || !lastName) return 'U'
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getDisplayName = () => {
    if (!user) return 'Utilisateur'
    const firstName = user?.firstName || ''
    const lastName = user?.lastName || ''
    return `${firstName} ${lastName}`.trim() || 'Utilisateur'
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-gray-400">Chargement...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <button
          onClick={handleAvatarClick}
          disabled={isUploadingAvatar}
          className="relative w-8 h-8 rounded-full overflow-hidden hover:opacity-80 transition-opacity disabled:cursor-not-allowed"
          title="Cliquer pour changer l'avatar"
        >
          {avatarLoading ? (
            // 🔥 AJOUT : Spinner de chargement
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : avatarBlobUrl ? (
            // 🔥 AJOUT : Image chargée via fetch
            <img
              src={avatarBlobUrl}
              alt={getDisplayName()}
              className="w-full h-full object-cover"
              onError={() => {
                console.log('❌ Erreur affichage blob avatar')
                setAvatarBlobUrl(null)
              }}
            />
          ) : (
            // 🔥 AJOUT : Fallback avec initiales
            <div className="w-full h-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {getInitials()}
              </span>
            </div>
          )}
          {isUploadingAvatar && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      <span className="text-sm font-medium text-gray-700">
        {getDisplayName()}
      </span>
      
      <div className="w-4 h-4 text-gray-400 cursor-pointer">
        ⌄
      </div>
    </div>
  )
}
