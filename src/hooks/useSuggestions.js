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
 * Hook to fetch all suggestions
 */
export function useSuggestions() {
  return useQuery({
    queryKey: suggestionsKeys.list(),
    queryFn: async () => {
      try {
        const data = await fetchSuggestions()
        return data
      } catch (error) {
        console.error('❌ Error fetching suggestions:', error)
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
        const data = await fetchSuggestionsStats()
        return data
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
