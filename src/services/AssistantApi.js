import api from './Api'

function ensureObject(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value
  }
  return {}
}

export async function getAssistantTemplates() {
  const response = await api.get('/assistant/templates')
  return response.data
}

export async function getAssistantConversations(params = {}) {
  const response = await api.get('/assistant/conversations', { params })
  return response.data
}

export async function createAssistantConversation(payload = {}) {
  const response = await api.post('/assistant/conversations', ensureObject(payload))
  return response.data
}

export async function getAssistantMessages(conversationId) {
  if (!conversationId) {
    throw new Error('conversationId requis pour récupérer les messages')
  }
  const response = await api.get(`/assistant/conversations/${conversationId}/messages`)
  return response.data
}

export async function getAssistantUpdates(conversationId, since) {
  if (!conversationId) {
    throw new Error('conversationId requis pour récupérer les mises à jour')
  }
  const response = await api.get(`/assistant/conversations/${conversationId}/updates`, {
    params: since ? { since } : undefined,
  })
  return response.data
}

export async function sendAssistantMessage(payload = {}) {
  const response = await api.post('/assistant/messages', payload)
  return response.data
}

export async function escalateAssistantSupport(payload = {}) {
  const response = await api.post('/assistant/escalations', payload)
  return response.data
}
