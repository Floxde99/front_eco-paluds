import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { logoutUser } from '@/services/Api'
import { Building2, Crown, Home, User, Settings, Sparkles, Upload } from 'lucide-react'

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
      { title: 'Paramètres', href: '/settings', icon: Settings },
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
        toast.success('Déconnexion réussie côté serveur')
      } else if (response?.status === 401 || response?.status === 403) {
        toast.info('Session expirée côté serveur — déconnecté localement')
      } else if (response?.status >= 500) {
        toast.info('Déconnecté localement (erreur serveur)')
      } else {
        toast.info('Déconnecté localement')
      }
    } catch {
      logout()
      toast.info('Déconnecté localement')
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
