import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getDashboardStats, getUserCompanies, getProfileCompletion } from '@/services/Api'

// Query keys - centralized for consistency
export const dashboardKeys = {
  all: ['dashboard'],
  stats: () => [...dashboardKeys.all, 'stats'],
  companies: () => [...dashboardKeys.all, 'companies'],
  completion: () => [...dashboardKeys.all, 'completion'],
}

// Hook for dashboard stats with React Query
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

// Hook for user companies with React Query
export function useUserCompanies() {
  return useQuery({
    queryKey: dashboardKeys.companies(),
    queryFn: getUserCompanies,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

// Hook for profile completion with React Query
export function useProfileCompletion() {
  return useQuery({
    queryKey: dashboardKeys.completion(),
    queryFn: async () => {
      try {
        const data = await getProfileCompletion()
        return data
      } catch (error) {
        console.error('❌ Error fetching profile completion:', error)
        throw error
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for completion)
    retry: 2,
  })
}

// Combined hook that fetches all dashboard data
export function useDashboardData() {
  const stats = useDashboardStats()
  const companies = useUserCompanies()
  const completion = useProfileCompletion()

  return {
    stats: stats.data,
    companies: companies.data,
    completion: completion.data,
    loading: stats.isLoading || companies.isLoading || completion.isLoading,
    error: stats.error || companies.error || completion.error,
    isStale: stats.isStale || companies.isStale || completion.isStale,
    refetch: () => {
      stats.refetch()
      companies.refetch()
      completion.refetch()
    }
  }
}

// Hook to invalidate dashboard cache (useful after updates)
export function useInvalidateDashboard() {
  const queryClient = useQueryClient()
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
    invalidateStats: () => queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() }),
    invalidateCompanies: () => queryClient.invalidateQueries({ queryKey: dashboardKeys.companies() }),
    invalidateCompletion: () => queryClient.invalidateQueries({ queryKey: dashboardKeys.completion() }),
  }
}
