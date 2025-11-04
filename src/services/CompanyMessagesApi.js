import api from './Api'

/**
 * Service de messagerie entreprise - Architecture simplifiée
 * Routes backend:
 * - POST /contacts { companyId } -> crée relation et retourne conversation
 * - GET /contacts -> liste des conversations
 * - GET /contacts/messages/:conversationId -> messages d'une conversation
 * - POST /contacts/messages { conversationId, body } -> envoie message
 * - POST /contacts/conversations/:conversationId/mark-read -> marque comme lu
 */

// ============================================================================
// UTILITAIRES
// ============================================================================

function ensureArray(value) {
  if (Array.isArray(value)) return value
  if (value == null) return []
  if (typeof value === 'object' && !Array.isArray(value)) {
    return Object.values(value)
  }
  return [value]
}

function normalizeString(value, fallback = '') {
  if (!value) return fallback
  return String(value)
}

// ============================================================================
// MAPPERS - Normalisation des données backend
// ============================================================================

function mapConversation(raw) {
  if (!raw || typeof raw !== 'object') return null

  const conversationId = raw.id
    ?? raw.conversation_id
    ?? raw.conversationId
    ?? raw.uuid
    ?? raw.conversation_uuid
    ?? raw.id_conversation
    ?? raw.data?.id
    ?? null

  const company = raw.company ?? raw.companyData ?? raw.data?.company ?? {}
  const companyId = raw.company_id
    ?? raw.companyId
    ?? raw.id_company
    ?? company.id
    ?? company.uuid
    ?? company.id_company
    ?? null

  const companyName = raw.company_name
    ?? raw.companyName
    ?? company.name
    ?? company.company_name
    ?? raw.name

  const messageCount = raw.message_count
    ?? raw.messageCount
    ?? raw.messages_count
    ?? raw.total_messages
    ?? raw.data?.message_count
    ?? null

  const lastMessage = raw.last_message
    ?? raw.lastMessage
    ?? raw.data?.last_message
    ?? raw.latest_message
    ?? null

  const lastMessageBody = typeof lastMessage === 'string'
    ? lastMessage
    : lastMessage?.content ?? lastMessage?.body ?? lastMessage?.message ?? ''

  const lastMessageCreatedAt = typeof lastMessage === 'object'
    ? lastMessage?.created_at ?? lastMessage?.createdAt ?? lastMessage?.sent_at ?? null
    : null

  const companySector = raw.company_sector
    ?? raw.companySector
    ?? company.sector
    ?? company.company_sector
    ?? null

  const participants = ensureArray(raw.participants ?? raw.members ?? raw.data?.participants)

  return {
    id: conversationId ? String(conversationId) : null,
    companyId: companyId ? String(companyId) : null,
    companyName: normalizeString(companyName, 'Entreprise'),
    companySector,
    unreadCount: Number(raw.unread_count ?? raw.unreadCount ?? raw.unread ?? 0),
    messageCount: messageCount != null ? Number(messageCount) : null,
    lastMessagePreview: normalizeString(
      raw.last_message_preview
      ?? raw.lastMessagePreview
      ?? lastMessageBody
      ?? raw.last_message
      ?? raw.lastMessage,
      ''
    ),
    lastMessageAt:
      raw.last_message_at
      ?? raw.lastMessageAt
      ?? lastMessageCreatedAt
      ?? raw.updated_at
      ?? raw.updatedAt
      ?? null,
    lastSender: raw.last_sender ?? raw.lastSender ?? raw.last_sender_role ?? null,
    participants: participants.map((p) => ({
      id: p.id ?? p.user_id ?? p.uuid ?? null,
      name: normalizeString(p.name ?? p.full_name ?? p.email ?? p.display_name, 'Contact'),
      role: p.role ?? p.type ?? p.participant_role ?? null,
    })),
  }
}

function mapMessage(raw) {
  if (!raw || typeof raw !== 'object') return null
  
  return {
    id: raw.id ?? raw.message_id ?? crypto.randomUUID?.() ?? String(Date.now()),
    conversationId: raw.conversation_id ?? raw.conversationId ?? null,
    authorId: raw.author_id ?? raw.authorId ?? raw.user_id ?? null,
    authorName: normalizeString(raw.author_name ?? raw.authorName ?? raw.sender_name, 'Contact'),
    authorRole: raw.author_role ?? raw.authorRole ?? raw.role ?? null,
    content: normalizeString(raw.content ?? raw.body ?? raw.message),
    createdAt: raw.created_at ?? raw.createdAt ?? raw.sent_at ?? new Date().toISOString(),
    attachments: ensureArray(raw.attachments).map((file) => ({
      id: file.id ?? file.name ?? file.url,
      name: normalizeString(file.name ?? file.filename, 'Fichier'),
      url: file.url ?? file.link ?? null,
      size: file.size ?? null,
    })),
  }
}

function extractConversationId(payload) {
  if (!payload || typeof payload !== 'object') return null

  const candidates = [
    payload.conversationId,
    payload.conversation_id,
    payload.conversation_uuid,
    payload.id_conversation,
    payload?.conversation?.id,
    payload?.conversation?.conversation_id,
    payload?.data?.conversationId,
    payload?.data?.conversation_id,
    payload?.data?.conversation?.id,
    payload?.relation?.conversationId,
    payload?.contact?.conversationId,
  ]

  for (const candidate of candidates) {
    if (candidate != null) {
      return String(candidate)
    }
  }

  return null
}

function extractConversation(payload) {
  if (!payload || typeof payload !== 'object') return null

  const candidates = [
    payload.conversation,
    payload.data?.conversation,
    payload.conversationData,
    payload.data?.conversationData,
    payload.relation?.conversation,
    payload.contact?.conversation,
    payload,
  ]

  for (const candidate of candidates) {
    const mapped = mapConversation(candidate)
    if (mapped?.id) {
      return mapped
    }
  }

  return null
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * Crée une relation avec une entreprise (contact)
 * Backend: POST /contacts { companyId }
 */
export async function createCompanyContact(companyId) {
  if (!companyId) {
    throw new Error('companyId requis')
  }

  try {
    const response = await api.post('/contacts', { companyId })
    let conversation = extractConversation(response.data)
    let conversationId = conversation?.id ?? extractConversationId(response.data)

    if (!conversation?.id && conversationId) {
      const fetched = await getCompanyConversation(conversationId)
      if (fetched?.id) {
        conversation = fetched
      }
    }

    return {
      conversation,
      conversationId,
      success: true,
    }
  } catch (error) {
    // Si relation existe déjà (409), on récupère la conversation
    if (error?.response?.status === 409) {
      let conversation = extractConversation(error.response.data)
      let conversationId = conversation?.id ?? extractConversationId(error.response.data)

      if (!conversation?.id && conversationId) {
        const fetched = await getCompanyConversation(conversationId)
        if (fetched?.id) {
          conversation = fetched
        }
      }

      return {
        conversation,
        conversationId,
        success: true,
        alreadyExists: true,
      }
    }
    throw error
  }
}

/**
 * Récupère la liste des conversations
 * Backend: GET /contacts
 */
export async function getCompanyConversations(params = {}) {
  try {
    const response = await api.get('/contacts', { params })
    const payload = response.data
    
    let items = []

    if (Array.isArray(payload?.conversations)) {
      items = payload.conversations
    } else if (Array.isArray(payload?.data?.conversations)) {
      items = payload.data.conversations
    } else if (Array.isArray(payload?.data?.items)) {
      items = payload.data.items
    } else if (Array.isArray(payload?.items)) {
      items = payload.items
    } else if (Array.isArray(payload)) {
      items = payload
    } else {
      items = ensureArray(payload?.data ?? payload)
    }

    const conversations = items.map(mapConversation).filter((conversation) => conversation?.id)

    return {
      conversations,
      meta: {
        total: payload?.total ?? conversations.length,
        unread: payload?.unread ?? payload?.unread_count ?? 0,
      },
    }
  } catch (error) {
    if (error?.response?.status === 404) {
      return { conversations: [], meta: { total: 0, unread: 0 } }
    }
    throw error
  }
}

/**
 * Récupère les détails d'une conversation
 * Backend: GET /contacts/messages/:conversationId
 */
export async function getCompanyConversation(conversationId) {
  if (!conversationId) {
    throw new Error('conversationId requis')
  }

  try {
    const response = await api.get(`/contacts/messages/${conversationId}`)
    return mapConversation(response.data?.conversation ?? response.data)
  } catch (error) {
    if (error?.response?.status === 404) {
      return null
    }
    throw error
  }
}

/**
 * Récupère les messages d'une conversation
 * Backend: GET /contacts/messages/:conversationId
 */
export async function getCompanyMessages(conversationId, params = {}) {
  if (!conversationId) {
    throw new Error('conversationId requis')
  }

  try {
    const response = await api.get(`/contacts/messages/${conversationId}`, { params })
    const payload = response.data
    
    const items = ensureArray(
      payload?.messages ?? 
      payload?.data?.messages ?? 
      payload?.data ?? 
      payload
    )
    
    return items.map(mapMessage).filter(Boolean)
  } catch (error) {
    if (error?.response?.status === 404) {
      return []
    }
    throw error
  }
}

/**
 * Envoie un message dans une conversation
 * Backend: POST /contacts/messages { conversationId, body }
 */
export async function sendCompanyMessage({ conversationId, body }) {
  if (!conversationId) {
    throw new Error('conversationId requis')
  }
  if (!body?.trim()) {
    throw new Error('body requis')
  }

  const response = await api.post('/contacts/messages', {
    conversationId,
    body: body.trim(),
  })
  
  return mapMessage(response.data?.message ?? response.data)
}

/**
 * Marque une conversation comme lue
 * Backend: POST /contacts/conversations/:conversationId/mark-read
 */
export async function markConversationAsRead(conversationId) {
  if (!conversationId) {
    throw new Error('conversationId requis')
  }

  await api.post(`/contacts/conversations/${conversationId}/mark-read`)
  return { success: true }
}

/**
 * Crée une conversation avec une entreprise
 * Étapes:
 * 1. Créer la relation (createCompanyContact)
 * 2. Récupérer la conversation créée
 * 3. Optionnel: envoyer un message initial
 */
export async function createCompanyConversation({ companyId, initialMessage }) {
  if (!companyId) {
    throw new Error('companyId requis')
  }

  // Étape 1: Créer la relation
  const contactResult = await createCompanyContact(companyId)
  let conversation = contactResult?.conversation ?? null
  let conversationId = conversation?.id ?? contactResult?.conversationId ?? null

  if (!conversation?.id && conversationId) {
    conversation = await getCompanyConversation(conversationId)
  }

  // Étape 2: Si pas de conversation retournée, récupérer la liste
  if (!conversation?.id) {
    const list = await getCompanyConversations()
    conversation = list.conversations.find(
      (c) => String(c.companyId) === String(companyId)
    )
    conversationId = conversation?.id ?? conversationId
  }

  if (!conversation?.id) {
    throw new Error('Impossible de créer la conversation')
  }

  // Étape 3: Envoyer message initial si fourni
  if (initialMessage?.trim()) {
    await sendCompanyMessage({
      conversationId: conversation.id,
      body: initialMessage.trim(),
    })
  }

  return conversation
}
