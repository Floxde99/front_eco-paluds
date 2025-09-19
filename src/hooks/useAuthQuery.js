import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getCurrentUser, updateUserProfile, uploadAvatar, deleteAvatar } from '@/services/Api'
import { dashboardKeys } from './useDashboardQuery'

// Query keys for auth/profile
export const authKeys = {
  all: ['auth'],
  user: () => [...authKeys.all, 'user'],
}

// Hook for current user with React Query
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors (401, 403)
      if (error?.status === 401 || error?.status === 403) {
        return false
      }
      return failureCount < 2
    },
  })
}

// Optimistic profile update mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
  mutationFn: updateUserProfile,
    // Optimistic update
    onMutate: async (newProfileData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: authKeys.user() })
      
      // Snapshot previous value
      const previousUser = queryClient.getQueryData(authKeys.user())
      
      // Optimistically update cache
      queryClient.setQueryData(authKeys.user(), (old) => ({
        ...old,
        user: {
          ...old?.user,
          ...newProfileData,
        }
      }))
      
      // Return context with previous and new data
      return { previousUser, newProfileData }
    },
    onSuccess: (data) => {
      // Update cache with real server response
      if (data?.user) {
        queryClient.setQueryData(authKeys.user(), data)
      }
      // Invalidate completion as profile changes affect it
      queryClient.invalidateQueries({ queryKey: dashboardKeys.completion() })
      toast.success('Profil mis à jour avec succès')
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(authKeys.user(), context.previousUser)
      }
      const message = error?.body?.error || error?.message || 'Erreur lors de la mise à jour'
      toast.error(message)
    },
    onSettled: () => {
      // Always refetch after success or error
      queryClient.invalidateQueries({ queryKey: authKeys.user() })
    },
  })
}

// Optimistic avatar upload mutation
export function useUploadAvatar() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (file) => {
      // 🗑️ SUPPRIMER L'ANCIEN AVATAR AVANT L'UPLOAD
      try {
        await deleteAvatar()
      } catch (deleteError) {
        console.warn('⚠️ Impossible de supprimer l\'ancien avatar:', deleteError.message)
        // Ne pas bloquer l'upload si la suppression échoue
      }
      
      // 📤 UPLOADER LE NOUVEAU AVATAR
      return uploadAvatar(file)
    },
    // Optimistic update
    onMutate: async (file) => {
      await queryClient.cancelQueries({ queryKey: authKeys.user() })
      
      const previousUser = queryClient.getQueryData(authKeys.user())
      
      // Create temporary URL for optimistic UI
      const tempAvatarUrl = URL.createObjectURL(file)
      
      queryClient.setQueryData(authKeys.user(), (old) => ({
        ...old,
        user: {
          ...old?.user,
          avatar_url: tempAvatarUrl,
          _isOptimistic: true, // Flag to show loading state
        }
      }))
      
      return { previousUser, tempAvatarUrl }
    },
    onSuccess: (data, file, context) => {
      // Clean up temporary URL
      if (context?.tempAvatarUrl) {
        URL.revokeObjectURL(context.tempAvatarUrl)
      }
      
      // Update with real avatar URL + force refresh
      if (data?.user?.avatar_url) {
        queryClient.setQueryData(authKeys.user(), (old) => ({
          ...old,
          user: {
            ...old?.user,
            avatar_url: data.user.avatar_url,
            _isOptimistic: false,
            _lastUpdate: Date.now(), // 🔥 AJOUT : Timestamp pour forcer re-render
          }
        }))
      }
      
      // 🔥 AJOUT : Invalidation forcée du cache
      queryClient.invalidateQueries({ queryKey: authKeys.user(), refetchType: 'none' })
      
      // Invalidate completion as avatar affects profile completion
      queryClient.invalidateQueries({ queryKey: dashboardKeys.completion() })
      toast.success('Avatar mis à jour avec succès')
    },
    onError: (error, file, context) => {
      // Clean up and rollback
      if (context?.tempAvatarUrl) {
        URL.revokeObjectURL(context.tempAvatarUrl)
      }
      
      if (context?.previousUser) {
        queryClient.setQueryData(authKeys.user(), context.previousUser)
      }
      
      // Show appropriate error message based on status
      let message = 'Erreur lors du téléchargement'
      if (error?.status === 413) {
        message = 'Fichier trop volumineux (max 5MB)'
      } else if (error?.status === 415) {
        message = 'Type de fichier non supporté (PNG, JPG, WEBP uniquement)'
      } else if (error?.status === 422) {
        message = 'Fichier invalide'
      } else if (error?.body?.error) {
        message = error.body.error
      }
      
      toast.error(message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() })
    },
  })
}

// Hook to invalidate auth cache
export function useInvalidateAuth() {
  const queryClient = useQueryClient()
  
  return {
    invalidateUser: () => queryClient.invalidateQueries({ queryKey: authKeys.user() }),
    clearUser: () => queryClient.removeQueries({ queryKey: authKeys.user() }),
  }
}
