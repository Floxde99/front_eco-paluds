import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Factory, Truck, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'

const examples = [
  {
    icon: Factory,
    from: 'Industriel métallurgie',
    to: 'Entreprise BTP',
    resource: 'Chutes d\'acier → Matière première',
  },
  {
    icon: Package,
    from: 'Fabricant emballages',
    to: 'Commerce de gros',
    resource: 'Cartons usagés → Recyclage',
  },
  {
    icon: Truck,
    from: 'Transporteur',
    to: 'Plusieurs PME',
    resource: 'Palettes → Réutilisation',
  },
]

export function Testimonial() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-6 py-16 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
            Exemples de synergies
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Des échanges concrets entre entreprises</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Découvrez comment les entreprises de la zone des Paluds créent de la valeur ensemble.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {examples.map(({ icon: Icon, from, to, resource }) => (
            <div key={from} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <Icon className="h-8 w-8 text-blue-600 mb-4" />
              <div className="space-y-2 text-sm">
                <p className="text-slate-600"><span className="font-medium text-slate-900">{from}</span></p>
                <p className="text-emerald-600 font-medium">↓ {resource}</p>
                <p className="text-slate-600"><span className="font-medium text-slate-900">{to}</span></p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-6">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="text-white text-center sm:text-left">
              <h3 className="text-xl font-bold mb-1">Prêt à rejoindre le réseau ?</h3>
              <p className="text-blue-100 text-sm">Inscription gratuite · Aucun engagement</p>
            </div>
            <Link to="/login?mode=signup">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold">
                Créer mon compte
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonial
