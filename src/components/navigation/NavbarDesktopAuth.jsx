import NavbarNavigationLinks from './NavbarNavigationLinks'
import NavbarUserMenu from './NavbarUserMenu'
import { useNavbar } from './useNavbar'

export function NavbarDesktopAuth() {
  const { navigationItems } = useNavbar()

  return (
    <div className="hidden md:!flex items-center space-x-6">
      <NavbarNavigationLinks items={navigationItems} className="items-center gap-4" />
      <NavbarUserMenu />
    </div>
  )
}

export default NavbarDesktopAuth
