import React from 'react'
import { Building2, Search, Handshake } from 'lucide-react'

const steps = [
  {
    title: 'Créez votre profil entreprise',
    description: 'Renseignez vos informations : secteur d\'activité, productions, besoins en ressources et déchets à valoriser.',
    icon: Building2,
  },
  {
    title: 'Explorez l\'annuaire',
    description: 'Recherchez des partenaires par secteur, type de ressources ou localisation grâce à la carte interactive.',
    icon: Search,
  },
  {
    title: 'Créez des synergies',
    description: 'Contactez les entreprises compatibles via la messagerie intégrée et concrétisez vos partenariats.',
    icon: Handshake,
  },
]

const Step = ({ index, title, description, icon: Icon }) => (
  <div className="relative flex h-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
        {index}
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
        <Icon className="h-5 w-5" />
      </div>
    </div>
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  </div>
)

export function Steps() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-16 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
            Comment ça marche ?
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Rejoignez le réseau en 3 étapes</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Inscription gratuite et rapide pour commencer à développer vos synergies locales.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <Step key={step.title} index={index + 1} {...step} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Steps
