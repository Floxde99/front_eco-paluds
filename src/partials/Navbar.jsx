import { useLocation } from 'react-router-dom'
import { Search, Settings, MoreVertical } from 'lucide-react'
import { NavbarProvider } from '@/components/navigation/navbar-context'
import { useNavbarController } from '@/components/navigation/useNavbarController'
import { useNavbar } from '@/components/navigation/useNavbar'
import NavbarBrand from '@/components/navigation/NavbarBrand'
import NavbarDesktopGuest from '@/components/navigation/NavbarDesktopGuest'
import NavbarDesktopAuth from '@/components/navigation/NavbarDesktopAuth'
import NavbarMobileMenu from '@/components/navigation/NavbarMobileMenu'
import { Button } from '@/components/ui/button'

const ADMIN_DASHBOARD_PATH = "/admin"

function NavbarContent() {
  const { isAuthenticated } = useNavbar()
  const location = useLocation()
  const isPremiumPage = location.pathname === '/suggestions' || location.pathname === '/import-ia'
  const isAdminDashboard = location.pathname.startsWith(ADMIN_DASHBOARD_PATH)

  const navbarClasses = isAdminDashboard
    ? 'bg-[#d74444] text-white border-b border-[#c43c3c]'
    : isPremiumPage
      ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 text-white shadow-md border-b border-blue-500/60'
      : 'bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white shadow-md border-b border-blue-500/60'

  const contentMaxWidth = isAdminDashboard ? 'max-w-6xl' : 'max-w-7xl'
  const textColorClass = isAdminDashboard ? 'text-white' : 'text-white'

  return (
    <>
      <nav className={navbarClasses}>
        <div className={`${contentMaxWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
          <div className="flex justify-between items-center h-16">
            <NavbarBrand textClassName={textColorClass} />
            {isAuthenticated ? (
              <NavbarDesktopAuth textClassName={textColorClass} />
            ) : (
              <NavbarDesktopGuest textClassName={textColorClass} />
            )}
            <NavbarMobileMenu textClassName={textColorClass} />
          </div>
        </div>
      </nav>
      {isAdminDashboard && (
        <div className="bg-[#d74444] text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-8 pt-6 md:flex-row md:items-center md:justify-between md:gap-8">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-white/20 text-lg font-semibold uppercase text-white">
                Eco
              </div>
              <div>
                <p className="text-lg font-semibold">EcoConnect Admin</p>
                <p className="text-sm text-white/80">
                  Tableau de pilotage de la plateforme
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row md:items-center">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/70" />
                <input
                  type="search"
                  placeholder="Recherche rapide..."
                  className="h-11 w-full rounded-lg bg-white/10 pl-10 pr-3 text-sm placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/70"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  className="h-11 rounded-full bg-white/10 px-4 text-white hover:bg-white/20"
                >
                  <Settings className="size-4" />
                  Préférences
                </Button>
                <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium">
                  <div className="size-8 rounded-full bg-white/30" />
                  Admin
                  <MoreVertical className="size-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
