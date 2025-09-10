import { Button } from "@/components/ui/button"
import FormInput from "./FormInput"

export function LoginForm({ 
  values, 
  onInputChange, 
  onSubmit, 
  loading, 
  onSwitchToSignup,
  fieldErrors = {}
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormInput
        id="email"
        label="Email"
        type="email"
        value={values.email}
        onChange={(value) => onInputChange('email', value)}
        placeholder="votre@email.com"
        required
        isInvalid={!!fieldErrors.email}
        errorMessage={fieldErrors.email}
      />
      
      <FormInput
        id="password"
        label="Mot de passe"
        type="password"
        value={values.password}
        onChange={(value) => onInputChange('password', value)}
        required
        isInvalid={!!fieldErrors.password}
        errorMessage={fieldErrors.password}
      />
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </Button>
      
      <div className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="underline text-blue-600 hover:text-blue-800"
        >
          Créer un compte
        </button>
      </div>
    </form>
  )
}

export default LoginForm
