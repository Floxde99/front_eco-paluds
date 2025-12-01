import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Recycle, Building2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white">
      <div className="absolute inset-0 opacity-30" aria-hidden>
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-blue-400/30 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16 lg:py-24 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide">
            <MapPin className="h-4 w-4" />
            Zone Industrielle des Paluds · Aubagne
          </div>
        </div>

        <div className="space-y-6 text-left lg:max-w-4xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Transformez vos déchets en ressources,<br />
            <span className="text-emerald-400">trouvez vos partenaires locaux</span>
          </h1>
          <p className="max-w-3xl text-lg text-white/85 leading-relaxed">
            Ecopaluds connecte les entreprises de la zone des Paluds pour créer des synergies d'économie circulaire.
            Valorisez vos déchets, trouvez les ressources dont vous avez besoin, et développez votre réseau local.
          </p>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link to="/login?mode=signup">
              <Button size="lg" className="px-7 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                Créer mon compte gratuit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                J'ai déjà un compte
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Building2, label: 'Fiche entreprise', value: 'Présentez votre activité' },
            { icon: Recycle, label: 'Vos flux', value: 'Productions, besoins, déchets' },
            { icon: MapPin, label: 'Carte interactive', value: 'Visualisez les partenaires proches' },
            { icon: MessageSquare, label: 'Messagerie directe', value: 'Échangez facilement' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur"
            >
              <item.icon className="h-5 w-5 text-emerald-400 mb-2" />
              <p className="text-[11px] uppercase tracking-wide text-white/70">{item.label}</p>
              <p className="text-sm font-medium text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
