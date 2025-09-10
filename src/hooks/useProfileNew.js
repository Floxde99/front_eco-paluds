import { useCurrentUser, useUpdateProfile, useUploadAvatar } from './useAuthQuery'
import { useInvalidateDashboard } from './useDashboardQuery'

// Simplified hook that combines auth query hooks for profile management
export function useProfileNew() {
  const { data: currentUserData, isLoading, error, refetch } = useCurrentUser()
  const updateProfileMutation = useUpdateProfile()
  const uploadAvatarMutation = useUploadAvatar()
  const { invalidateCompletion } = useInvalidateDashboard()

  const user = currentUserData?.user

  const updateProfile = (profileData) => {
    return updateProfileMutation.mutateAsync(profileData)
  }

  const updateAvatar = (file) => {
    return uploadAvatarMutation.mutateAsync(file)
  }

  return {
    user,
    loading: isLoading,
    error,
    updateProfile,
    updateAvatar,
    refetch,
    isUpdatingProfile: updateProfileMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    // Helper to refresh completion after manual profile changes
    refreshCompletion: invalidateCompletion,
  }
}
