import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import NavbarNavigationLinks from './NavbarNavigationLinks'
import { useNavbar } from './useNavbar'
import NavbarMobileUserCard from './NavbarMobileUserCard'
import NavbarMobileActions from './NavbarMobileActions'

const buildGuestItems = (navigationItems = []) => [
  { title: 'Accueil', href: '/', icon: navigationItems[0]?.icon },
  { title: 'Connexion', href: '/login', icon: navigationItems[1]?.icon },
]

export function NavbarMobileContent({ textClassName = 'text-gray-700' }) {
  const {
    user,
    isAuthenticated,
    navigationItems,
    userMenuItems,
    closeMobile,
    handleLogout,
  } = useNavbar()
  const greetingName = user?.firstName ?? user?.prenom ?? user?.nom ?? ''

  const items = isAuthenticated
    ? [...navigationItems, ...userMenuItems]
    : buildGuestItems(navigationItems)

  return (
    <SheetContent side="right" className="gap-3">
      <SheetHeader className="p-3">
        <SheetTitle>Menu</SheetTitle>
        <SheetDescription>
          <p className="text-sm text-muted-foreground">
            {isAuthenticated
              ? `Bonjour ${greetingName || 'utilisateur'} !`
              : 'Navigation du site Ecopaluds'}
          </p>
        </SheetDescription>
      </SheetHeader>
      <div className="grid gap-3 px-3 pb-5">
        {isAuthenticated && <NavbarMobileUserCard user={user} />}

        <NavbarNavigationLinks
          items={items.map((item) => ({ ...item, onClick: closeMobile }))}
          className="flex-col gap-2"
          textClassName={textClassName}
        />

        <NavbarMobileActions
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          onClose={closeMobile}
        />
      </div>
    </SheetContent>
  )
}

export default NavbarMobileContent
