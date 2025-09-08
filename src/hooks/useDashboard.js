import { useState, useEffect, useCallback } from 'react'
import { getDashboardStats, getUserCompanies } from '@/services/Api'
import { useAuth } from './useAuthHook'

export function useDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const [statsData, companiesData] = await Promise.all([
        getDashboardStats(),
        getUserCompanies()
      ])
      
      setStats(statsData)
      setCompanies(companiesData.companies || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching dashboard:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Fetch data on user change
  useEffect(() => {
    if (user) {
      fetchDashboard()
    }
  }, [user, fetchDashboard])

  return {
    stats,
    companies,
    loading,
    error,
    refreshDashboard: fetchDashboard
  }
}
