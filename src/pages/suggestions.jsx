import { useMemo, useState } from 'react'
import SuggestionsPageHeader from '@/components/suggestions/PageHeader'
import SuggestionsStatsBar from '@/components/suggestions/StatsBar'
import SuggestionsFilterBar from '@/components/suggestions/FilterBar'
import SuggestionCard from '@/components/suggestions/SuggestionCard'
import SuggestionsEmptyState from '@/components/suggestions/EmptyState'
import SuggestionsLoadingState from '@/components/suggestions/LoadingState'
import SuggestionsErrorState from '@/components/suggestions/ErrorState'
import { SUGGESTION_FILTERS } from '@/components/suggestions/constants'
import {
  useSuggestions,
  useSuggestionsStats,
  useIgnoreSuggestion,
  useSaveSuggestion,
  useContactSuggestion,
} from '@/hooks/useSuggestions'

const DEFAULT_FILTER_ID = SUGGESTION_FILTERS[0]?.id ?? 'all'

export default function SuggestionsPage() {
  const [currentFilter, setCurrentFilter] = useState(DEFAULT_FILTER_ID)

  const {
    data: suggestionsData,
    isLoading: suggestionsLoading,
    error: suggestionsError,
  } = useSuggestions()

  const {
    data: statsData,
    isLoading: statsLoading,
  } = useSuggestionsStats()

  const ignoreMutation = useIgnoreSuggestion()
  const saveMutation = useSaveSuggestion()
  const contactMutation = useContactSuggestion()

  const filteredSuggestions = useMemo(() => {
    const allSuggestions = suggestionsData?.suggestions || []

    switch (currentFilter) {
      case 'high':
        return allSuggestions.filter((suggestion) => suggestion.compatibility >= 70)
      case 'medium':
        return allSuggestions.filter(
          (suggestion) => suggestion.compatibility >= 40 && suggestion.compatibility < 70
        )
      case 'new': {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        return allSuggestions.filter((suggestion) => new Date(suggestion.createdAt) >= oneWeekAgo)
      }
      default:
        return allSuggestions
    }
  }, [suggestionsData, currentFilter])

  const stats = {
    active: statsData?.total ?? 0,
    newThisWeek: statsData?.new ?? 0,
    pending: statsData?.high ?? 0,
  }

  const handleIgnore = (suggestionId) => {
    ignoreMutation.mutate(suggestionId)
  }

  const handleSave = (suggestionId) => {
    saveMutation.mutate(suggestionId)
  }

  const handleContact = (suggestionId) => {
    contactMutation.mutate({
      suggestionId,
      message:
        'Bonjour, je suis intéressé par une collaboration potentielle concernant nos ressources complémentaires.',
      preferredContactMethod: 'email',
    })
  }

  if (suggestionsLoading || statsLoading) {
    return <SuggestionsLoadingState stats={stats} />
  }

  if (suggestionsError) {
    return <SuggestionsErrorState stats={stats} error={suggestionsError} />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <SuggestionsPageHeader />
          <SuggestionsStatsBar stats={stats} />
          <SuggestionsFilterBar currentFilter={currentFilter} onFilterChange={setCurrentFilter} />

          <div className="space-y-4">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onIgnore={handleIgnore}
                  onSave={handleSave}
                  onContact={handleContact}
                />
              ))
            ) : (
              <SuggestionsEmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
