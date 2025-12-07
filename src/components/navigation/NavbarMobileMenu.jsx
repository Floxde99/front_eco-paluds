import { Sheet } from '@/components/ui/sheet'
import { useNavbar } from './useNavbar'
import NavbarMobileTrigger from './NavbarMobileTrigger'
import NavbarMobileContent from './NavbarMobileContent'

export function NavbarMobileMenu({ textClassName = 'text-gray-900' }) {
  const { isMobileOpen, toggleMobile } = useNavbar()

  return (
    <div className="md:hidden">
      <Sheet open={isMobileOpen} onOpenChange={toggleMobile}>
        <NavbarMobileTrigger textClassName={textClassName} />
        <NavbarMobileContent textClassName="text-gray-900" />
      </Sheet>
    </div>
  )
}

export default NavbarMobileMenu
