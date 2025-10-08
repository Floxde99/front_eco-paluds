import React from 'react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 ">
      <div className="mx-auto px-6 py-10 flex flex gap-8 place-content-between">
        <div className="md:col-span-3 flex items-start gap-3">
          <img src="/logo.jpg" alt="Ecopaluds" className="w-8 h-8 rounded object-cover" />
          <div>
            <p className="font-medium">Ecopaluds</p>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              La plateforme de l'économie circulaire
              <br />
              pour la zone industrielle des Paluds
            </p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <Link className="block hover:text-white transition-colors" to="/mentions-legales">Mentions légales</Link>
          <Link className="block hover:text-white transition-colors" to="/politique-confidentialite">Politique de confidentialité</Link>
          <Link className="block hover:text-white transition-colors" to="/cgu">CGU</Link>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-gray-400">
          © {new Date().getFullYear()} Ecopaluds. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}

export default Footer
