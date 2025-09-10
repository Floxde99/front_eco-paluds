import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { confirmEmail } from '@/services/Api'
import { useAuth } from '@/contexts/AuthContext'

export default function ConfirmEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  useEffect(() => {
    // Extraction du token depuis les paramètres de requête
    const token = searchParams.get('token')
    
    if (!token) {
      toast.error('Token manquant dans l\'URL')
      navigate('/login')
      return
    }
    const verifyEmail = async () => {
      try {
        // Si l'utilisateur est déjà connecté, rediriger avec un message différent
        if (user) {
          toast.info('Votre email est déjà confirmé !', {
            duration: 4000,
            action: {
              label: 'Aller à l\'accueil',
              onClick: () => navigate('/home')
            }
          })
          setTimeout(() => navigate('/home'), 2000)
          return
        }

        // Vérifier le token d'email
        await confirmEmail(token)

        // ✅ SUCCÈS : Email confirmé
        toast.success(
          '🎉 Email confirmé avec succès ! Vous pouvez maintenant vous connecter.',
          {
            duration: 6000,
            action: {
              label: 'Se connecter',
              onClick: () => navigate('/login')
            }
          }
        )

        // Redirection automatique vers login
        setTimeout(() => navigate('/login'), 3000)

      } catch (error) {
        console.error('Email confirmation error:', error)

        let errorMessage = 'Erreur lors de la confirmation de l\'email'

        if (error?.response?.status === 400) {
          errorMessage = 'Token de confirmation invalide'
        } else if (error?.response?.status === 401) {
          errorMessage = 'Token expiré. Veuillez demander un nouveau lien de confirmation.'
        } else if (error?.response?.status === 404) {
          errorMessage = 'Utilisateur non trouvé'
        } else if (error?.response?.status === 409) {
          errorMessage = 'Cet email est déjà confirmé'
        } else if (error?.response?.status >= 500) {
          errorMessage = 'Erreur du serveur. Veuillez réessayer plus tard.'
        }

        // ❌ ERREUR : Afficher le message d'erreur
        toast.error(errorMessage, {
          duration: 6000,
          action: {
            label: 'Retour à la connexion',
            onClick: () => navigate('/login')
          }
        })

        // Redirection vers login après l'erreur
        setTimeout(() => navigate('/login'), 4000)
      }
    }

    verifyEmail()
  }, [searchParams, navigate, user])

  // Affichage pendant le chargement
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Confirmation de l'email
        </h2>
        <p className="text-gray-500">
          Vérification en cours...
        </p>
      </div>
    </div>
  )
}
