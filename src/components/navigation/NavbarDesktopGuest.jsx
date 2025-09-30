import { Link } from 'react-router-dom'

export function NavbarDesktopGuest() {
  return (
    <div className="hidden md:!flex items-center space-x-8">
      <Link
        to="/"
        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        Accueil
      </Link>
      <Link
        to="/login"
        className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
      >
        Connexion
      </Link>
    </div>
  )
}

export default NavbarDesktopGuest
