import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCompanyConversations, useCompanyConversationMessages, useMessagingHelpers } from '@/hooks/useCompanyMessaging'
import { useDashboardData } from '@/hooks/useDashboardQuery'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Loader2, MessageSquare, Plus, Search, Send, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatRelative(value) {
  if (!value) return 'Il y a quelques instants'
  const timestamp = new Date(value)
  const now = new Date()
  if (Number.isNaN(timestamp.getTime())) return 'Il y a quelques instants'
  const seconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000)
  if (seconds < 10) return 'À l\'instant'
  if (seconds < 60) return `Il y a ${seconds} seconde${seconds > 1 ? 's' : ''}`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  return timestamp.toLocaleDateString('fr-FR')
}

function ConversationItem({ conversation, active, onSelect }) {
  const initials = conversation.companyName?.slice(0, 2)?.toUpperCase() ?? 'EC'
  return (
    <button
      type="button"
      onClick={() => onSelect(conversation)}
      className={cn(
        'w-full rounded-lg border px-3 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/60',
        active ? 'border-blue-300 bg-blue-50 shadow-sm' : 'border-transparent'
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900 line-clamp-1">
              {conversation.companyName}
            </p>
            <span className="text-xs text-slate-400 shrink-0">{formatRelative(conversation.lastMessageAt)}</span>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2">
            {conversation.lastMessagePreview || 'Nouvelle conversation'}
          </p>
          <div className="flex items-center gap-2">
            {conversation.companySector && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                {conversation.companySector}
              </Badge>
            )}
            {conversation.unreadCount > 0 && (
              <Badge className="bg-blue-600 text-white">
                {conversation.unreadCount} non lu{conversation.unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

function MessageBubble({ message, isOwn }) {
  return (
    <div
      className={cn(
        'max-w-[72%] rounded-2xl px-4 py-3 shadow-sm border transition',
        isOwn
          ? 'ml-auto bg-blue-600 text-white border-blue-700/60'
          : 'mr-auto bg-white text-slate-800 border-slate-200'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={cn('text-xs font-semibold tracking-wide uppercase', isOwn ? 'text-blue-50' : 'text-slate-500')}>
          {isOwn ? 'Vous' : message.authorName}
        </p>
        <span className={cn('text-[10px]', isOwn ? 'text-blue-100' : 'text-slate-400')}>
          {formatRelative(message.createdAt)}
        </span>
      </div>
      <p className="mt-1 text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
      {message.attachments?.length ? (
        <div className="mt-2 space-y-1 text-xs">
          {message.attachments.map((file) => (
            <a key={file.id} href={file.url ?? '#'} target="_blank" rel="noopener noreferrer" className={cn('underline', isOwn ? 'text-blue-100' : 'text-blue-600')}>
              {file.name}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ConversationPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center space-y-3">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <MessageSquare className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">Sélectionnez une entreprise</h2>
        <p className="text-sm text-slate-500">
          Choisissez une conversation dans la liste ou démarrez un nouvel échange.
        </p>
      </div>
    </div>
  )
}

export default function CompanyMessagesPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { companies = [] } = useDashboardData()
  const { data, isLoading, isError, refetch } = useCompanyConversations()
  const {
    ensureContact,
    createConversation,
    sendMessage,
    markAsRead,
    createConversationMutation,
    sendMessageMutation,
  } = useMessagingHelpers()
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [creatingConversation, setCreatingConversation] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [prefilledCompany, setPrefilledCompany] = useState(() => location.state?.company ?? null)
  const processedCompanyRef = useRef(null)
  const messagesEndRef = useRef(null)

  const normalizeId = useCallback((value) => (value == null ? null : String(value)), [])

  const normalizedCompanies = useMemo(() => {
    if (Array.isArray(companies)) return companies
    if (Array.isArray(companies?.data)) return companies.data
    if (Array.isArray(companies?.companies)) return companies.companies
    return []
  }, [companies])

  useEffect(() => {
    if (location.state?.company) {
      setPrefilledCompany(location.state.company)
    }
  }, [location.state])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const conversationId = params.get('conversation')
    if (conversationId && data?.conversations?.length) {
      const target = data.conversations.find((item) => item.id === conversationId || String(item.id) === conversationId)
      if (target) {
        setSelectedConversation(target)
        setCreatingConversation(false)
        void markAsRead(target.id)
      }
      return
    }

    const companyIdParam = params.get('company')
    if (!companyIdParam || processedCompanyRef.current === companyIdParam) {
      return
    }

    const existingConversation = data?.conversations?.find((item) => normalizeId(item.companyId) === companyIdParam)
    if (existingConversation) {
      processedCompanyRef.current = companyIdParam
      setSelectedConversation(existingConversation)
      setCreatingConversation(false)
      setSelectedCompany(null)
      void markAsRead(existingConversation.id)
      navigate({ pathname: location.pathname, search: `?conversation=${existingConversation.id}` }, { replace: true })
      return
    }

    // Trouver l'entreprise correspondante
    const companyMatch = normalizedCompanies.find(
      (company) => normalizeId(company.id ?? company.id_company ?? company.company_id) === companyIdParam
    )
    const prefilledCompanyId = normalizeId(
      prefilledCompany?.id ?? prefilledCompany?.id_company ?? prefilledCompany?.company_id
    )
    const targetCompany = companyMatch ?? 
      ((prefilledCompany && prefilledCompanyId === companyIdParam) ? prefilledCompany : null)

    if (!targetCompany) {
      return
    }

    processedCompanyRef.current = companyIdParam
    
    // Extraire l'ID de l'entreprise
    const companyId = targetCompany.id ?? targetCompany.id_company ?? targetCompany.company_id

    // Créer automatiquement la relation et la conversation
    void (async () => {
      try {
        const result = await ensureContact(companyId)
        const conversation = result?.conversation

        if (conversation?.id) {
          // Conversation trouvée - la sélectionner
          await refetch()
          setSelectedConversation(conversation)
          setCreatingConversation(false)
          setSelectedCompany(null)
          void markAsRead(conversation.id)
          navigate(
            { pathname: location.pathname, search: `?conversation=${conversation.id}` },
            { replace: true }
          )
        } else {
          // Pas de conversation - mode création
          setCreatingConversation(true)
          setSelectedConversation(null)
          setSelectedCompany(targetCompany)
          const targetName = targetCompany.name ?? targetCompany.company_name ?? targetCompany.label ?? ''
          setMessage((current) => current || (targetName ? `Bonjour ${targetName},` : 'Bonjour,'))
        }
      } catch {
        // Erreur déjà gérée par le hook
      }
    })()
  }, [
    data?.conversations,
    location.pathname,
    location.search,
    markAsRead,
    navigate,
    normalizedCompanies,
    normalizeId,
    prefilledCompany,
    ensureContact,
    refetch,
  ])

  const filteredConversations = useMemo(() => {
    const items = data?.conversations ?? []

    const uniqueById = new Map()

    for (const conversation of items) {
      if (!conversation?.id) continue

      const existing = uniqueById.get(conversation.id)
      if (!existing) {
        uniqueById.set(conversation.id, conversation)
        continue
      }

      const existingScore = (existing.messageCount ?? 0) + (existing.lastMessageAt ? 1 : 0)
      const currentScore = (conversation.messageCount ?? 0) + (conversation.lastMessageAt ? 1 : 0)
      if (currentScore > existingScore) {
        uniqueById.set(conversation.id, conversation)
      }
    }

    const cleaned = Array.from(uniqueById.values()).filter((conversation) => {
      const hasId = Boolean(conversation.id)
      if (!hasId) return false

      const hasName = Boolean(conversation.companyName?.trim())
      const hasDetails = Boolean(
        conversation.companySector ||
        conversation.lastMessagePreview?.trim() ||
        conversation.lastMessageAt ||
        (conversation.messageCount ?? 0) > 0
      )

      return hasName || hasDetails
    })

    if (!search.trim()) return cleaned
    const term = search.toLowerCase()
    return cleaned.filter((conversation) =>
      conversation.companyName?.toLowerCase().includes(term) ||
      conversation.lastMessagePreview?.toLowerCase().includes(term)
    )
  }, [data?.conversations, search])

  const selectedConversationId = selectedConversation?.id ?? null
  const messagesQuery = useCompanyConversationMessages(selectedConversationId, { pollInterval: 12_000 })
  const messages = messagesQuery.data ?? []

  const isOwnMessage = useCallback((item) => {
    const role = (item?.authorRole ?? '').toLowerCase()
    return (
      item?.isOwn === true ||
      role === 'user' ||
      role === 'owner' ||
      role === 'admin' ||
      role === 'me' ||
      role === 'staff' ||
      role === 'company'
    )
  }, [])

  const extendedCompanies = useMemo(() => {
    const items = [...normalizedCompanies]
    const prefilledCompanyId = normalizeId(prefilledCompany?.id ?? prefilledCompany?.id_company ?? prefilledCompany?.company_id)
    if (prefilledCompany && prefilledCompanyId && !items.some((company) => normalizeId(company.id ?? company.id_company ?? company.company_id) === prefilledCompanyId)) {
      items.push(prefilledCompany)
    }
    return items
  }, [normalizedCompanies, normalizeId, prefilledCompany])

  const availableCompanies = useMemo(() => {
    const existingIds = new Set((data?.conversations ?? []).map((item) => normalizeId(item.companyId)))
    return extendedCompanies.filter((company) => !existingIds.has(normalizeId(company.id ?? company.id_company ?? company.company_id)))
  }, [data?.conversations, extendedCompanies, normalizeId])

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
    setCreatingConversation(false)
    setSelectedCompany(null)
    void markAsRead(conversation.id)
  }

  const handleCreateConversation = async () => {
    if (!selectedCompany) return

    const companyId = selectedCompany.id ?? selectedCompany.id_company ?? selectedCompany.company_id
    if (!companyId) return

    try {
      const conversation = await createConversation({
        companyId,
        initialMessage: message.trim() || undefined,
      })

      if (conversation?.id) {
        setSelectedConversation(conversation)
        setCreatingConversation(false)
        setSelectedCompany(null)
        setMessage('')
        void markAsRead(conversation.id)
        navigate(
          { pathname: location.pathname, search: `?conversation=${conversation.id}` },
          { replace: true }
        )
      }
    } catch {
      // Erreurs gérées par les hooks
    }
  }

  const handleSendMessage = async () => {
    if (!selectedConversationId || !message.trim()) return
    
    const body = message.trim()
    setMessage('')
    
    await sendMessage({
      conversationId: selectedConversationId,
      body,
    })
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, selectedConversationId])

  const renderMessages = () => {
    if (messagesQuery.isLoading) {
      return (
        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`message-skeleton-${index}`} className="h-16 w-56 rounded-xl bg-slate-200/70 animate-pulse" />
          ))}
        </div>
      )
    }

    if (!messages.length) {
      return (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <MessageSquare className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-900">Aucun message pour le moment</p>
            <p className="text-xs text-slate-500">Démarrer la discussion en envoyant le premier message.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
        {messages.map((item, index) => (
          <MessageBubble
            key={item.id || `msg-${item.createdAt}-${index}`}
            message={item}
            isOwn={isOwnMessage(item)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
            <Users className="h-4 w-4" />
            <span>Messagerie partenaires</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Contacter les entreprises</h1>
              <p className="text-sm text-slate-600 max-w-2xl">
                Centralisez vos échanges avec les entreprises des Paluds, gardez un historique complet et créez de nouvelles synergies.
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => refetch()} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Actualiser
              </Button>
              <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                setCreatingConversation(true)
                setSelectedConversation(null)
                setMessage('')
              }}>
                <Plus className="mr-2 h-4 w-4" /> Nouvelle conversation
              </Button>
            </div>
          </div>
        </header>

        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="grid lg:grid-cols-[320px_1fr]">
              <aside className="border-r border-slate-100 bg-white">
                <div className="p-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Rechercher une entreprise"
                      className="pl-9"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>

                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={`loader-${index}`} className="h-18 rounded-lg bg-slate-100 animate-pulse" />
                      ))}
                    </div>
                  ) : isError ? (
                    <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                      <p>Impossible de charger les conversations.</p>
                      <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
                        Réessayer
                      </Button>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="space-y-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                      <p className="text-sm font-medium text-slate-700">Aucune conversation trouvée</p>
                      <p className="text-xs text-slate-500">
                        Créez un nouveau fil de discussion pour démarrer vos échanges.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto max-h-[520px] pr-1">
                      {filteredConversations.map((conversation, index) => (
                        <ConversationItem
                          key={conversation.id || `conv-${conversation.companyId}-${index}`}
                          conversation={conversation}
                          active={conversation.id === selectedConversationId}
                          onSelect={handleSelectConversation}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </aside>

              <section className="min-h-[580px] bg-slate-50/60">
                {!selectedConversation && !creatingConversation ? (
                  <ConversationPlaceholder />
                ) : null}

                {creatingConversation ? (
                  <div className="flex h-full flex-col">
                    <div className="border-b border-slate-200 bg-white px-6 py-4">
                      <h2 className="text-lg font-semibold text-slate-900">Nouvelle conversation</h2>
                      <p className="text-sm text-slate-500">Sélectionnez une entreprise connectée pour démarrer un échange direct.</p>
                    </div>
                    <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Entreprise</p>
                        <div className="grid gap-3 md:grid-cols-2">
                          {availableCompanies.map((company, index) => (
                            <button
                              key={company.id ?? company.id_company ?? company.company_id ?? `comp-${index}`}
                              type="button"
                              onClick={() => setSelectedCompany(company)}
                              className={cn(
                                'rounded-lg border px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/60',
                                selectedCompany === company ? 'border-blue-300 bg-blue-50 shadow-sm' : 'border-slate-200'
                              )}
                            >
                              <p className="text-sm font-semibold text-slate-900">{company.name}</p>
                              <p className="text-xs text-slate-500">{company.sector ?? company.industry ?? 'Secteur non renseigné'}</p>
                            </button>
                          ))}
                        </div>
                        {availableCompanies.length === 0 ? (
                          <p className="text-xs text-slate-500">Toutes vos entreprises connectées disposent déjà d'un fil de discussion.</p>
                        ) : null}
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message</p>
                        <textarea
                          className="w-full min-h-[140px] resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          placeholder="Présentez rapidement votre demande ou votre besoin..."
                          value={message}
                          onChange={(event) => setMessage(event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
                      <Button type="button" variant="ghost" onClick={() => {
                        setCreatingConversation(false)
                        setSelectedCompany(null)
                        setMessage('')
                      }}>
                        Annuler
                      </Button>
                      <Button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleCreateConversation}
                        disabled={!selectedCompany || createConversationMutation.isPending}
                      >
                        {createConversationMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Lancer la conversation
                      </Button>
                    </div>
                  </div>
                ) : null}

                {selectedConversation && !creatingConversation ? (
                  <div className="flex h-full flex-col">
                    <div className="border-b border-slate-200 bg-white px-6 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Entreprise</p>
                          <h2 className="text-xl font-semibold text-slate-900">{selectedConversation.companyName}</h2>
                          <p className="text-xs text-slate-500">
                            {selectedConversation.companySector || 'Secteur non renseigné'} · {formatRelative(selectedConversation.lastMessageAt)}
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                          <span>{messages.length} message{messages.length > 1 ? 's' : ''}</span>
                          <Separator orientation="vertical" className="h-4" />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate({ pathname: `/companies/${selectedConversation.companyId}` })}
                          >
                            Voir le profil public
                          </Button>
                        </div>
                      </div>
                    </div>
                    {renderMessages()}
                    <div className="border-t border-slate-200 bg-white px-6 py-4">
                      <div className="flex items-start gap-3">
                        <textarea
                          className="flex-1 resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          placeholder="Écrire un message..."
                          rows={3}
                          value={message}
                          onChange={(event) => setMessage(event.target.value)}
                          onKeyDown={(event) => {
                            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                              event.preventDefault()
                              void handleSendMessage()
                            }
                          }}
                        />
                        <Button
                          type="button"
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={!message.trim() || sendMessageMutation.isPending}
                          onClick={handleSendMessage}
                        >
                          {sendMessageMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Envoi...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Envoyer
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">Appuyez sur Ctrl + Entrée pour envoyer plus rapidement.</p>
                    </div>
                  </div>
                ) : null}
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
