import React from 'react'
import { Link } from 'react-router-dom'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-r from-slate-900 via-blue-900 to-blue-700 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <img src="/logo.jpg" alt="Ecopaluds" className="h-10 w-10 rounded-lg object-cover ring-2 ring-white/20" />
          <div className="space-y-2">
            <p className="text-lg font-semibold">Ecopaluds</p>
            <p className="text-sm text-slate-100/80 leading-relaxed">
              La plateforme d&apos;économie circulaire des Paluds pour connecter dirigeants, synergies et opportunités locales.
            </p>
            <div className="text-[11px] uppercase tracking-[0.18em] text-amber-100/80">
              Réseau business · Impact durable
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-100">Navigation</p>
            <Link className="block text-slate-100/80 hover:text-white transition-colors" to="/">Accueil</Link>
            <Link className="block text-slate-100/80 hover:text-white transition-colors" to="/annuaire">Annuaire</Link>
            <Link className="block text-slate-100/80 hover:text-white transition-colors" to="/abonnement">Abonnement</Link>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-100">Légal</p>
            <Link className="block text-slate-100/80 hover:text-white transition-colors" to="/mentions-legales">Mentions légales</Link>
            <Link className="block text-slate-100/80 hover:text-white transition-colors" to="/politique-confidentialite">Politique de confidentialité</Link>
            <Link className="block text-slate-100/80 hover:text-white transition-colors" to="/cgu">CGU</Link>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-100">Contact</p>
            <span className="block text-slate-100/80">support@ecopaluds.fr</span>
            <span className="block text-slate-100/80">+33 (0)4 00 00 00 00</span>
            <span className="block text-slate-100/80">Zone des Paluds · Aubagne</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-slate-100/70 text-center md:text-left">
          © {year} Ecopaluds. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}

export default Footer
