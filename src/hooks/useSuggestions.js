import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchSuggestions,
  fetchSuggestionsStats,
  fetchSuggestionsFilters,
  ignoreSuggestion,
  saveSuggestion,
  contactSuggestion,
} from '@/services/SuggestionsApi'

// Query keys for suggestions - centralized for consistency
export const suggestionsKeys = {
  all: ['suggestions'],
  list: () => [...suggestionsKeys.all, 'list'],
  stats: () => [...suggestionsKeys.all, 'stats'],
  filters: () => [...suggestionsKeys.all, 'filters'],
}

/**
 * Transforme une suggestion du format backend vers le format frontend
 */
function transformSuggestion(backendSuggestion) {
  const s = backendSuggestion
  
  // Mapper le status backend vers frontend
  const statusMap = {
    new: 'nouveau',
    saved: 'sauvegardé',
    ignored: 'ignoré',
    contacted: 'contacté'
  }

  // Extraire les raisons comme strings
  const reasons = (s.reasons || []).map(r => 
    typeof r === 'string' ? r : r.message || r.type || ''
  ).filter(Boolean)

  // Construire whatTheyOffer et whatTheyWant à partir des matches
  const whatTheyOffer = s.matches?.backward?.length > 0 ? {
    label: 'Ce qu\'ils proposent',
    items: s.matches.backward.map(m => m.source?.name || m.name || 'Ressource').slice(0, 5)
  } : null

  const whatTheyWant = s.matches?.forward?.length > 0 ? {
    label: 'Ce qu\'ils recherchent',
    items: s.matches.forward.map(m => m.target?.name || m.name || 'Ressource').slice(0, 5)
  } : null

  // Générer une description basée sur la compatibilité
  const description = s.compatibility?.label || 
    `Compatibilité de ${s.compatibility?.score || 0}% basée sur vos ressources`

  return {
    id: s.company?.id || s.interactionId,
    company: s.company?.name || 'Entreprise inconnue',
    companyData: s.company, // Garder les données complètes si besoin
    activity: s.company?.sector || '',
    address: s.company?.address || '',
    distance: s.distanceKm,
    compatibility: s.compatibility?.score || 0,
    compatibilityLabel: s.compatibility?.label || '',
    compatibilityBadge: s.compatibility?.badge || '',
    status: statusMap[s.status] || s.status || 'nouveau',
    reasons,
    description,
    tags: s.tags || [],
    whatTheyOffer,
    whatTheyWant,
    matches: s.matches,
    meta: s.meta,
    createdAt: s.meta?.createdAt || new Date().toISOString()
  }
}

/**
 * Hook to fetch all suggestions
 */
export function useSuggestions() {
  return useQuery({
    queryKey: suggestionsKeys.list(),
    queryFn: async () => {
      try {
        console.log('🔄 Fetching suggestions from API...')
        const response = await fetchSuggestions()
        console.log('📦 Full API Response:', JSON.stringify(response, null, 2))
        
        // fetchSuggestions retourne response.data de axios
        // Le backend retourne { success: true, data: { suggestions: [...] } }
        // Donc response = { success: true, data: { suggestions: [...] } }
        // Et response.data.suggestions = [...]
        let backendSuggestions = []
        
        if (response?.data?.suggestions) {
          // Format: { success, data: { suggestions: [...] } }
          backendSuggestions = response.data.suggestions
          console.log('📋 Found in response.data.suggestions')
        } else if (response?.suggestions) {
          // Format: { suggestions: [...] }
          backendSuggestions = response.suggestions
          console.log('📋 Found in response.suggestions')
        } else if (Array.isArray(response?.data)) {
          // Format: { data: [...] }
          backendSuggestions = response.data
          console.log('📋 Found in response.data (array)')
        } else if (Array.isArray(response)) {
          // Format: [...]
          backendSuggestions = response
          console.log('📋 Found as direct array')
        }
        
        console.log('📋 Backend suggestions count:', backendSuggestions.length)
        
        if (backendSuggestions.length > 0) {
          console.log('📋 First suggestion raw:', backendSuggestions[0])
        }
        
        // Transformer chaque suggestion vers le format frontend
        const suggestions = backendSuggestions.map(transformSuggestion)
        
        console.log('✅ Suggestions loaded:', suggestions.length)
        if (suggestions.length > 0) {
          console.log('📋 First suggestion transformed:', suggestions[0])
        }
        
        return {
          suggestions,
          stats: response?.data?.stats || response?.stats || {},
          total: response?.data?.total || suggestions.length
        }
      } catch (error) {
        console.error('❌ Error fetching suggestions:', error)
        console.error('❌ Error details:', error.response?.data || error.message)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

/**
 * Hook to fetch suggestions statistics
 */
export function useSuggestionsStats() {
  return useQuery({
    queryKey: suggestionsKeys.stats(),
    queryFn: async () => {
      try {
        const response = await fetchSuggestionsStats()
        // Le backend retourne { success: true, data: { stats: { summary, compatibility, status }, engagement, bestMatches } }
        const stats = response?.data?.stats || response?.stats || {}
        const engagement = response?.data?.engagement || {}
        
        return {
          // Structure attendue par le frontend
          total: stats?.summary?.active || 0,
          new: stats?.summary?.newThisWeek || 0,
          high: stats?.compatibility?.distribution?.high || 0,
          medium: stats?.compatibility?.distribution?.medium || 0,
          low: stats?.compatibility?.distribution?.low || 0,
          awaitingResponse: stats?.summary?.awaitingResponse || 0,
          averageCompatibility: stats?.compatibility?.average || 0,
          bestScore: stats?.compatibility?.bestScore || 0,
          engagement,
          bestMatches: response?.data?.bestMatches || []
        }
      } catch (error) {
        console.error('❌ Error fetching suggestions stats:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

/**
 * Hook to fetch available filters
 */
export function useSuggestionsFilters() {
  return useQuery({
    queryKey: suggestionsKeys.filters(),
    queryFn: async () => {
      try {
        const data = await fetchSuggestionsFilters()
        return data
      } catch (error) {
        console.error('❌ Error fetching filters:', error)
        throw error
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (filters rarely change)
    retry: 2,
  })
}

/**
 * Hook to ignore a suggestion
 */
export function useIgnoreSuggestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ignoreSuggestion,
    onMutate: async (suggestionId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: suggestionsKeys.list() })

      // Snapshot previous value
      const previousSuggestions = queryClient.getQueryData(suggestionsKeys.list())

      // Optimistically update - remove from list
      queryClient.setQueryData(suggestionsKeys.list(), (old) => {
        if (!old?.suggestions) return old
        return {
          ...old,
          suggestions: old.suggestions.filter((s) => s.id !== suggestionId),
        }
      })

      return { previousSuggestions }
    },
    onError: (err, suggestionId, context) => {
      // Rollback on error
      if (context?.previousSuggestions) {
        queryClient.setQueryData(suggestionsKeys.list(), context.previousSuggestions)
      }
      console.error('❌ Error ignoring suggestion:', err)
      toast.error('Erreur lors de l\'action')
    },
    onSuccess: () => {
      toast.success('Suggestion ignorée')
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: suggestionsKeys.list() })
      queryClient.invalidateQueries({ queryKey: suggestionsKeys.stats() })
    },
  })
}

/**
 * Hook to save a suggestion
 */
export function useSaveSuggestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveSuggestion,
    onMutate: async (suggestionId) => {
      await queryClient.cancelQueries({ queryKey: suggestionsKeys.list() })

      const previousSuggestions = queryClient.getQueryData(suggestionsKeys.list())

      // Optimistically update status
      queryClient.setQueryData(suggestionsKeys.list(), (old) => {
        if (!old?.suggestions) return old
        return {
          ...old,
          suggestions: old.suggestions.map((s) =>
            s.id === suggestionId ? { ...s, status: 'saved' } : s
          ),
        }
      })

      return { previousSuggestions }
    },
    onError: (err, suggestionId, context) => {
      if (context?.previousSuggestions) {
        queryClient.setQueryData(suggestionsKeys.list(), context.previousSuggestions)
      }
      console.error('❌ Error saving suggestion:', err)
      toast.error('Erreur lors de la sauvegarde')
    },
    onSuccess: () => {
      toast.success('Suggestion sauvegardée')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: suggestionsKeys.list() })
      queryClient.invalidateQueries({ queryKey: suggestionsKeys.stats() })
    },
  })
}

/**
 * Hook to contact a company from a suggestion
 */
export function useContactSuggestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: contactSuggestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suggestionsKeys.list() })
      queryClient.invalidateQueries({ queryKey: suggestionsKeys.stats() })
      toast.success('Demande de contact envoyée avec succès')
    },
    onError: (err) => {
      console.error('❌ Error contacting company:', err)
      const errorMessage = err?.response?.data?.message || 'Erreur lors de l\'envoi de la demande'
      toast.error(errorMessage)
    },
  })
}
