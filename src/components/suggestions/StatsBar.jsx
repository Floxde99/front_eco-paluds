export default function SuggestionsStatsBar({ stats = {} }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-lg bg-white p-4 shadow-sm border border-slate-200">
      <SuggestionsStatBlock
        value={stats.active ?? 0}
        label="Suggestions actives"
        backgroundClass="bg-blue-100"
        textClass="text-blue-600"
      />
      <SuggestionsStatBlock
        value={stats.newThisWeek ?? 0}
        label="Nouvelles cette semaine"
        backgroundClass="bg-emerald-100"
        textClass="text-emerald-600"
      />
      <SuggestionsStatBlock
        value={stats.pending ?? 0}
        label="En attente de réponse"
        backgroundClass="bg-amber-100"
        textClass="text-amber-600"
      />
    </div>
  )
}

function SuggestionsStatBlock({ value = 0, label, backgroundClass, textClass }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md border border-slate-100">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${backgroundClass} ${textClass}`}
      >
        <span className="text-lg font-bold">{value}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
      </div>
    </div>
  )
}
