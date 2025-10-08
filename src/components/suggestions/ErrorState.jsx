import SuggestionsPageHeader from './PageHeader'
import SuggestionsStatsBar from './StatsBar'

export default function SuggestionsErrorState({ stats, error }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <SuggestionsPageHeader />
          <SuggestionsStatsBar stats={stats} />
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">Erreur lors du chargement des suggestions</p>
            <p className="text-red-600 text-sm mt-2">
              {error?.message || 'Une erreur est survenue'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
