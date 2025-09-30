import { NavbarProvider } from '@/components/navigation/navbar-context'
import { useNavbarController } from '@/components/navigation/useNavbarController'
import { useNavbar } from '@/components/navigation/useNavbar'
import NavbarBrand from '@/components/navigation/NavbarBrand'
import NavbarDesktopGuest from '@/components/navigation/NavbarDesktopGuest'
import NavbarDesktopAuth from '@/components/navigation/NavbarDesktopAuth'
import NavbarMobileMenu from '@/components/navigation/NavbarMobileMenu'

function NavbarContent() {
  const { isAuthenticated } = useNavbar()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <NavbarBrand />
          {isAuthenticated ? <NavbarDesktopAuth /> : <NavbarDesktopGuest />}
          <NavbarMobileMenu />
        </div>
      </div>
    </nav>
  )
}

export default function Navbar() {
  const controller = useNavbarController()

  return (
    <NavbarProvider value={controller}>
      <NavbarContent />
    </NavbarProvider>
  )
}
