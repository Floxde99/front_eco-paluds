import { Link } from 'react-router-dom'

export function NavbarNavigationLinks({ items, className = '' }) {
  return (
    <div className={`flex items-start gap-2 ${className}`}>
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={item.onClick}
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors w-full"
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.title}</span>
          </Link>
        )
      })}
    </div>
  )
}

export default NavbarNavigationLinks
