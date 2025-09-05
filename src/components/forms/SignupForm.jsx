import { Button } from "@/components/ui/button"
import FormInput from "./FormInput"

export function SignupForm({ 
  values, 
  onInputChange, 
  onSubmit, 
  loading, 
  onSwitchToLogin 
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormInput
        id="company"
        label="Nom de l'entreprise"
        value={values.company}
        onChange={(value) => onInputChange('company', value)}
        placeholder="Votre entreprise"
      />
      
      <div className="grid grid-cols-2 gap-2">
        <FormInput
          id="lastName"
          label="Nom"
          value={values.lastName}
          onChange={(value) => onInputChange('lastName', value)}
          placeholder="Votre nom"
          required
        />
        <FormInput
          id="firstName"
          label="Prénom"
          value={values.firstName}
          onChange={(value) => onInputChange('firstName', value)}
          placeholder="Votre prénom"
          required
        />
      </div>
      
      <FormInput
        id="email"
        label="Email professionnel"
        type="email"
        value={values.email}
        onChange={(value) => onInputChange('email', value)}
        placeholder="contact@entreprise.com"
        required
      />
      
      <FormInput
        id="password"
        label="Mot de passe"
        type="password"
        value={values.password}
        onChange={(value) => onInputChange('password', value)}
        required
        helpText="Minimum 8 caractères"
      />
      
      <FormInput
        id="confirmPassword"
        label="Confirmer le mot de passe"
        type="password"
        value={values.confirmPassword}
        onChange={(value) => onInputChange('confirmPassword', value)}
        required
      />
      
      <FormInput
        id="phone"
        label="Téléphone"
        type="tel"
        value={values.phone}
        onChange={(value) => onInputChange('phone', value)}
        placeholder="Votre numéro"
      />
      
      <Button type="submit" className="w-full" variant="success" disabled={loading}>
        {loading ? 'Envoi...' : 'Créer mon compte'}
      </Button>
      
      <div className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="underline text-blue-600 hover:text-blue-800"
        >
          Se connecter
        </button>
      </div>
    </form>
  )
}

export default SignupForm
