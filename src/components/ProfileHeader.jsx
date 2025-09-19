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
  const [avatarBlobUrl, setAvatarBlobUrl] = useState(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarFetched, setAvatarFetched] = useState(false)
  const [previousUserId, setPreviousUserId] = useState(user?.id)
  const fetchAvatarRef = useRef(null)
  const retryTimeoutRef = useRef(null)
  const isFetchingRef = useRef(false)

  const fetchAvatar = useCallback(async () => {
    if (!user?.avatar_url || avatarFetched || isFetchingRef.current) {
      return
    }

    isFetchingRef.current = true
    setAvatarFetched(true)
    setAvatarLoading(true)
    
    try {
      const blob = await getAvatar()
      const blobUrl = URL.createObjectURL(blob)
      setAvatarBlobUrl(blobUrl)
    } catch (error) {
      if (error?.status === 404) {
        setAvatarBlobUrl(null)
      }
      setAvatarBlobUrl(null)
    } finally {
      setAvatarLoading(false)
      isFetchingRef.current = false
    }
  }, [user?.avatar_url, avatarFetched])

  useEffect(() => {
    fetchAvatarRef.current = fetchAvatar
  }, [fetchAvatar])

  useEffect(() => {
    if (user?.id !== previousUserId) {
      setPreviousUserId(user?.id)
      setAvatarFetched(false)
      setAvatarBlobUrl(null)
      setAvatarLoading(false)
      isFetchingRef.current = false
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [user?.id, previousUserId])

  useEffect(() => {
    if (user?.avatar_url && !avatarFetched && !avatarLoading && fetchAvatarRef.current) {
      fetchAvatarRef.current()
    }
  }, [user?.avatar_url, avatarFetched, avatarLoading])

  useEffect(() => {
    return () => {
      if (avatarBlobUrl) {
        URL.revokeObjectURL(avatarBlobUrl)
      }
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
      setAvatarFetched(false)
      setAvatarBlobUrl(null)
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
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : avatarBlobUrl ? (
            <img
              src={avatarBlobUrl}
              alt={getDisplayName()}
              className="w-full h-full object-cover"
              onError={() => {
                setAvatarBlobUrl(null)
              }}
            />
          ) : (
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
