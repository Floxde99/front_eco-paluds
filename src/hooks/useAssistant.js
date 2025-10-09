import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getAssistantTemplates,
  getAssistantConversations,
  createAssistantConversation,
  getAssistantMessages,
  getAssistantUpdates,
  sendAssistantMessage,
  escalateAssistantSupport,
} from '@/services/AssistantApi'

function unwrapData(payload) {
  if (!payload) return undefined
  if (Array.isArray(payload)) return payload
  if (payload.data !== undefined) return unwrapData(payload.data)
  if (payload.result !== undefined) return unwrapData(payload.result)
  if (payload.items !== undefined) return unwrapData(payload.items)
  return payload
}

function ensureArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'object') {
    return Object.values(value)
  }
  return []
}

function normalizeTemplate(template, fallbackIndex = 0) {
  if (!template) return null
  return {
    id: template.id ?? template.templateId ?? String(fallbackIndex),
    label: template.label ?? template.name ?? template.title ?? 'Action rapide',
    prompt: template.prompt ?? template.description ?? '',
  }
}

function normalizeConversation(conversation, fallbackIndex = 0) {
  if (!conversation) return null
  const status = conversation.status ?? conversation.state ?? 'ACTIVE'
  const updatedAt =
    conversation.lastMessageAt ??
    conversation.updatedAt ??
    conversation.createdAt ??
    null

  return {
    id: conversation.id ?? conversation.conversationId ?? String(fallbackIndex),
    title: conversation.title ?? conversation.name ?? 'Conversation sans titre',
    status,
    lastMessageAt: updatedAt,
  }
}

function normalizeSegment(segment) {
  if (segment == null) return null
  
  console.log(`🔸 Normalisation segment:`, segment)
  
  if (typeof segment === 'string') {
    return {
      type: 'text',
      text: segment,
    }
  }
  const type = segment.type ?? segment.kind ?? 'text'
  if (type === 'link') {
    return {
      type: 'link',
      text: segment.text ?? segment.label ?? segment.title ?? '',
      href: segment.href ?? segment.url ?? '#',
    }
  }
  if (type === 'button') {
    return {
      type: 'button',
      text: segment.text ?? segment.label ?? 'Action',
      payload: segment.payload ?? segment.action ?? null,
    }
  }
  return {
    type: 'text',
    text: segment.text ?? segment.content ?? segment.value ?? '',
  }
}

function normalizeAssistantMessage(message, index = 0) {
  if (!message) return null
  
  console.log(`🔍 Normalisation message #${index}:`, message)
  
  const role = message.role ?? message.author ?? message.type ?? 'assistant'
  const createdAt = message.createdAt ?? message.timestamp ?? message.sentAt ?? null
  const status = message.status ?? message.state ?? message.messageStatus ?? 'completed'
  const tokensIn = message.tokensIn ?? message.promptTokens ?? null
  const tokensOut = message.tokensOut ?? message.completionTokens ?? null
  const usage = message.tokens ?? message.usage ?? null
  const retryAfter = message.retryAfter ?? message.meta?.retryAfter ?? message.metadata?.retryAfter ?? null
  const metadata = message.metadata ?? message.meta ?? null
  
  // Gérer le cas où content est une string simple
  let segmentsSource = message.content ?? message.segments ?? message.body ?? message.text ?? message.message ?? []
  
  console.log(`📝 Content brut (type: ${typeof segmentsSource}):`, segmentsSource)
  
  // Si content est un objet vide {}, chercher ailleurs
  if (segmentsSource && typeof segmentsSource === 'object' && !Array.isArray(segmentsSource)) {
    const keys = Object.keys(segmentsSource)
    if (keys.length === 0) {
      // Objet vide, chercher dans d'autres champs
      segmentsSource = message.text ?? message.body ?? message.message ?? ''
      console.log(`⚠️ Content était un objet vide, fallback sur:`, segmentsSource)
    }
  }
  
  // Si content est une string, la convertir en tableau de segments
  if (typeof segmentsSource === 'string') {
    segmentsSource = [{ type: 'text', text: segmentsSource }]
  }
  
  // Si content est déjà parsé en objet mais pas en array
  if (segmentsSource && !Array.isArray(segmentsSource) && typeof segmentsSource === 'object') {
    // Tenter de parse si c'est du JSON stringifié
    try {
      const parsed = typeof segmentsSource === 'string' ? JSON.parse(segmentsSource) : segmentsSource
      if (Array.isArray(parsed)) {
        segmentsSource = parsed
      } else if (parsed.text) {
        segmentsSource = [parsed]
      }
    } catch {
      segmentsSource = [{ type: 'text', text: String(segmentsSource) }]
    }
  }
  
  const segments = ensureArray(segmentsSource)
    .map(normalizeSegment)
    .filter(Boolean)
  
  // Si toujours vide, créer un segment par défaut avec le texte brut
  if (segments.length === 0 && (message.content || message.text || message.body || message.message)) {
    const fallbackText = message.text || message.message || message.body || message.content
    if (fallbackText && typeof fallbackText === 'string') {
      segments.push({
        type: 'text',
        text: fallbackText
      })
    }
  }
  
  console.log(`✅ Segments finaux (${segments.length}):`, segments)

  return {
    id: message.id ?? message.messageId ?? `msg-${index}`,
    role,
    createdAt,
    status,
    tokensIn,
    tokensOut,
    usage,
    retryAfter,
    metadata,
    content: segments,
  }
}

export { normalizeAssistantMessage, normalizeConversation }

export const assistantKeys = {
  all: ['assistant'],
  templates: () => [...assistantKeys.all, 'templates'],
  conversations: () => [...assistantKeys.all, 'conversations'],
  messages: (conversationId) => [...assistantKeys.all, 'messages', conversationId],
}

export function useAssistantTemplates() {
  return useQuery({
    queryKey: assistantKeys.templates(),
    queryFn: getAssistantTemplates,
    staleTime: 10 * 60 * 1000,
    select: (data) =>
      ensureArray(unwrapData(data)).map((template, index) => normalizeTemplate(template, index)).filter(Boolean),
  })
}

export function useAssistantConversations(params = {}) {
  return useQuery({
    queryKey: assistantKeys.conversations(),
    queryFn: () => getAssistantConversations(params),
    staleTime: 30 * 1000,
    select: (data) => {
      const payload = unwrapData(data)
      if (!payload) return []
      if (Array.isArray(payload)) {
        return payload.map((item, index) => normalizeConversation(item, index)).filter(Boolean)
      }
      const items = ensureArray(payload.items ?? payload.records ?? payload.data ?? payload.results)
      return items.map((item, index) => normalizeConversation(item, index)).filter(Boolean)
    },
  })
}

export function useAssistantMessages(conversationId) {
  return useQuery({
    queryKey: assistantKeys.messages(conversationId),
    queryFn: () => getAssistantMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 5 * 1000,
    select: (data) => {
      console.log('📩 Messages bruts reçus:', data)
      const payload = unwrapData(data)
      console.log('📦 Payload après unwrap:', payload)
      let rawMessages = []

      if (Array.isArray(payload)) {
        rawMessages = payload
      } else if (payload?.messages) {
        rawMessages = ensureArray(payload.messages)
      } else if (payload?.data) {
        rawMessages = ensureArray(payload.data)
      } else {
        rawMessages = ensureArray(payload)
      }

      console.log('📨 Messages en array:', rawMessages)
      
      const messages = rawMessages
        .map((item, index) => {
          console.log(`\n--- Message ${index} brut ---`, item)
          return normalizeAssistantMessage(item, index)
        })
        .filter(Boolean)
        .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
      
      console.log('✨ Messages normalisés finaux:', messages)
      return messages
    },
  })
}

export function useCreateAssistantConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAssistantConversation,
    onError: (error) => {
      console.error('❌ Erreur création conversation IA:', error)
      const message = error.response?.data?.error || 'Impossible de créer la conversation'
      toast.error(message)
    },
    onSuccess: async (data) => {
      const payload = unwrapData(data)
      const conversation = normalizeConversation(payload)
      toast.success('Nouvelle conversation IA créée')
      await queryClient.invalidateQueries({ queryKey: assistantKeys.conversations() })
      return conversation
    },
  })
}

export function useSendAssistantMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (payload) => {
      console.log('📤 Envoi message:', payload)
      return sendAssistantMessage(payload)
    },
    onSuccess: (data, variables) => {
      console.log('✅ Message envoyé avec succès:', data)
      // Invalider les messages de la conversation concernée
      if (variables?.conversationId) {
        queryClient.invalidateQueries({ 
          queryKey: assistantKeys.messages(variables.conversationId) 
        })
      }
      // Invalider aussi la liste des conversations pour mettre à jour lastMessageAt
      queryClient.invalidateQueries({ 
        queryKey: assistantKeys.conversations() 
      })
    },
    onError: (error) => {
      console.error('❌ Erreur envoi message IA:', error)
      if (error?.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfter || error.response?.headers?.['retry-after']
        toast.error(
          retryAfter
            ? `Limite atteinte. Réessayez dans ${retryAfter} secondes.`
            : 'Limite de messages atteinte. Réessayez un peu plus tard.'
        )
        return
      }
      const message = error.response?.data?.error || 'Impossible d\'envoyer le message pour le moment'
      toast.error(message)
    },
  })
}

export function useEscalateAssistant() {
  return useMutation({
    mutationFn: escalateAssistantSupport,
    onError: (error) => {
      console.error('❌ Erreur escalade support:', error)
      const message = error.response?.data?.error || 'Impossible de contacter le support pour le moment'
      toast.error(message)
    },
    onSuccess: () => {
      toast.success('Demande transmise à l\'équipe support')
    },
  })
}

export async function fetchAssistantUpdates(conversationId, since) {
  const raw = await getAssistantUpdates(conversationId, since)
  const payload = unwrapData(raw) ?? raw
  const messages = ensureArray(payload?.messages ?? payload?.data ?? payload)
    .map((item, index) => normalizeAssistantMessage(item, index))
    .filter(Boolean)
  const statusNormalized = payload?.statusNormalized ?? raw?.statusNormalized ?? null
  const status = statusNormalized ?? payload?.status ?? raw?.status ?? null
  const retryAfter = payload?.retryAfter ?? payload?.meta?.retryAfter ?? raw?.retryAfter ?? null
  return {
    messages,
    status,
    tokens: payload?.tokens ?? payload?.tokensOut ?? payload?.usage ?? null,
    tokensIn: payload?.tokensIn ?? null,
    tokensOut: payload?.tokensOut ?? null,
    updatedAt: payload?.updatedAt ?? null,
    statusNormalized,
    retryAfter,
  }
}
