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

export function NavbarMobileContent() {
  const {
    user,
    isAuthenticated,
    navigationItems,
    userMenuItems,
    closeMobile,
    handleLogout,
  } = useNavbar()

  const items = isAuthenticated
    ? [...navigationItems, ...userMenuItems]
    : buildGuestItems(navigationItems)

  return (
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>Menu</SheetTitle>
        <SheetDescription>
          {isAuthenticated ? `Bonjour ${user?.prenom} !` : 'Navigation du site EcoConnect Paluds'}
        </SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 py-4">
        {isAuthenticated && <NavbarMobileUserCard user={user} />}

        <NavbarNavigationLinks
          items={items.map((item) => ({ ...item, onClick: closeMobile }))}
          className="flex-col gap-2"
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
