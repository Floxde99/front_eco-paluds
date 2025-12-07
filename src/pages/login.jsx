import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { loginUser, registerUser, getCurrentUser } from "@/services/Api"
import { queryClient } from "@/lib/queryClient"
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormBuilder } from "@/components/forms/FormBuilder"

const loginSchema = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    placeholder: 'votre@email.com',
  },
  {
    name: 'password',
    label: 'Mot de passe',
    type: 'password',
    required: true,
  },
]

const signupSchema = [
  { name: 'company', label: "Nom de l'entreprise", placeholder: 'Votre entreprise' },
  {
    name: 'lastName',
    label: 'Nom',
    required: true,
  },
  {
    name: 'firstName',
    label: 'Prénom',
    required: true,
  },
  {
    name: 'email',
    label: 'Email professionnel',
    type: 'email',
    required: true,
    placeholder: 'contact@entreprise.com',
  },
  {
    name: 'password',
    label: 'Mot de passe',
    type: 'password',
    required: true,
    helpText: 'Minimum 8 caractères',
  },
  {
    name: 'confirmPassword',
    label: 'Confirmer le mot de passe',
    type: 'password',
    required: true,
  },
  {
    name: 'phone',
    label: 'Téléphone',
    type: 'tel',
    placeholder: 'Votre numéro',
  },
]

const validateLogin = (values) => {
  const errors = {}
  if (!values.email?.trim()) errors.email = "L'email est obligatoire"
  if (!values.password) errors.password = 'Le mot de passe est obligatoire'
  return errors
}

const validateSignup = (values) => {
  const errors = {}
  if (!values.lastName?.trim()) errors.lastName = 'Le nom est obligatoire'
  if (!values.firstName?.trim()) errors.firstName = 'Le prénom est obligatoire'
  if (!values.email?.trim()) errors.email = "L'email est obligatoire"
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Format d\'email invalide'
  if (!values.password) errors.password = 'Le mot de passe est obligatoire'
  else if (values.password.length < 8) errors.password = 'Le mot de passe doit contenir au moins 8 caractères'
  if (!values.confirmPassword) errors.confirmPassword = 'La confirmation du mot de passe est obligatoire'
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Les mots de passe ne correspondent pas'
  return errors
}

const Login = () => {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { user, loading: authLoading, updateUser } = useAuth()
  const [searchParams] = useSearchParams()

  const loginInitialValues = useMemo(() => ({ email: '', password: '' }), [])
  const signupInitialValues = useMemo(
    () => ({
      firstName: '',
      lastName: '',
      company: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    }),
    []
  )

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/home', { replace: true })
    }
  }, [user, authLoading, navigate])

  // Reset les erreurs au changement de mode
  const handleModeChange = (newMode) => {
    setMode(newMode)
    setError(null)
  }

  // Lire le query param ?mode=signup pour ouvrir directement le formulaire d'inscription
  useEffect(() => {
    const qMode = searchParams.get('mode')
    if (qMode === 'signup') {
      setMode('signup')
    }
  }, [searchParams])
  const handleSignupSuccess = () => {
    // Toast de succès pour confirmation email
    toast.success(
      'Inscription réussie ! Vérifiez votre email pour confirmer votre compte avant de vous connecter.',
      {
        duration: 6000, // 6 secondes pour lire le message
        action: {
          label: 'Aller à la connexion',
          onClick: () => navigate('/login')
        }
      }
    )

    // Redirection vers login après un court délai
    setTimeout(() => {
      navigate('/login')
    }, 2000)
  }

  const handleSignupError = (err) => {
    console.error('❌ Signup error:', err)

    let errorMessage = 'Une erreur inattendue s\'est produite'

    if (err?.response?.status === 400) {
      // Erreur de validation
      const errorData = err.response.data
      if (errorData?.error?.includes('email')) {
        errorMessage = 'Cet email est déjà utilisé ou invalide'
      } else if (errorData?.error?.includes('password')) {
        errorMessage = 'Le mot de passe ne respecte pas les critères de sécurité'
      } else if (errorData?.message) {
        errorMessage = errorData.message
      } else {
        errorMessage = 'Données d\'inscription invalides'
      }
    } else if (err?.response?.status === 409) {
      // Conflit (email déjà existant)
      errorMessage = 'Un compte existe déjà avec cet email'
      queryClient.clear()
    } else if (err?.response?.status === 422) {
      // Erreur de validation
      errorMessage = 'Les données fournies ne sont pas valides'
    } else if (err?.response?.status >= 500) {
      // Erreur serveur
      errorMessage = 'Erreur du serveur. Veuillez réessayer plus tard.'
    } else if (err?.code === 'NETWORK_ERROR' || !err?.response) {
      // Erreur réseau
      errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.'
    } else if (err?.message) {
      errorMessage = err.message
    }

    setError(errorMessage)
    toast.error(errorMessage, { duration: 5000 })
  }

  const loginSubmit = async (values, helpers) => {
    setError(null)
    try {
      setLoading(true)
      const data = await loginUser(values)
      if (data?.accessToken) {
        // 1. Stocker le token
        localStorage.setItem('authToken', data.accessToken)

        // 2. Récupérer les données utilisateur
        let userData = null
        try {
          const response = await getCurrentUser()
          userData = response?.user
        } catch (err) {
          console.error('Erreur lors de la récupération de l\'utilisateur:', err)
          localStorage.removeItem('authToken')
          toast.error('Erreur lors de la connexion')
          return
        }

        if (!userData) {
          console.error('Pas de données utilisateur reçues')
          localStorage.removeItem('authToken')
          toast.error('Erreur lors de la connexion')
          return
        }

        // 3. Mettre à jour le contexte d'authentification
        updateUser(userData)

        // 4. Afficher le toast de succès
        toast.success('Connexion réussie')
        helpers.reset()

        // 5. Naviguer vers home (utiliser replace pour éviter de revenir au login)
        navigate('/home', { replace: true })
      }
    } catch (err) {
      console.error('Login error', err)

      // ❌ Gestion détaillée des erreurs de connexion

      let errorMessage = 'Une erreur inattendue s\'est produite'
      const errorData = err?.response?.data

      // Priorité au message du backend s'il existe (notamment pour le 404 qui renvoie "Email ou mot de passe incorrect")
      if (errorData?.error) {
        errorMessage = errorData.error
      } else if (errorData?.message) {
        errorMessage = errorData.message
      } else if (err?.response?.status === 401) {
        errorMessage = 'Email ou mot de passe incorrect, ou compte non confirmé'
        helpers.setErrors({ email: errorMessage, password: errorMessage })
      } else if (err?.response?.status === 403) {
        // Compte suspendu ou accès refusé
        errorMessage = 'Accès refusé. Votre compte pourrait être suspendu.'
      } else if (err?.response?.status === 422) {
        // Données invalides
        errorMessage = 'Format d\'email ou mot de passe invalide'
      } else if (err?.response?.status >= 500) {
        // Erreur serveur
        errorMessage = 'Erreur du serveur. Veuillez réessayer plus tard.'
      } else if (err?.code === 'NETWORK_ERROR' || !err?.response) {
        // Erreur réseau
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.'
      } else if (err?.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      toast.error(errorMessage, { duration: 5000 })
    } finally {
      setLoading(false)
    }
  }

  const signupSubmit = async (values, helpers) => {
    setError(null)
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      company: values.company,
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      phone: values.phone,
      role: 'user'
    }

    try {
      setLoading(true)
      await registerUser(payload)
      helpers.reset()
      // Toast de succès pour confirmation email
      toast.success(
        'Inscription réussie ! Vérifiez votre email pour confirmer votre compte avant de vous connecter.',
        {
          duration: 6000, // 6 secondes pour lire le message
          action: {
            label: 'Aller à la connexion',
            onClick: () => navigate('/login')
          }
        }
      )

      // Redirection vers login après un court délai
      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (err) {
      console.error('Signup error:', err)

      // 🔍 CAS SPÉCIAL : Vérifier si c'est un 409 avec données de succès
      if (err?.response?.status === 409 && err?.response?.data) {
        const errorData = err.response.data

        // Si le 409 contient des données qui ressemblent à une réponse de succès
        if (errorData?.user || errorData?.message?.includes('success') || errorData?.email) {
          helpers.reset()
          handleSignupSuccess(errorData)
          return
        }
      }

      // ❌ Gestion normale des erreurs
      handleSignupError(err)

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-100 p-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {mode === 'login' ? 'Connexion' : 'Inscription'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' ? 'Connectez-vous à votre compte' : 'Créez votre compte entreprise'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === 'login' ? (
              <FormBuilder
                key="login-form"
                schema={loginSchema}
                initialValues={loginInitialValues}
                validate={validateLogin}
                onSubmit={loginSubmit}
                submitLabel="Se connecter"
                loading={loading}
                footer={({ resetForm }) => (
                  <div className="text-center text-sm text-muted-foreground">
                    Pas encore de compte ?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        resetForm()
                        handleModeChange('signup')
                      }}
                      className="underline text-blue-600 hover:text-blue-800"
                    >
                      Créer un compte
                    </button>
                  </div>
                )}
              />
            ) : (
              <FormBuilder
                key="signup-form"
                schema={signupSchema}
                initialValues={signupInitialValues}
                validate={validateSignup}
                onSubmit={signupSubmit}
                submitLabel="Créer mon compte"
                submitVariant="success"
                loading={loading}
                footer={({ resetForm }) => (
                  <div className="text-center text-sm text-muted-foreground">
                    Déjà un compte ?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        resetForm()
                        handleModeChange('login')
                      }}
                      className="underline text-blue-600 hover:text-blue-800"
                    >
                      Se connecter
                    </button>
                  </div>
                )}
              />
            )}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login
