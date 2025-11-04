import { Button } from '@/components/ui/button'
import { SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import clsx from 'clsx'

export function NavbarMobileTrigger({ textClassName = 'text-gray-900' }) {
  const triggerClasses =
    textClassName === 'text-white'
      ? 'text-white hover:bg-white/10'
      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'

  return (
    <SheetTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className={clsx('rounded-full', triggerClasses)}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Ouvrir le menu</span>
      </Button>
    </SheetTrigger>
  )
}

export default NavbarMobileTrigger
