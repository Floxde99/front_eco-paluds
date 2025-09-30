import { Button } from '@/components/ui/button'
import { SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

export function NavbarMobileTrigger() {
  return (
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon">
        <Menu className="h-6 w-6" />
        <span className="sr-only">Ouvrir le menu</span>
      </Button>
    </SheetTrigger>
  )
}

export default NavbarMobileTrigger
