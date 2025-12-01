import React from 'react'
import { BarChart3, Users, Sparkles } from 'lucide-react'

const modules = [
  {
    title: 'Analyses & flux',
    description: 'Imports, intrants, extrants : centralisez vos donnees et suivez vos gisements.',
    icon: BarChart3,
  },
  {
    title: 'Annuaire partenaires',
    description: 'Matching qualifie, distances et filtres sectoriels pour securiser vos mises en relation.',
    icon: Users,
  },
  {
    title: 'Assistant IA',
    description: 'Reponses guidees, boutons d’action et routes directes vers les modules de l’app.',
    icon: Sparkles,
  },
]

export default function Modules() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
            Modules Eco-Paluds
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Tout ce qu’il faut pour agir vite</h2>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Une palette alignee sur votre logo : teal, bleu clair et vert feuille pour guider vos equipes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {modules.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="flex h-full flex-col gap-3 rounded-2xl border border-teal-100 bg-gradient-to-br from-slate-50 via-white to-sky-50 px-6 py-5 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-500/20">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
