import { Sheet } from '@/components/ui/sheet'
import { useNavbar } from './useNavbar'
import NavbarMobileTrigger from './NavbarMobileTrigger'
import NavbarMobileContent from './NavbarMobileContent'

export function NavbarMobileMenu() {
  const { isMobileOpen, toggleMobile } = useNavbar()

  return (
    <div className="md:hidden">
      <Sheet open={isMobileOpen} onOpenChange={toggleMobile}>
        <NavbarMobileTrigger />
        <NavbarMobileContent />
      </Sheet>
    </div>
  )
}

export default NavbarMobileMenu
