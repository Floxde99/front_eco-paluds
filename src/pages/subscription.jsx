import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Crown,
  Loader2,
  ShieldCheck,
  Wallet,
  XCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  createPayPalCheckoutSession,
  createSubscriptionPaymentIntent,
  fetchBillingPlans,
} from '@/services/BillingApi'

const SubscriptionPageContext = createContext(null)
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null

const PAYMENT_METHODS = [
  { id: 'card', label: 'Carte bancaire', icon: CreditCard },
  { id: 'paypal', label: 'PayPal', icon: Wallet },
]

const DEFAULT_FORM_DATA = {
  cardHolder: 'Marie Dubois',
  company: 'Métallurgie Provence SARL',
  address: 'Zone Industrielle des Paluds',
  addressLine2: '',
  city: 'Aubagne',
  postalCode: '13400',
  country: 'FR',
  vatNumber: '',
  email: 'marie.dubois@example.com',
  acceptTerms: false,
}

function useSubscriptionPage() {
  const context = useContext(SubscriptionPageContext)
  if (!context) {
    throw new Error('SubscriptionPageContext must be used within its provider')
  }
  return context
}

export default function SubscriptionPage() {
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card')
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA)
  const [clientSecret, setClientSecret] = useState(null)
  const [intentError, setIntentError] = useState(null)
  const [intentRefreshCounter, setIntentRefreshCounter] = useState(0)
  const pendingPlanIdRef = useRef(null)

  const plansQuery = useQuery({
    queryKey: ['billing-plans'],
    queryFn: fetchBillingPlans,
    staleTime: 5 * 60 * 1000,
  })

  const plans = useMemo(() => normalizePlans(plansQuery.data), [plansQuery.data])

  useEffect(() => {
    if (!plans.length) {
      return
    }
    setSelectedPlanId((current) => {
      if (current && plans.some((plan) => plan.id === current)) {
        return current
      }
      const highlighted = plans.find((plan) => plan.highlight && !plan.preventSelection)
      const defaultPlan = highlighted ?? plans.find((plan) => !plan.preventSelection) ?? plans[0]
      return defaultPlan?.id ?? plans[0].id
    })
  }, [plans])

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  )

  const requiresPayment = useMemo(
    () => typeof selectedPlan?.price === 'number' && selectedPlan.price > 0,
    [selectedPlan],
  )

  useEffect(() => {
    if (!requiresPayment) {
      setSelectedPaymentMethod('card')
    }
  }, [requiresPayment])

  const { mutateAsync: requestPaymentIntent, isPending: isPreparingIntent } = useMutation({
    mutationFn: createSubscriptionPaymentIntent,
  })

  useEffect(() => {
    let isActive = true

    async function ensurePaymentIntent() {
      if (!requiresPayment || selectedPaymentMethod !== 'card') {
        pendingPlanIdRef.current = null
        setClientSecret(null)
        setIntentError(null)
        return
      }

      if (!stripePromise) {
        setIntentError('Clé publique Stripe manquante. Configurez VITE_STRIPE_PUBLISHABLE_KEY.')
        pendingPlanIdRef.current = null
        setClientSecret(null)
        return
      }

      if (!selectedPlan?.id) {
        pendingPlanIdRef.current = null
        setClientSecret(null)
        setIntentError(null)
        return
      }

      const planId = selectedPlan.id
      pendingPlanIdRef.current = planId

      try {
        const response = await requestPaymentIntent({
          planId,
          paymentMethodType: 'card',
          billingDetails: extractBillingDetails(formData),
        })

        if (!isActive || pendingPlanIdRef.current !== planId) {
          return
        }

        const secret = response?.clientSecret ?? response?.client_secret ?? null
        if (!secret) {
          setIntentError("La réponse du serveur ne contient pas de clientSecret.")
          setClientSecret(null)
          return
        }

        setClientSecret(secret)
        setIntentError(null)
      } catch (error) {
        if (!isActive || pendingPlanIdRef.current !== planId) {
          return
        }
        const message =
          error?.response?.data?.message ?? error.message ?? 'Erreur lors de la préparation du paiement.'
        setIntentError(message)
        setClientSecret(null)
      }
    }

    ensurePaymentIntent()

    return () => {
      isActive = false
    }
  }, [formData, requestPaymentIntent, requiresPayment, selectedPaymentMethod, selectedPlan, intentRefreshCounter])

  const refreshPaymentIntent = useCallback(() => {
    setIntentRefreshCounter((counter) => counter + 1)
  }, [])

  const contextValue = useMemo(
    () => ({
      plans,
      selectedPlanId,
      selectedPlan,
      selectPlan: setSelectedPlanId,
      selectedPaymentMethod,
      setSelectedPaymentMethod,
      formData,
      setFormData,
      requiresPayment,
      stripePromise,
      clientSecret,
      intentError,
      isPreparingIntent,
      refreshPaymentIntent,
    }),
    [
      plans,
      selectedPlanId,
      selectedPlan,
      selectedPaymentMethod,
      formData,
      requiresPayment,
      clientSecret,
      intentError,
      isPreparingIntent,
      refreshPaymentIntent,
    ],
  )

  if (plansQuery.isLoading) {
    return <SubscriptionLoadingState />
  }

  if (plansQuery.isError) {
    return <SubscriptionErrorState message={plansQuery.error?.message} />
  }

  if (!plans.length || !selectedPlan) {
    return <SubscriptionErrorState message="Aucune offre disponible pour le moment." />
  }

  return (
    <SubscriptionPageContext.Provider value={contextValue}>
      <div className="bg-slate-50">
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12 lg:px-8">
          <PageHeader />
          <PricingSection />
          <Separator />
          <CheckoutSection />
        </main>
      </div>
    </SubscriptionPageContext.Provider>
  )
}

function PageHeader() {
  return (
    <header className="space-y-4 text-center">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#FFF4CC] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[#FFC107]">
        <Crown className="h-3.5 w-3.5" />
        <span>Premium</span>
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Passez à Ecopaluds Premium</h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-600 md:text-base">
          Débloquez toutes les fonctionnalités pour maximiser vos opportunités d'affaires et propulser votre entreprise.
        </p>
      </div>
    </header>
  )
}

function PricingSection() {
  const { plans } = useSubscriptionPage()
  return (
    <section className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  )
}

function PlanCard({ plan }) {
  const { selectedPlanId, selectPlan } = useSubscriptionPage()
  const isSelected = selectedPlanId === plan.id

  const handleSelect = useCallback(() => {
    if (plan.preventSelection) {
      return
    }
    selectPlan(plan.id)
  }, [plan, selectPlan])

  return (
    <Card
      onClick={handleSelect}
      className={cn(
        'relative h-full cursor-pointer border-slate-200 transition-all hover:shadow-md',
        isSelected && 'border-blue-500 shadow-lg ring-2 ring-blue-100',
        plan.highlight && 'border-2',
        plan.preventSelection && 'cursor-default opacity-90',
      )}
    >
      {plan.badge ? (
        <span className="absolute right-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {plan.badge}
        </span>
      ) : null}

      <CardContent className="flex h-full flex-col gap-6">
        <div className="space-y-1">
          {plan.tagline ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{plan.tagline}</p>
          ) : null}
          <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
          <div className="flex items-baseline gap-2 text-slate-900">
            <span className="text-3xl font-bold">{plan.priceLabel}</span>
            {plan.priceDescriptor ? (
              <span className="text-sm text-slate-500">{plan.priceDescriptor}</span>
            ) : null}
          </div>
          {plan.description ? <p className="text-sm text-slate-600">{plan.description}</p> : null}
        </div>

        <FeatureList included={plan.features.included} excluded={plan.features.excluded} />

        {plan.contactLink ? (
          <Button
            asChild
            variant="outline"
            className="mt-auto w-full border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
            onClick={(event) => event.stopPropagation()}
          >
            <a href={plan.contactLink}>Nous contacter</a>
          </Button>
        ) : (
          <Button
            type="button"
            variant={isSelected ? 'default' : 'outline'}
            className={cn(
              'mt-auto w-full',
              plan.preventSelection && 'cursor-default bg-slate-200 text-slate-600 hover:bg-slate-200',
            )}
            onClick={(event) => {
              event.stopPropagation()
              handleSelect()
            }}
            disabled={plan.preventSelection}
          >
            {isSelected && !plan.preventSelection ? 'Plan sélectionné' : plan.ctaLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function FeatureList({ included, excluded }) {
  return (
    <ul className="space-y-2 text-sm">
      {included.map((feature) => (
        <li key={`included-${feature}`} className="flex items-start gap-2 text-slate-600">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
          <span>{feature}</span>
        </li>
      ))}
      {excluded.map((feature) => (
        <li key={`excluded-${feature}`} className="flex items-start gap-2 text-slate-400">
          <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-300" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  )
}

function CheckoutSection() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Finaliser votre abonnement Premium</h2>
        <p className="text-sm text-slate-500">Paiement sécurisé • Annulation possible à tout moment</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <OrderSummaryCard />
        <PaymentForm />
      </div>
    </section>
  )
}

function OrderSummaryCard() {
  const { selectedPlan } = useSubscriptionPage()
  const summary = selectedPlan.summary
  const isCustomPlan = summary == null

  return (
    <Card className="h-full border-slate-200 shadow-sm">
      <CardContent className="space-y-6 p-6">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Récapitulatif de commande</h3>
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Ecopaluds {selectedPlan.name}</span>
            <span className="font-semibold text-slate-900">{selectedPlan.priceLabel}</span>
          </div>
        </div>

        {isCustomPlan ? (
          <div className="rounded-md bg-slate-100 p-4 text-sm text-slate-600">
            Contactez notre équipe commerciale pour obtenir un devis personnalisé adapté à votre organisation.
          </div>
        ) : (
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>{summary.billing}</span>
              <span className="font-medium text-slate-900">{selectedPlan.priceLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{summary.renewal}</span>
              <span className="text-slate-500">Reconduction</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span>{summary.subtotalLabel}</span>
              <span>{formatCurrency(summary.subtotalAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{summary.taxLabel}</span>
              <span>{formatCurrency(summary.taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-slate-900">
              <span>{summary.totalLabel}</span>
              <span>{formatCurrency(summary.totalAmount)}</span>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 rounded-md border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Garantie satisfait ou remboursé</p>
            <p>Essayez Premium pendant 14 jours. Si vous n'êtes pas satisfait, nous vous remboursons intégralement.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PaymentForm() {
  const {
    selectedPlan,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    formData,
    setFormData,
    requiresPayment,
    stripePromise,
    clientSecret,
    intentError,
    isPreparingIntent,
  } = useSubscriptionPage()

  const [formError, setFormError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const cardPaymentRef = useRef(null)

  const { mutateAsync: startPayPalCheckout, isPending: isStartingPayPal } = useMutation({
    mutationFn: createPayPalCheckoutSession,
  })

  useEffect(() => {
    setFormError(null)
    setSuccessMessage(null)
  }, [selectedPlan, selectedPaymentMethod])

  const handleChange = useCallback(
    (field) => (event) => {
      const { type, checked, value } = event.target
      setFormData((prev) => ({ ...prev, [field]: type === 'checkbox' ? checked : value }))
    },
    [setFormData],
  )

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      setFormError(null)
      setSuccessMessage(null)

      if (!formData.acceptTerms) {
        setFormError('Vous devez accepter les conditions générales pour continuer.')
        return
      }

      if (!requiresPayment) {
        setSuccessMessage('Votre abonnement gratuit est activé. Bonne continuation !')
        return
      }

      if (selectedPaymentMethod === 'paypal') {
        if (!selectedPlan?.id) {
          setFormError('Impossible de déterminer le plan sélectionné.')
          return
        }
        try {
          setIsSubmitting(true)
          const response = await startPayPalCheckout({ planId: selectedPlan.id })
          const approvalUrl = response?.approvalUrl ?? response?.url
          if (!approvalUrl) {
            throw new Error('URL de redirection PayPal introuvable.')
          }
          window.location.href = approvalUrl
        } catch (error) {
          const message =
            error?.response?.data?.message ?? error.message ?? 'Impossible de démarrer le paiement PayPal.'
          setFormError(message)
        } finally {
          setIsSubmitting(false)
        }
        return
      }

      if (selectedPaymentMethod === 'card') {
        if (!stripePromise) {
          setFormError('Stripe n\'est pas configuré. Ajoutez VITE_STRIPE_PUBLISHABLE_KEY à votre environnement.')
          return
        }
        if (!clientSecret) {
          setFormError('Le paiement n\'est pas prêt. Veuillez patienter quelques secondes et réessayer.')
          return
        }

        try {
          setIsSubmitting(true)
          const confirm = await cardPaymentRef.current?.confirmPayment()
          if (confirm === true) {
            setSuccessMessage('Paiement confirmé. Votre abonnement sera activé sous peu !')
          }
        } catch (error) {
          const message = error?.message ?? 'Le paiement a échoué. Veuillez vérifier vos informations.'
          setFormError(message)
        } finally {
          setIsSubmitting(false)
        }
      }
    },
    [
      cardPaymentRef,
      clientSecret,
      formData.acceptTerms,
      requiresPayment,
      selectedPaymentMethod,
      selectedPlan?.id,
      startPayPalCheckout,
      stripePromise,
    ],
  )

  const cardPaymentEnabled = requiresPayment && selectedPaymentMethod === 'card'
  const cardReady = cardPaymentEnabled && stripePromise && clientSecret

  const submitDisabled =
    isSubmitting ||
    isPreparingIntent ||
    (cardPaymentEnabled && (!stripePromise || !clientSecret)) ||
    (selectedPaymentMethod === 'paypal' && isStartingPayPal)

  const submitLabel = useMemo(() => {
    if (!requiresPayment) {
      return 'Activer mon abonnement'
    }
    if (selectedPaymentMethod === 'paypal') {
      return isStartingPayPal || isSubmitting ? 'Redirection en cours…' : 'Continuer avec PayPal'
    }
    return isSubmitting ? 'Paiement en cours…' : 'Payer et activer'
  }, [isStartingPayPal, isSubmitting, requiresPayment, selectedPaymentMethod])

  const formBody = (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Mode de paiement</h3>
        <PaymentMethodToggle
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          disabled={!requiresPayment}
        />
      </div>

      {requiresPayment ? (
        <BillingDetailsFields formData={formData} onChange={handleChange} />
      ) : (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Aucun paiement n'est requis pour ce plan. Validez simplement les conditions pour activer votre accès.
        </div>
      )}

      {cardPaymentEnabled ? (
        !stripePromise ? (
          <InlineAlert variant="error" message="Stripe n'est pas configuré côté client. Ajoutez VITE_STRIPE_PUBLISHABLE_KEY." />
        ) : intentError ? (
          <InlineAlert variant="error" message={intentError} />
        ) : !cardReady ? (
          <InlineAlert
            variant="info"
            message="Préparation du paiement en cours…"
            icon={<Loader2 className="h-4 w-4 animate-spin" />}
          />
        ) : (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: 'stripe', labels: 'floating' } }}
            key={clientSecret}
          >
            <CardPaymentFields ref={cardPaymentRef} formData={formData} />
          </Elements>
        )
      ) : null}

      <div className="space-y-4">
        <BillingAddress formData={formData} onChange={handleChange} />

        <div className="flex items-center gap-3">
          <input
            id="acceptTerms"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            checked={formData.acceptTerms}
            onChange={handleChange('acceptTerms')}
          />
          <Label htmlFor="acceptTerms" className="text-sm text-slate-600">
            J'accepte les conditions générales de vente et d'utilisation
          </Label>
        </div>
      </div>

      {formError ? <InlineAlert variant="error" message={formError} /> : null}
      {successMessage ? <InlineAlert variant="success" message={successMessage} /> : null}

      <div className="flex justify-end">
        <Button type="submit" className="min-w-[220px]" disabled={submitDisabled}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )

  return (
    <Card className="h-full border-slate-200 shadow-sm">
      <CardContent className="space-y-6 p-6">
        {formBody}
      </CardContent>
    </Card>
  )
}

const CardPaymentFields = React.forwardRef(function CardPaymentFields({ formData }, ref) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState(null)

  const confirmPayment = useCallback(async () => {
    if (!stripe || !elements) {
      throw new Error('Paiement non prêt. Veuillez réessayer dans quelques instants.')
    }

    setError(null)

    const { error: confirmationError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/abonnement?paiement=success`,
        payment_method_data: {
          billing_details: {
            name: formData.cardHolder,
            email: formData.email,
            address: {
              line1: formData.address,
              line2: formData.addressLine2 || undefined,
              city: formData.city,
              postal_code: formData.postalCode,
              country: formData.country || 'FR',
            },
          },
        },
      },
      redirect: 'if_required',
    })

    if (confirmationError) {
      const message = confirmationError.message ?? 'Le paiement a été refusé. Vérifiez vos informations.'
      setError(message)
      throw new Error(message)
    }

    return true
  }, [elements, formData, stripe])

  useEffect(() => {
    if (ref) {
      ref.current = {
        confirmPayment,
      }
    }
  }, [confirmPayment, ref])

  return (
    <div className="space-y-3">
      {error ? <InlineAlert variant="error" message={error} /> : null}
      <div className="rounded-md border border-slate-200 bg-white p-3">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
    </div>
  )
})

function BillingDetailsFields({ formData, onChange }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardHolder">Nom du titulaire *</Label>
        <Input
          id="cardHolder"
          placeholder="Prénom Nom"
          value={formData.cardHolder}
          onChange={onChange('cardHolder')}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email de facturation *</Label>
        <Input
          id="email"
          type="email"
          placeholder="nom@entreprise.fr"
          value={formData.email}
          onChange={onChange('email')}
          required
        />
      </div>
    </div>
  )
}

function BillingAddress({ formData, onChange }) {
  return (
    <div className="space-y-4 rounded-md border border-slate-200 p-4">
      <Label className="text-sm font-semibold text-slate-700">Adresse de facturation</Label>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="company">Entreprise *</Label>
          <Input
            id="company"
            placeholder="Nom de l'entreprise"
            value={formData.company}
            onChange={onChange('company')}
            required
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="address">Adresse *</Label>
          <Input
            id="address"
            placeholder="Adresse"
            value={formData.address}
            onChange={onChange('address')}
            required
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="addressLine2">Complément d'adresse</Label>
          <Input
            id="addressLine2"
            placeholder="Bâtiment, étage, etc."
            value={formData.addressLine2}
            onChange={onChange('addressLine2')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode">Code postal *</Label>
          <Input
            id="postalCode"
            inputMode="numeric"
            value={formData.postalCode}
            onChange={onChange('postalCode')}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Ville *</Label>
          <Input id="city" value={formData.city} onChange={onChange('city')} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Pays *</Label>
          <Input id="country" value={formData.country} onChange={onChange('country')} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vatNumber">N° de TVA (optionnel)</Label>
          <Input
            id="vatNumber"
            value={formData.vatNumber}
            onChange={onChange('vatNumber')}
            placeholder="FRXX999999999"
          />
        </div>
      </div>
    </div>
  )
}

function PaymentMethodToggle({ selectedPaymentMethod, setSelectedPaymentMethod, disabled }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PAYMENT_METHODS.map((method) => {
        const Icon = method.icon
        const isActive = selectedPaymentMethod === method.id
        return (
          <Button
            key={method.id}
            type="button"
            variant={isActive ? 'default' : 'outline'}
            className="w-full"
            onClick={() => setSelectedPaymentMethod(method.id)}
            disabled={disabled}
          >
            <Icon className="h-4 w-4" />
            {method.label}
          </Button>
        )
      })}
    </div>
  )
}

function InlineAlert({ variant, message, icon }) {
  const palette = {
    error: 'border-red-200 bg-red-50 text-red-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
  }
  const Icon =
    icon ??
    (variant === 'error' ? (
      <AlertCircle className="h-4 w-4" />
    ) : variant === 'success' ? (
      <CheckCircle2 className="h-4 w-4" />
    ) : (
      <Loader2 className="h-4 w-4 animate-spin" />
    ))
  return (
    <div className={cn('flex items-center gap-2 rounded-md border px-3 py-2 text-sm', palette[variant])}>
      {Icon}
      <span>{message}</span>
    </div>
  )
}

function SubscriptionLoadingState() {
  return (
    <div className="bg-slate-50">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Chargement des offres d'abonnement…</p>
        </div>
      </main>
    </div>
  )
}

function SubscriptionErrorState({ message }) {
  return (
    <div className="bg-slate-50">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-16 lg:px-8">
        <Card className="border-red-200 bg-red-50 text-red-700">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <AlertCircle className="h-6 w-6" />
            <p className="text-lg font-semibold">Impossible de charger les abonnements</p>
            <p className="text-sm">{message ?? 'Réessayez plus tard ou contactez le support.'}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function extractBillingDetails(formData) {
  return {
    name: formData.cardHolder,
    email: formData.email,
    vatNumber: formData.vatNumber,
    company: formData.company,
    address: {
      line1: formData.address,
      line2: formData.addressLine2 || undefined,
      city: formData.city,
      postal_code: formData.postalCode,
      country: formData.country || 'FR',
    },
  }
}

function normalizePlans(rawData) {
  const list = Array.isArray(rawData?.plans)
    ? rawData.plans
    : Array.isArray(rawData)
      ? rawData
      : []

  return list.map((plan) => {
    const price = determinePrice(plan)
    const currency = plan.currency ?? 'EUR'
    return {
      id: plan.id,
      name: plan.name ?? 'Abonnement',
      tagline: plan.tagline ?? null,
      description: plan.description ?? null,
      price: price?.value ?? null,
      priceLabel: plan.priceLabel ?? (price ? formatCurrency(price.value, currency) : 'Sur mesure'),
      priceDescriptor: plan.priceDescriptor ?? (price ? price.period ?? '/mois' : ''),
      badge: plan.badge ?? null,
      highlight: Boolean(plan.highlight),
      preventSelection: Boolean(plan.preventSelection),
      ctaLabel: plan.ctaLabel ?? (price ? 'Choisir' : 'Nous contacter'),
      contactLink: plan.contactLink ?? null,
      summary: plan.summary ?? (price ? defaultSummary(price.value, currency) : null),
      features: {
        included: Array.isArray(plan.features?.included) ? plan.features.included : [],
        excluded: Array.isArray(plan.features?.excluded) ? plan.features.excluded : [],
      },
    }
  })
}

function determinePrice(plan) {
  if (typeof plan.price === 'number') {
    return { value: plan.price, currency: plan.currency ?? 'EUR', period: plan.priceDescriptor }
  }
  if (typeof plan.amount === 'number') {
    return { value: plan.amount / 100, currency: plan.currency ?? 'EUR', period: plan.interval ? `/ ${plan.interval}` : '/mois' }
  }
  if (plan.priceAmount) {
    return {
      value: plan.priceAmount / (plan.priceDivisor ?? 100),
      currency: plan.currency ?? 'EUR',
      period: plan.priceIntervalLabel ?? '/mois',
    }
  }
  return null
}

function defaultSummary(total, currency) {
  const subtotal = total / 1.2
  const tax = total - subtotal
  return {
    billing: 'Facturation mensuelle',
    renewal: 'Reconduction automatique',
    subtotalLabel: 'Total HT',
    subtotalAmount: subtotal,
    taxLabel: 'TVA (20%)',
    taxAmount: tax,
    totalLabel: 'Total TTC',
    totalAmount: total,
    currency,
  }
}

function formatCurrency(value, currency = 'EUR') {
  if (value == null || Number.isNaN(Number(value))) {
    return '—'
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}
