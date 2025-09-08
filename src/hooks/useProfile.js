import { useState, useEffect, useCallback } from 'react'
import { getProfileCompletion, updateUserProfile, uploadAvatar } from '@/services/Api'
import { useAuth } from './useAuthHook'
import { toast } from 'sonner'

export function useProfile() {
  const { user, updateUser } = useAuth()
  const [completion, setCompletion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  // Fetch profile completion data
  const fetchCompletion = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const completionData = await getProfileCompletion()
      setCompletion(completionData)
      setError(null)
    } catch (err) {
      console.error('Error fetching completion:', err)
      // Mock temporaire en attendant l'implémentation backend
      const mockCompletion = {
        completion_percentage: calculateMockCompletion(user),
        missing_fields: [],
        completed_fields: []
      }
      setCompletion(mockCompletion)
      setError(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Fonction temporaire pour calculer la complétude
  const calculateMockCompletion = (userData) => {
    if (!userData) return 0
    
    let completedFields = 0
    const totalFields = 7 // Nombre total de champs importants
    
    if (userData.firstName) completedFields++
    if (userData.lastName) completedFields++
    if (userData.email) completedFields++
    if (userData.phone) completedFields++
    if (userData.role) completedFields++
    if (userData.companyCount > 0) completedFields++
    if (userData.isConfirmed) completedFields++
    
    return Math.round((completedFields / totalFields) * 100)
  }

  // Update profile
  const updateProfile = useCallback(async (profileData) => {
    setUpdating(true)
    try {
      const result = await updateUserProfile(profileData)
      updateUser(result.user)
      
      // Refresh completion data
      await fetchCompletion()
      
      toast.success('Profil mis à jour avec succès')
      return result
    } catch (err) {
      console.error('Error updating profile:', err)
      toast.error('Erreur lors de la mise à jour du profil')
      throw err
    } finally {
      setUpdating(false)
    }
  }, [updateUser, fetchCompletion])

  // Upload avatar
  const updateAvatar = useCallback(async (file) => {
    setUpdating(true)
    try {
      const result = await uploadAvatar(file)
      
      // Update user with new avatar URL - utiliser la structure correcte de la réponse
      updateUser({
        ...user,
        avatar_url: result.user?.avatar_url || result.avatar_url
      })
      
      // Refresh completion data
      await fetchCompletion()
      
      toast.success('Photo de profil mise à jour')
      return result
    } catch (err) {
      console.error('Error uploading avatar:', err)
      toast.error('Erreur lors du téléchargement de la photo')
      throw err
    } finally {
      setUpdating(false)
    }
  }, [user, updateUser, fetchCompletion])

  // Fetch completion on user change
  useEffect(() => {
    if (user) {
      fetchCompletion()
    }
  }, [user, fetchCompletion])

  return {
    completion,
    loading,
    updating,
    error,
    updateProfile,
    updateAvatar,
    refreshCompletion: fetchCompletion
  }
}
