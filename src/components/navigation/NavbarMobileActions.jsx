import { LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NavbarMobileActions({ isAuthenticated, onLogout, onClose }) {
  if (isAuthenticated) {
    return (
      <button
        onClick={onLogout}
        className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md text-left w-full"
      >
        <LogOut className="h-4 w-4" />
        <span>Déconnexion</span>
      </button>
    )
  }

  return (
    <Link
      to="/login"
      onClick={onClose}
      className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors text-center"
    >
      Connexion
    </Link>
  )
}

export default NavbarMobileActions
