import SuggestionsPageHeader from './PageHeader'
import SuggestionsStatsBar from './StatsBar'

export default function SuggestionsLoadingState({ stats }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <SuggestionsPageHeader />
          <SuggestionsStatsBar stats={stats} />
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-slate-200 rounded-lg w-full" />
            <div className="h-64 bg-slate-200 rounded-lg" />
            <div className="h-64 bg-slate-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
