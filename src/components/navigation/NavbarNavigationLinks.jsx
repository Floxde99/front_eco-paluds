
import { Link } from 'react-router-dom'
import clsx from 'clsx'

export function NavbarNavigationLinks({
  items,
  className = '',
  textClassName = 'text-gray-700',
}) {
  const baseLinkClass =
    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full'

  const variantClass =
    textClassName === 'text-white'
      ? 'text-white hover:bg-white/10 hover:text-white'
      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'

  return (
    <div className={`flex items-start gap-2 ${className}`}>
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={item.onClick}
            className={clsx(baseLinkClass, variantClass, textClassName)}
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
