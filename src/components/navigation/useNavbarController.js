import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { logoutUser } from '@/services/Api'
import { Building2, Crown, Home, User, Sparkles, Upload } from 'lucide-react'

export function useNavbarController() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navigationItems = useMemo(
    () => [
      { title: 'Accueil', href: '/', icon: Home },
      { title: 'Dashboard', href: '/home', icon: User, protected: true },
      { title: 'Annuaire', href: '/annuaire', icon: Building2, protected: true },
      { title: 'Suggestions', href: '/suggestions', icon: Sparkles, protected: true },
      { title: 'Import IA', href: '/import-ia', icon: Upload, protected: true },
      { title: 'Abonnement', href: '/abonnement', icon: Crown, protected: true },
    ],
    []
  )

  const userMenuItems = useMemo(
    () => [
      { title: 'Profil', href: '/profile', icon: User },
    ],
    []
  )

  const closeMobile = useCallback(() => setIsMobileOpen(false), [])
  const toggleMobile = useCallback(() => setIsMobileOpen((value) => !value), [])

  const goTo = useCallback(
    (href) => {
      navigate(href)
      closeMobile()
    },
    [navigate, closeMobile]
  )

  const handleLogout = useCallback(async () => {
    try {
      const response = await logoutUser()
      logout()

      if (response?.ok) {
        toast.success('Déconnexion réussie')
      } else if (response?.status === 401 || response?.status === 403) {
        toast.info('Session expirée - Déconnexion effectuée')
      } else if (response?.status >= 500) {
        toast.info('Déconnexion effectuée (erreur serveur)')
      } else {
        toast.info('Déconnexion effectuée')
      }
    } catch {
      logout()
      toast.info('Déconnexion effectuée')
    } finally {
      closeMobile()
      navigate('/')
    }
  }, [logout, navigate, closeMobile])

  return {
    user,
    isAuthenticated,
    navigationItems,
    userMenuItems,
    isMobileOpen,
    toggleMobile,
    closeMobile,
    goTo,
    handleLogout,
  }
}

export default useNavbarController
