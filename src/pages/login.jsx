import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { loginUser, registerUser } from "@/services/Api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import LoginForm from "@/components/forms/LoginForm"
import SignupForm from "@/components/forms/SignupForm"

const Login = () => {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [currentTime, setCurrentTime] = useState(new Date())
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

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

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
        localStorage.setItem('userName', data.user?.firstName || 'Utilisateur')
      }
      toast.success('Connexion réussie')
      navigate('/home')
    } catch (err) {
      console.error('Login error', err)
      const msg = err?.response?.data?.error || err.message || 'Erreur réseau'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const signupSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!signupValues.email || !signupValues.password || !signupValues.firstName || !signupValues.lastName) {
      setError('Veuillez remplir les champs obligatoires')
      return
    }

    if (signupValues.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    if (signupValues.password !== signupValues.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
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
      role: 'user' // Backend will convert role name to roleId
    }

    console.log('Sending signup payload:', payload)

    try {
      setLoading(true)
      const data = await registerUser(payload)
      if (data?.token) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userName', signupValues.firstName || 'Utilisateur')
      }
      toast.success('Inscription réussie')
      navigate('/home')
    } catch (err) {
      console.error('Signup error:', err)
      console.log('Error response:', err?.response?.data)
      
      let msg = 'Inscription échouée'
      if (err?.response?.data) {
        // Backend returned structured error
        if (typeof err.response.data === 'string') {
          msg = err.response.data
        } else if (err.response.data.error) {
          msg = err.response.data.error
        } else if (err.response.data.message) {
          msg = err.response.data.message
        } else {
          msg = JSON.stringify(err.response.data)
        }
      } else if (err.message) {
        msg = err.message
      }
      
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleLoginInputChange = (field, value) => {
    setLoginValues(prev => ({ ...prev, [field]: value }))
  }

  const handleSignupInputChange = (field, value) => {
    setSignupValues(prev => ({ ...prev, [field]: value }))
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const features = [
    { icon: '🚀', title: 'Performance', desc: 'Application rapide et efficace' },
    { icon: '🔒', title: 'Sécurisé', desc: 'Vos données sont protégées' },
    { icon: '📱', title: 'Responsive', desc: 'Fonctionne sur tous les appareils' },
    { icon: '🌍', title: 'Global', desc: 'Accessible partout dans le monde' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EcoPaluds
              </h1>
              <p className="text-sm text-gray-600">
                {getGreeting()}, bienvenue ! ✨
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {currentTime.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-xs text-gray-500">
                {currentTime.toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
        <div className="w-full max-w-6xl flex gap-8">
          {/* Left Side - Features */}
          <div className="hidden lg:flex flex-col justify-center flex-1 space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Rejoignez EcoPaluds
              </h2>
              <p className="text-xl text-gray-600">
                La plateforme qui révolutionne votre façon de travailler
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <div>
                        <h3 className="font-semibold">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">🎯 Prêt à commencer ?</h3>
              <p className="text-blue-100">
                Rejoignez des milliers d'utilisateurs qui font déjà confiance à EcoPaluds
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {mode === 'login' ? '🔐' : '🚀'}
                </div>
                <CardTitle className="text-2xl">
                  {mode === 'login' ? 'Connexion' : 'Inscription'}
                </CardTitle>
                <CardDescription>
                  {mode === 'login' 
                    ? 'Connectez-vous à votre compte pour continuer' 
                    : 'Créez votre compte et rejoignez notre communauté'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mode === 'login' ? (
                  <LoginForm
                    values={loginValues}
                    onInputChange={handleLoginInputChange}
                    onSubmit={loginSubmit}
                    loading={loading}
                    onSwitchToSignup={() => setMode('signup')}
                  />
                ) : (
                  <SignupForm
                    values={signupValues}
                    onInputChange={handleSignupInputChange}
                    onSubmit={signupSubmit}
                    loading={loading}
                    onSwitchToLogin={() => setMode('login')}
                  />
                )}
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <span className="text-red-500">❌</span>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Mode Toggle */}
                <div className="pt-4 border-t">
                  <div className="text-center space-y-3">
                    <p className="text-sm text-gray-600">
                      {mode === 'login' 
                        ? "Vous n'avez pas encore de compte ?" 
                        : "Vous avez déjà un compte ?"
                      }
                    </p>
                    <Button 
                      variant="ghost" 
                      onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      {mode === 'login' ? '🎯 Créer un compte' : '🔑 Se connecter'}
                    </Button>
                  </div>
                </div>

                {/* Demo Info */}
                {mode === 'login' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <span>💡</span>
                      Compte de démonstration
                    </h4>
                    <p className="text-sm text-blue-700 mb-2">
                      Testez l'application avec ces identifiants :
                    </p>
                    <div className="bg-white rounded border p-2 text-sm font-mono">
                      <p><strong>Email:</strong> demo@ecopaluds.com</p>
                      <p><strong>Password:</strong> demo123</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login