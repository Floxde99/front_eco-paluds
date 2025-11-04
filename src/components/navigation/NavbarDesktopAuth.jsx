import NavbarNavigationLinks from './NavbarNavigationLinks'
import NavbarUserMenu from './NavbarUserMenu'
import { useNavbar } from './useNavbar'

export function NavbarDesktopAuth({ textClassName = 'text-gray-700' }) {
  const { navigationItems } = useNavbar()

  return (
    <div className="hidden md:!flex items-center space-x-6">
      <NavbarNavigationLinks
        items={navigationItems}
        className="items-center gap-4"
        textClassName={textClassName}
      />
      <NavbarUserMenu textClassName={textClassName} />
    </div>
  )
}

export default NavbarDesktopAuth
