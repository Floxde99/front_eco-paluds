import { useQuery } from '@tanstack/react-query'
import {
  fetchAdminMetrics,
  fetchAdminCompanies,
  fetchAdminSystemStats,
} from '@/services/AdminApi'

export const adminDashboardKeys = {
  all: ['admin-dashboard'],
  metrics: () => [...adminDashboardKeys.all, 'metrics'],
  companies: (params = {}) => [
    ...adminDashboardKeys.all,
    'companies',
    params,
  ],
  stats: () => [...adminDashboardKeys.all, 'system-stats'],
}

export function useAdminMetrics(options = {}) {
  return useQuery({
    queryKey: adminDashboardKeys.metrics(),
    queryFn: fetchAdminMetrics,
    staleTime: 60 * 1000,
    ...options,
  })
}

export function useAdminCompanies(params = {}, options = {}) {
  return useQuery({
    queryKey: adminDashboardKeys.companies(params),
    queryFn: () => fetchAdminCompanies(params),
    keepPreviousData: true,
    staleTime: 30 * 1000,
    ...options,
  })
}

export function useAdminSystemStats(options = {}) {
  return useQuery({
    queryKey: adminDashboardKeys.stats(),
    queryFn: fetchAdminSystemStats,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}
