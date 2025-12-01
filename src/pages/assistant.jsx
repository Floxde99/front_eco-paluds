import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, CheckCircle2, ChevronRight, Headset, Loader2, MessageCircle, Send, Sparkles, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useAssistantTemplates,
  useAssistantConversations,
  useAssistantMessages,
  useCreateAssistantConversation,
  useSendAssistantMessage,
  useEscalateAssistant,
  fetchAssistantUpdates,
} from '@/hooks/useAssistant'

function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Il y a quelques instants'
  const now = new Date()
  const date = new Date(timestamp)
  const seconds = Math.floor((now - date) / 1000)
  if (seconds < 60) return 'Il y a quelques instants'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  return date.toLocaleDateString('fr-FR')
}

function ConversationList({ conversations, onSelect }) {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
        Aucune conversation récente
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect?.(conversation.id)}
          className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">{conversation.title}</p>
            <p className="text-xs text-slate-500">{formatRelativeTime(conversation.lastMessageAt)}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
      ))}
    </div>
  )
}

function QuickActions({ templates, onSelect, disabled = false }) {
  if (!templates || templates.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {templates.map((template) => (
        <Button
          key={template.id}
          onClick={() => onSelect?.(template)}
          variant="outline"
          disabled={disabled}
          className="w-full justify-start gap-2 border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Sparkles className="h-4 w-4" />
          </span>
          {template.label}
        </Button>
      ))}
    </div>
  )
}

function MessageContent({ segments, onActionClick }) {
  if (!segments || segments.length === 0) {
    return <p className="text-sm text-slate-500">Message vide</p>
  }

  return (
    <div className="space-y-3">
      {segments.map((segment, idx) => {
        if (segment.type === 'action') {
          return (
            <Button
              key={idx}
              size="sm"
              variant="outline"
              className="w-full justify-start gap-2 border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50"
              onClick={() => onActionClick?.(segment.route)}
            >
              <Sparkles className="h-4 w-4 text-blue-600" />
              <div className="text-left">
                <div className="text-sm font-semibold">{segment.label || 'Action'}</div>
                {segment.description ? (
                  <div className="text-xs text-slate-500">{segment.description}</div>
                ) : null}
              </div>
            </Button>
          )
        }
        if (segment.type === 'link') {
          return (
            <a
              key={idx}
              href={segment.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-blue-600 underline hover:text-blue-800"
            >
              {segment.text}
            </a>
          )
        }
        if (segment.type === 'button') {
          return (
            <Button
              key={idx}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                if (segment.payload) {
                  toast.info(`Action: ${segment.payload}`)
                }
              }}
            >
              {segment.text}
            </Button>
          )
        }
        return (
          <p key={idx} className="text-sm text-slate-700 whitespace-pre-wrap">
            {segment.text}
          </p>
        )
      })}
    </div>
  )
}

function MessageBubble({ message, userName = 'Vous', onActionClick }) {
  const role = (message.role ?? '').toLowerCase()
  const isUser = role === 'user' || role === 'me' || role === 'client' || role === 'owner'
  const isSystem = role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="rounded-lg bg-slate-100 px-4 py-2 text-xs text-slate-600">
          {message.content?.[0]?.text || 'Message système'}
        </div>
      </div>
    )
  }

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[65%] rounded-2xl bg-blue-600 p-4 text-sm text-white shadow-sm">
          <div className="mb-2 flex items-center justify-between text-xs text-blue-100">
            <span className="font-semibold">{userName}</span>
            <span>{formatRelativeTime(message.createdAt)}</span>
          </div>
          <MessageContent segments={message.content} onActionClick={onActionClick} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Assistant IA</span>
          <span className="text-xs text-slate-400">{formatRelativeTime(message.createdAt)}</span>
        </div>
        <MessageContent segments={message.content} onActionClick={onActionClick} />
      </div>
    </div>
  )
}


export default function AssistantSupportPage() {
  const navigate = useNavigate()
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [message, setMessage] = useState('')
  const [isPolling, setIsPolling] = useState(false)
  const [rateLimitRemaining, setRateLimitRemaining] = useState(0)
  const [rateLimitUntil, setRateLimitUntil] = useState(null)
  const messagesEndRef = useRef(null)
  const pollingTimeoutRef = useRef(null)
  const rateLimitIntervalRef = useRef(null)

  const { data: templates } = useAssistantTemplates()
  const { data: conversations, refetch: refetchConversations } = useAssistantConversations()
  const { data: messages = [], refetch: refetchMessages } = useAssistantMessages(currentConversationId)

  const createConversationMutation = useCreateAssistantConversation()
  const sendMessageMutation = useSendAssistantMessage()
  const escalateMutation = useEscalateAssistant()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const normalizedConversations = useMemo(() => {
    const map = new Map()
    ;(conversations ?? []).forEach((conv) => {
      if (!conv?.id) return
      const existing = map.get(conv.id)
      const existingDate = existing?.lastMessageAt ? new Date(existing.lastMessageAt).getTime() : 0
      const nextDate = conv?.lastMessageAt ? new Date(conv.lastMessageAt).getTime() : 0
      if (!existing || nextDate >= existingDate) {
        map.set(conv.id, conv)
      }
    })
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime()
    )
  }, [conversations])

  useEffect(() => {
    if (!currentConversationId && normalizedConversations.length) {
      setCurrentConversationId(normalizedConversations[0].id)
    }
  }, [currentConversationId, normalizedConversations])

  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current)
      }
      if (rateLimitIntervalRef.current) {
        clearInterval(rateLimitIntervalRef.current)
      }
    }
  }, [])

  const updateRateLimitTimer = useCallback((targetTimestamp) => {
    if (!targetTimestamp) {
      setRateLimitRemaining(0)
      setRateLimitUntil(null)
      return
    }

    setRateLimitUntil((previous) => {
      if (previous && previous > targetTimestamp) {
        return previous
      }
      return targetTimestamp
    })
  }, [])

  useEffect(() => {
    if (!rateLimitUntil || rateLimitUntil <= Date.now()) {
      setRateLimitRemaining(0)
      if (rateLimitIntervalRef.current) {
        clearInterval(rateLimitIntervalRef.current)
        rateLimitIntervalRef.current = null
      }
      return
    }

    const computeRemaining = () => {
      const seconds = Math.ceil((rateLimitUntil - Date.now()) / 1000)
      const clamped = seconds > 0 ? seconds : 0
      setRateLimitRemaining(clamped)
      if (clamped <= 0 && rateLimitIntervalRef.current) {
        clearInterval(rateLimitIntervalRef.current)
        rateLimitIntervalRef.current = null
      }
    }

    computeRemaining()
    rateLimitIntervalRef.current = setInterval(computeRemaining, 1000)

    return () => {
      if (rateLimitIntervalRef.current) {
        clearInterval(rateLimitIntervalRef.current)
        rateLimitIntervalRef.current = null
      }
    }
  }, [rateLimitUntil])

  const parseRetryAfter = useCallback((retryAfter) => {
    if (retryAfter == null) return null
    const now = Date.now()

    if (typeof retryAfter === 'number') {
      if (retryAfter > 0 && retryAfter < 10_000) {
        return now + retryAfter * 1000
      }
      if (retryAfter > 10_000_000_000) {
        return retryAfter
      }
      if (retryAfter > 0) {
        return now + retryAfter
      }
    }

    if (typeof retryAfter === 'string') {
      const numeric = Number.parseFloat(retryAfter)
      if (Number.isFinite(numeric) && numeric > 0) {
        if (numeric > 10_000) {
          return now + numeric
        }
        return now + numeric * 1000
      }

      const parsed = Date.parse(retryAfter)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }

    return now + 60_000
  }, [])

  const startRateLimitTimer = useCallback((retryAfter) => {
    const target = parseRetryAfter(retryAfter)
    if (!target) return
    updateRateLimitTimer(target)
  }, [parseRetryAfter, updateRateLimitTimer])

  const formatRemaining = useCallback((seconds) => {
    if (seconds <= 0) return 'quelques secondes'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (minutes <= 0) return `${secs}s`
    return `${minutes}m${secs.toString().padStart(2, '0')}s`
  }, [])
  useEffect(() => {
    if (!messages || messages.length === 0) return
    if (rateLimitUntil && rateLimitUntil > Date.now()) return

    const lastAssistantMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === 'assistant')

    if (!lastAssistantMessage) return

    const status = String(lastAssistantMessage.status ?? '').toLowerCase()
    const textContent = lastAssistantMessage.content
      ?.map((segment) => segment?.text?.toLowerCase?.() ?? '')
      .join(' ')

    const isRateLimited =
      status.includes('rate') ||
      status.includes('limit') ||
      status.includes('capacity') ||
      textContent.includes('capacité mistral') ||
      textContent.includes('limite atteinte')

    if (isRateLimited) {
      const retryAfter =
        lastAssistantMessage.retryAfter ??
        lastAssistantMessage.metadata?.retryAfter ??
        lastAssistantMessage.metadata?.retryAt ??
        null
      startRateLimitTimer(retryAfter)
    }
  }, [messages, rateLimitUntil, startRateLimitTimer])

  const startPolling = async (conversationId, lastMessageTimestamp) => {
    if (!conversationId) return
    setIsPolling(true)

    const pollForUpdates = async () => {
      try {
        const updates = await fetchAssistantUpdates(conversationId, lastMessageTimestamp)
        
        if (updates.messages && updates.messages.length > 0) {
          await refetchMessages()
          setIsPolling(false)
          return
        }
        const status = typeof updates.status === 'string' ? updates.status.toLowerCase() : null
        const normalizedStatus =
          typeof updates.statusNormalized === 'string' ? updates.statusNormalized.toLowerCase() : null

        const shouldStop = (status && ['completed', 'awaiting_user', 'awaiting-user', 'error', 'failed'].includes(status)) ||
          (normalizedStatus && ['completed', 'awaiting_user', 'awaiting-user', 'error', 'failed'].includes(normalizedStatus))

        if (shouldStop) {
          await refetchMessages()
          setIsPolling(false)
          const statusCandidates = [status, normalizedStatus]
          const isRateLimitedStop = statusCandidates.some(
            (value) => value && (value.includes('rate') || value.includes('limit') || value.includes('capacity'))
          )
          if (isRateLimitedStop) {
            startRateLimitTimer(updates.retryAfter)
          }
          return
        }

        const isRateLimited = [status, normalizedStatus].some(
          (value) => value && (value.includes('rate') || value.includes('limit') || value.includes('capacity'))
        )

        if (isRateLimited) {
          startRateLimitTimer(updates.retryAfter)
        }

        pollingTimeoutRef.current = setTimeout(pollForUpdates, 2000)
      } catch (error) {
        console.error('❌ Erreur polling:', error)
        setIsPolling(false)
      }
    }

    pollingTimeoutRef.current = setTimeout(pollForUpdates, 2000)
  }

  const handleCreateConversation = async (templateId = null, title = 'Nouvelle conversation') => {
    try {
      const payload = templateId ? { templateId } : { title }
      const result = await createConversationMutation.mutateAsync(payload)
      const newConversationId = result?.id || result?.conversationId
      
      if (newConversationId) {
        setCurrentConversationId(newConversationId)
        await refetchConversations()
        await refetchMessages()
      }
      
      return newConversationId
    } catch (error) {
      console.error('❌ Erreur création conversation:', error)
      return null
    }
  }

  const handleTemplateClick = async (template) => {
    const conversationId = currentConversationId || await handleCreateConversation(template.id, template.label)
    if (!conversationId) return

    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        message: template.prompt,
      })

      // Rafraîchir immédiatement pour afficher le message utilisateur
      await refetchMessages()
      
      const lastTimestamp = new Date().toISOString()
      startPolling(conversationId, lastTimestamp)
    } catch (error) {
      console.error('❌ Erreur envoi template:', error)
      if (error?.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfter ?? error.response?.headers?.['retry-after']
        startRateLimitTimer(retryAfter)
      }
    }
  }

  const handleSendMessage = async (event) => {
    event.preventDefault()
    if (!message.trim()) {
      toast.info('Ajoutez un message avant de l\'envoyer.')
      return
    }

    let conversationId = currentConversationId
    if (!conversationId) {
      conversationId = await handleCreateConversation(null, 'Nouvelle conversation')
      if (!conversationId) return
    }

    const userMessage = message
    setMessage('')

    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        message: userMessage,
      })

      // Rafraîchir immédiatement pour afficher le message utilisateur
      await refetchMessages()
      
      const lastTimestamp = new Date().toISOString()
      startPolling(conversationId, lastTimestamp)
    } catch (error) {
      console.error('❌ Erreur envoi message:', error)
      if (error?.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfter ?? error.response?.headers?.['retry-after']
        startRateLimitTimer(retryAfter)
      }
      setMessage(userMessage)
    }
  }

  const handleEscalate = async () => {
    if (!currentConversationId) {
      toast.error('Aucune conversation active à transférer au support')
      return
    }

    try {
      await escalateMutation.mutateAsync({
        conversationId: currentConversationId,
        reason: 'Escalade demandée par l\'utilisateur',
      })
    } catch (error) {
      console.error('❌ Erreur escalade:', error)
    }
  }

  const handleNewConversation = async () => {
    await handleCreateConversation(null, 'Nouvelle conversation')
  }

  const handleSelectConversation = (conversationId) => {
    setCurrentConversationId(conversationId)
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
      setIsPolling(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-600">EcoConnect Paluds</p>
          <h1 className="text-3xl font-bold text-slate-900">Assistant IA EcoConnect</h1>
          <p className="text-sm text-slate-600">
            Discutez avec notre assistant spécialisé en économie circulaire. Il analyse vos questions et vous oriente, notre équipe support prenant le relais uniquement si nécessaire.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6">
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">Assistant IA</h2>
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        En ligne
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Je suis votre assistant spécialisé en économie circulaire. Je peux vous aider à optimiser vos synergies industrielles.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold uppercase text-slate-500">Conversations récentes</h3>
                <p className="text-xs text-slate-400">Reprenez là où vous vous êtes arrêté</p>
              </div>
              <ConversationList conversations={normalizedConversations} onSelect={handleSelectConversation} />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold uppercase text-slate-500">Actions rapides</h3>
                <p className="text-xs text-slate-400">Démarrez une analyse en un clic</p>
              </div>
              <QuickActions
                templates={templates}
                onSelect={handleTemplateClick}
                disabled={rateLimitRemaining > 0}
              />
              {rateLimitRemaining > 0 && (
                <p className="text-xs text-amber-600">
                  Limite de messages atteinte. Réessayez dans {formatRemaining(rateLimitRemaining)}.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <Headset className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold">Besoin du support humain ?</p>
                  <p className="text-xs text-slate-500">
                    Notre équipe reste disponible si l'assistant n'a pas résolu votre demande.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleEscalate}
                disabled={escalateMutation.isPending || !currentConversationId}
                className="mt-3 w-full bg-slate-900 hover:bg-slate-800"
              >
                {escalateMutation.isPending ? 'Envoi...' : 'Contacter le support'}
              </Button>
            </div>
          </aside>

          <main>
            <Card className="flex h-[calc(100vh-12rem)] flex-col border border-slate-200 shadow-sm">
              <CardHeader className="flex-shrink-0 border-b border-slate-200 bg-white px-6 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-slate-900">Assistant IA EcoConnect</h2>
                      <Badge className="bg-blue-100 text-blue-700">Spécialiste économie circulaire</Badge>
                    </div>
                    <p className="text-xs text-slate-500">Réponses intelligentes basées sur vos données industrielles</p>
                  </div>
                  <Button
                    onClick={handleNewConversation}
                    disabled={createConversationMutation.isPending}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Nouveau
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col justify-between gap-6 overflow-hidden bg-slate-50 p-6">
                <div className="flex-1 space-y-6 overflow-y-auto">
                  {messages.length === 0 && !isPolling && (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <Bot className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                        <p className="text-lg font-medium text-slate-600">Bienvenue !</p>
                        <p className="text-sm text-slate-500">
                          Commencez une conversation ou utilisez une action rapide
                        </p>
                      </div>
                    </div>
                  )}

                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      userName="Marie D."
                      onActionClick={(route) => route && navigate(route)}
                    />
                  ))}

                  {isPolling && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      <p className="text-xs text-slate-400">L'assistant tape...</p>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="flex-shrink-0 space-y-3">
                  <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault()
                          handleSendMessage(event)
                        }
                      }}
                      rows={2}
                      placeholder="Tapez votre message..."
                      disabled={sendMessageMutation.isPending || isPolling || rateLimitRemaining > 0}
                      className="h-full w-full resize-none border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                    />
                    <Button
                      type="submit"
                      disabled={
                        sendMessageMutation.isPending ||
                        isPolling ||
                        !message.trim() ||
                        rateLimitRemaining > 0
                      }
                      className="shrink-0 rounded-full bg-blue-600 p-3 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                      <span>Traitement sécurisé des données</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {rateLimitRemaining > 0 && (
                        <span className="text-amber-500">
                          Limite atteinte, retour dans {formatRemaining(rateLimitRemaining)}
                        </span>
                      )}
                      <span>L'IA peut faire des erreurs, vérifiez les informations importantes.</span>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}

