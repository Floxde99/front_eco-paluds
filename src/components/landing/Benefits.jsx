import React from 'react'
import { Recycle, MapPin, MessageSquare, Sparkles, Users, TrendingUp } from 'lucide-react'

const cards = [
  {
    title: 'Valorisez vos déchets',
    description: 'Vos déchets peuvent être les ressources d\'une autre entreprise. Créez de la valeur à partir de ce que vous jetiez.',
    icon: Recycle,
    color: 'bg-emerald-600',
  },
  {
    title: 'Trouvez des ressources locales',
    description: 'Identifiez les entreprises qui produisent ce dont vous avez besoin, à proximité de votre activité.',
    icon: MapPin,
    color: 'bg-blue-600',
  },
  {
    title: 'Messagerie intégrée',
    description: 'Contactez directement les entreprises partenaires et suivez vos échanges depuis la plateforme.',
    icon: MessageSquare,
    color: 'bg-violet-600',
  },
  {
    title: 'Suggestions intelligentes',
    description: 'Notre algorithme analyse vos besoins et productions pour vous proposer les meilleures synergies.',
    icon: Sparkles,
    color: 'bg-amber-600',
  },
  {
    title: 'Réseau local qualifié',
    description: 'Accédez à l\'annuaire des entreprises de la zone des Paluds, avec leurs spécialités et coordonnées.',
    icon: Users,
    color: 'bg-rose-600',
  },
  {
    title: 'Développez votre activité',
    description: 'Réduisez vos coûts de traitement des déchets et trouvez de nouveaux débouchés pour vos productions.',
    icon: TrendingUp,
    color: 'bg-cyan-600',
  },
]

export function Benefits() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Vos avantages
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Pourquoi rejoindre Ecopaluds ?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Une plateforme pensée pour faciliter l'économie circulaire entre entreprises de la zone industrielle.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ title, description, icon: Icon, color }) => (
            <div key={title} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm hover:shadow-md transition-shadow">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} text-white`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Benefits
