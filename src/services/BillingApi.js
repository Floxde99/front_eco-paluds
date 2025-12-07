import api from './Api'

export async function fetchBillingPlans() {
  const response = await api.get('/billing/plans')
  return response.data
}

export async function fetchSubscriptionStatus() {
  const response = await api.get('/billing/subscription')
  return response.data
}

export async function createSubscriptionPaymentIntent({ planId, paymentMethodType = 'card', billingDetails }) {
  const response = await api.post('/billing/payment-intents', {
    planId,
    paymentMethodType,
    billingDetails,
  })
  return response.data
}

export async function createPayPalCheckoutSession({ planId }) {
  const response = await api.post('/billing/paypal/session', {
    planId,
  })
  return response.data
}

export async function confirmPayment(paymentIntentId) {
  const response = await api.post('/billing/confirm-payment', {
    paymentIntentId,
  })
  return response.data
}
