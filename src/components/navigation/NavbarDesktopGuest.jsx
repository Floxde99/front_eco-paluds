import { Link } from 'react-router-dom'
import clsx from 'clsx'

export function NavbarDesktopGuest({ textClassName = 'text-slate-700' }) {
  return (
    <div className="hidden md:!flex items-center space-x-8">
      <Link
        to="/"
        className={clsx(
          'px-3 py-2 rounded-md text-sm font-medium transition-colors',
          textClassName === 'text-white'
            ? 'text-white hover:bg-white/10 hover:text-white'
            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100',
          textClassName
        )}
      >
        Accueil
      </Link>
      <Link
        to="/login"
        className={clsx(
          'px-3 py-2 rounded-md text-sm font-medium transition-colors',
          textClassName === 'text-white'
            ? 'text-white bg-white/10 hover:bg-white/20'
            : 'text-white bg-blue-600 hover:bg-blue-700'
        )}
      >
        Connexion
      </Link>
    </div>
  )
}

export default NavbarDesktopGuest
