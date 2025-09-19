import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/Avatar'
import { logoutUser } from '@/services/Api'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu, LogOut, Home, User, Settings } from 'lucide-react'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      const res = await logoutUser()
      // clear local auth context regardless
      logout()

      if (res?.ok) {
        toast.success('Déconnexion réussie côté serveur')
      } else if (res?.status === 401 || res?.status === 403) {
        toast.info('Session déjà expirée côté serveur — déconnecté localement')
      } else if (res?.status >= 500) {
        toast.info('Déconnecté localement (erreur serveur lors de la révocation)')
      } else {
        toast.info('Déconnecté localement')
      }

      navigate('/')
    } catch {
      logout()
      toast.info('Déconnecté localement')
      navigate('/')
    }
  }

  const navigationItems = [
    { title: 'Accueil', href: '/', icon: Home },
    { title: 'Dashboard', href: '/home', icon: User, protected: true },
  ]

  const userMenuItems = [
    { title: 'Profil', href: '/profile', icon: User },
    { title: 'Paramètres', href: '/settings', icon: Settings },
  ]

  const PublicNavbar = () => (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.jpg" alt="EcoConnect Paluds" className="h-8 w-8" />
            <span className="text-xl font-bold text-gray-900">EcoConnect Paluds</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:!flex items-center space-x-8">
            <Link
              to="/"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Accueil
            </Link>
            <Link
              to="/login"
              className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Connexion
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>
                    Navigation du site EcoConnect Paluds
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <Link
                    to="/"
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    <Home className="h-4 w-4" />
                    <span>Accueil</span>
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Connexion</span>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )

  const AuthenticatedNavbar = () => (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.jpg" alt="EcoConnect Paluds" className="h-8 w-8" />
            <span className="text-xl font-bold text-gray-900">EcoConnect Paluds</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:!flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              )
            })}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar size="md" className="h-10 w-10" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.prenom} {user?.nom}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
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
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>
                    Bonjour {user?.prenom} ! Navigation du dashboard
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar size="md" />
                    <div>
                      <p className="text-sm font-medium">{user?.prenom} {user?.nom}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  
                  {/* Navigation Items */}
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    )
                  })}
                  
                  {/* User Menu Items */}
                  {userMenuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    )
                  })}
                  
                  {/* Logout */}
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsOpen(false)
                    }}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md text-left w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )

  return isAuthenticated ? <AuthenticatedNavbar /> : <PublicNavbar />
}
