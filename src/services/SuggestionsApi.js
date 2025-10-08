import api from './Api'

/**
 * Fetch personalized suggestions for the authenticated user
 */
export async function fetchSuggestions() {
  const response = await api.get('/suggestions')
  return response.data
}

/**
 * Fetch suggestions statistics
 */
export async function fetchSuggestionsStats() {
  const response = await api.get('/suggestions/stats')
  return response.data
}

/**
 * Fetch available filters
 */
export async function fetchSuggestionsFilters() {
  const response = await api.get('/suggestions/filters')
  return response.data
}

/**
 * Ignore a suggestion
 */
export async function ignoreSuggestion(suggestionId) {
  const response = await api.post(`/suggestions/${suggestionId}/ignore`)
  return response.data
}

/**
 * Save a suggestion for later
 */
export async function saveSuggestion(suggestionId) {
  const response = await api.post(`/suggestions/${suggestionId}/save`)
  return response.data
}

/**
 * Contact a company from a suggestion
 */
export async function contactSuggestion({ suggestionId, message, preferredContactMethod }) {
  const response = await api.post(`/suggestions/${suggestionId}/contact`, {
    message,
    preferredContactMethod,
  })
  return response.data
}
