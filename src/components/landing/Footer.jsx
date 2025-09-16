import React from 'react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 mt-0">
      <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-3 flex items-start gap-3">
          <img src="/logo.jpg" alt="EcoConnect Paluds" className="w-8 h-8 rounded object-cover" />
          <div>
            <p className="font-medium">EcoConnect Paluds</p>
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
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-gray-400">
          © 2024 EcoConnect Paluds. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}

export default Footer
