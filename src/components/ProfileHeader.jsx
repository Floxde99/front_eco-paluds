import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useProfileNew } from '@/hooks/useProfileNew'
import { toast } from 'sonner'

export function ProfileHeader() {
  const { user } = useAuth()
  const { updateAvatar, isUploadingAvatar } = useProfileNew()
  const fileInputRef = useRef(null)

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
      // Success toast is handled in the mutation
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

  const getAvatarUrl = () => {
    if (!user?.avatar_url) return null
    
    // Si l'URL commence par http, c'est déjà une URL complète
    if (user.avatar_url.startsWith('http')) {
      return user.avatar_url
    }
    
    // Sinon, construire l'URL complète avec l'API base URL
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3069"
    return `${API_BASE_URL}${user.avatar_url}`
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
          {getAvatarUrl() ? (
            <img
              src={getAvatarUrl()}
              alt={getDisplayName()}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Si l'image ne peut pas être chargée, utiliser les initiales
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div 
            className="w-full h-full bg-blue-500 flex items-center justify-center"
            style={{ display: getAvatarUrl() ? 'none' : 'flex' }}
          >
            <span className="text-white text-sm font-medium">
              {getInitials()}
            </span>
          </div>
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
