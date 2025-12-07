import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Bookmark, Package, Search, Clock } from 'lucide-react'

function getCompatibilityStyles(compatibility = 0) {
  if (compatibility >= 70) {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }
  if (compatibility >= 40) {
    return 'bg-amber-100 text-amber-700 border-amber-200'
  }
  return 'bg-slate-100 text-slate-700 border-slate-200'
}

export default function SuggestionCard({ suggestion, onIgnore, onSave, onContact }) {
  const compatibilityStyles = getCompatibilityStyles(suggestion.compatibility)

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-0">
        <SuggestionCardHeader suggestion={suggestion} compatibilityStyles={compatibilityStyles} />
        <SuggestionReasons reasons={suggestion.reasons} />
        <SuggestionDescription description={suggestion.description} tags={suggestion.tags} />
        <SuggestionOfferDemand
          offer={suggestion.whatTheyOffer}
          demand={suggestion.whatTheyWant}
        />
        <SuggestionActions
          suggestionId={suggestion.id}
          onIgnore={onIgnore}
          onSave={onSave}
          onContact={onContact}
        />
      </CardContent>
    </Card>
  )
}

function SuggestionCardHeader({ suggestion, compatibilityStyles }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
      <div className="flex-1">
        <div className="flex flex-col gap-1 mb-2 sm:flex-row sm:items-center sm:gap-3">
          <h3 className="text-xl font-semibold text-slate-900">{suggestion.company}</h3>
          {suggestion.status === 'nouveau' && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold uppercase text-red-600">
              Nouveau
            </span>
          )}
        </div>
        <p className="text-sm text-slate-600 mb-1">{suggestion.activity}</p>
        <p className="text-xs text-slate-500">{suggestion.distance} km</p>
      </div>
      <div className="flex items-center gap-2 sm:justify-end">
        <div className={`rounded-lg border px-3 py-1.5 ${compatibilityStyles}`}>
          <p className="text-sm font-bold">{suggestion.compatibility}% compatible</p>
        </div>
        <Button variant="ghost" size="icon">
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function SuggestionReasons({ reasons }) {
  if (!reasons?.length) return null

  return (
    <div className="bg-slate-50 p-4 sm:p-6 border-b border-slate-200">
      <h4 className="text-sm font-semibold text-slate-900 mb-3">Pourquoi cette suggestion ?</h4>
      <ul className="space-y-2">
        {reasons.map((reason, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-slate-700">{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SuggestionDescription({ description, tags }) {
  if (!description) return null

  return (
    <div className="bg-slate-50 p-4 sm:p-6 border-b border-slate-200">
      <h4 className="text-sm font-semibold text-slate-900 mb-2">Opportunité de partenariat</h4>
      <p className="text-sm text-slate-700">{description}</p>
      {tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 border border-amber-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function SuggestionOfferDemand({ offer, demand }) {
  if (!offer && !demand) return null

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 md:grid-cols-2">
      {offer && (
        <OfferDemandColumn
          icon={<Package className="h-4 w-4 text-emerald-700" />}
          label={offer.label}
          items={offer.items}
          iconContainerClass="bg-emerald-100"
        />
      )}
      {demand && (
        <OfferDemandColumn
          icon={<Search className="h-4 w-4 text-blue-700" />}
          label={demand.label}
          items={demand.items}
          iconContainerClass="bg-blue-100"
        />
      )}
    </div>
  )
}

function OfferDemandColumn({ icon, label, items, iconContainerClass }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <div className={`rounded-md p-1.5 ${iconContainerClass}`}>{icon}</div>
        {label}
      </div>
      <ul className="space-y-1.5 pl-9">
        {items?.map((item, idx) => (
          <li key={idx} className="text-sm text-slate-600">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function SuggestionActions({ suggestionId, onIgnore, onSave, onContact }) {
  return (
    <div className="flex flex-col gap-3 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          variant="outline"
          className="gap-2 w-full sm:w-auto"
          onClick={() => onIgnore?.(suggestionId)}
        >
          Ignorer
        </Button>
        <Button
          variant="outline"
          className="gap-2 w-full sm:w-auto"
          onClick={() => onSave?.(suggestionId)}
        >
          <Clock className="h-4 w-4" />
          Sauvegarder
        </Button>
      </div>
      <Button
        className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
        onClick={() => onContact?.(suggestionId)}
      >
        Prendre contact
      </Button>
    </div>
  )
}
