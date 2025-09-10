import React, { createContext, useState, useEffect, useCallback } from 'react'
import { getDashboardStats, getUserCompanies, getProfileCompletion } from '@/services/Api'
import { useAuth } from '@/contexts/AuthContext'

const DashboardContext = createContext(null)

// module-level cache / inflight promise to dedupe across mounts
let _cache = null
let _inflight = null

export function DashboardProvider({ children }) {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [companies, setCompanies] = useState([])
  const [completion, setCompletion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    if (!user) return

    // return cache when same user
    if (_cache && _cache.userId === user.id) {
      setStats(_cache.data.stats)
      setCompanies(_cache.data.companies)
      setCompletion(_cache.data.completion)
      setError(null)
      return _cache.data
    }

    // if already fetching, wait for it
    if (_inflight) {
      setLoading(true)
      try {
        const data = await _inflight
        setStats(data.stats)
        setCompanies(data.companies)
        setCompletion(data.completion)
        setError(null)
        return data
      } catch (err) {
        setError(err)
        throw err
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    setError(null)
    
    _inflight = Promise.all([
      getDashboardStats(),
      getUserCompanies(),
      getProfileCompletion()
    ])
      .then(([statsData, companiesData, completionData]) => {
        const data = { 
          stats: statsData, 
          companies: companiesData?.companies || [], 
          completion: completionData 
        }
        _cache = { userId: user.id, data }
        return data
      })
      .finally(() => {
        _inflight = null
      })

    try {
      const data = await _inflight
      setStats(data.stats)
      setCompanies(data.companies)
      setCompletion(data.completion)
      setError(null)
      return data
    } catch (err) {
      console.error('Dashboard fetch failed', err)
      setError(err)
      setStats(null)
      setCompanies([])
      setCompletion(null)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchAll()
    } else {
      setStats(null)
      setCompanies([])
      setCompletion(null)
      setError(null)
    }
  }, [user, fetchAll])

  const refresh = useCallback(async () => {
    // clear cache for this user and re-fetch
    if (_cache && user && _cache.userId === user.id) {
      _cache = null
    }
    return fetchAll()
  }, [user, fetchAll])

  return (
    <DashboardContext.Provider value={{ 
      stats, 
      companies, 
      completion, 
      loading, 
      error, 
      refresh 
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export default DashboardContext
