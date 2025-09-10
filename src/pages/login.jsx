import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { loginUser, registerUser, getCurrentUser } from "@/services/Api"
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LoginForm from "@/components/forms/LoginForm"
import SignupForm from "@/components/forms/SignupForm"

const Login = () => {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { updateUser } = useAuth()

  // État pour les erreurs de validation par champ
  const [fieldErrors, setFieldErrors] = useState({})

  // Reset les erreurs au changement de mode
  const handleModeChange = (newMode) => {
    setMode(newMode)
    setError(null) // Reset les erreurs
    setFieldErrors({}) // Reset les erreurs de champs
  }
  const [loginValues, setLoginValues] = useState({
    email: "",
    password: ""
  })
  
  const [signupValues, setSignupValues] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  })

  // Fonctions helper pour gérer le succès et les erreurs
  const handleSignupSuccess = (data) => {
    console.log('✅ Signup success:', data)
    
    // Reset le formulaire
    setSignupValues({
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: ""
    })
    
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

  const loginSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    if (!loginValues.email || !loginValues.password) {
      setError("Email et mot de passe requis")
      return
    }

    try {
      setLoading(true)
      const data = await loginUser(loginValues)
      if (data?.accessToken) {
        localStorage.setItem('authToken', data.accessToken)
        
        // Récupérer et définir l'utilisateur dans le contexte avant de naviguer
        try {
          const userData = await getCurrentUser()
          if (userData?.user) {
            updateUser(userData.user)
          }
        } catch (err) {
          console.error('Erreur lors de la récupération de l\'utilisateur:', err)
          toast.error('Erreur lors de la connexion')
          return
        }
        
        toast.success('Connexion réussie')
        navigate('/home')
      }
    } catch (err) {
      console.error('Login error', err)
      
      // ❌ Gestion détaillée des erreurs de connexion
      let errorMessage = 'Une erreur inattendue s\'est produite'
      
      if (err?.response?.status === 401) {
        // Email non confirmé ou identifiants invalides
        errorMessage = 'Email ou mot de passe incorrect, ou compte non confirmé'
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

  const signupSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({}) // Reset les erreurs de champs

    // Validation côté frontend avec marquage des champs
    const errors = {}

    if (!signupValues.firstName.trim()) {
      errors.firstName = 'Le prénom est obligatoire'
    }

    if (!signupValues.lastName.trim()) {
      errors.lastName = 'Le nom est obligatoire'
    }

    if (!signupValues.email.trim()) {
      errors.email = 'L\'email est obligatoire'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupValues.email)) {
      errors.email = 'Format d\'email invalide'
    }

    if (!signupValues.password) {
      errors.password = 'Le mot de passe est obligatoire'
    } else if (signupValues.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères'
    }

    if (!signupValues.confirmPassword) {
      errors.confirmPassword = 'La confirmation du mot de passe est obligatoire'
    } else if (signupValues.password !== signupValues.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    // Si il y a des erreurs, les afficher et arrêter
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('Veuillez corriger les erreurs ci-dessous')
      return
    }

    const payload = {
      firstName: signupValues.firstName,
      lastName: signupValues.lastName,
      company: signupValues.company,
      email: signupValues.email,
      password: signupValues.password,
      confirmPassword: signupValues.confirmPassword,
      phone: signupValues.phone,
      role: 'user'
    }

    try {
      setLoading(true)
      const data = await registerUser(payload)
      console.log('Signup response:', data)
      
      // ✅ SUCCÈS : Inscription réussie, email de confirmation envoyé
      // Vérifier que la requête a réussi (pas d'erreur levée)
      // Reset le formulaire
      setSignupValues({
        firstName: "",
        lastName: "",
        company: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: ""
      })
      
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
          console.log('🎯 409 with success data detected:', errorData)
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

  const handleLoginInputChange = (field, value) => {
    setLoginValues(prev => ({ ...prev, [field]: value }))
    // Effacer l'erreur du champ quand l'utilisateur commence à taper
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSignupInputChange = (field, value) => {
    setSignupValues(prev => ({ ...prev, [field]: value }))
    // Effacer l'erreur du champ quand l'utilisateur commence à taper
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
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
              <LoginForm
                values={loginValues}
                onInputChange={handleLoginInputChange}
                onSubmit={loginSubmit}
                loading={loading}
                onSwitchToSignup={() => handleModeChange('signup')}
                fieldErrors={fieldErrors}
              />
            ) : (
              <SignupForm
                values={signupValues}
                onInputChange={handleSignupInputChange}
                onSubmit={signupSubmit}
                loading={loading}
                onSwitchToLogin={() => handleModeChange('login')}
                fieldErrors={fieldErrors}
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