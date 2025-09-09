import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { loginUser, registerUser, getCurrentUser } from "@/services/Api"
import { AuthContext } from '@/hooks/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LoginForm from "@/components/forms/LoginForm"
import SignupForm from "@/components/forms/SignupForm"

const Login = () => {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
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
  const auth = useContext(AuthContext)

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
        // Refresh auth context immediately so app updates without reload
        try {
          const me = await getCurrentUser()
          if (me?.user && auth?.updateUser) auth.updateUser(me.user)
        } catch (err) {
          console.warn('Could not fetch current user after login', err)
        }
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
        // Refresh auth context after signup
        try {
          const me = await getCurrentUser()
          if (me?.user && auth?.updateUser) auth.updateUser(me.user)
        } catch (err) {
          console.warn('Could not fetch current user after signup', err)
        }
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
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login