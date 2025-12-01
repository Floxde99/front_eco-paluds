import { QueryClient } from '@tanstack/react-query'
import { QUERY_CONFIG } from '@/config/constants'

// Configuration du client React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: QUERY_CONFIG.STALE_TIME,
      // Keep data in cache for 10 minutes after component unmount
      gcTime: QUERY_CONFIG.GC_TIME,
      // Retry failed requests 3 times
      retry: QUERY_CONFIG.RETRY_COUNT,
      // Refetch when window regains focus
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once
      retry: QUERY_CONFIG.MUTATION_RETRY_COUNT,
    },
  },
})
