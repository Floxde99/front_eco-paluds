import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useNavbar } from './useNavbar'
import clsx from 'clsx'

export function NavbarUserMenu({ textClassName = 'text-gray-700' }) {
  const { user, userMenuItems, handleLogout } = useNavbar()
  const buttonVariant =
    textClassName === 'text-white'
      ? 'text-white hover:bg-white/20'
      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={clsx(
            'relative h-10 w-10 rounded-full',
            buttonVariant
          )}
        >
          <Avatar size="md" className="h-10 w-10" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {[user?.firstName ?? user?.prenom, user?.lastName ?? user?.nom].filter(Boolean).join(' ') || user?.email || 'Utilisateur'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userMenuItems.map((item) => {
          const Icon = item.icon
          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link to={item.href} className="flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2">
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NavbarUserMenu
