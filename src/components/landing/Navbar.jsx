import React from 'react'
import { Link } from 'react-router-dom'

export function Navbar() {
  return (
    <header className="w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/logo.jpg" alt="EcoConnect Paluds" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-medium text-gray-900">EcoConnect Paluds</span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link to="/login" className="text-gray-600 hover:text-gray-900">Se connecter</Link>
          <Link to="/login?mode=signup" className="bg-blue-600 text-white rounded-md px-3 py-2 hover:bg-blue-700">Créer un compte</Link>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
