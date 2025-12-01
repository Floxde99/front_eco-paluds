import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getCompanyConversations,
  getCompanyConversation,
  getCompanyMessages,
  sendCompanyMessage,
  createCompanyConversation,
  markConversationAsRead,
  createCompanyContact,
} from '@/services/CompanyMessagesApi'
import { dashboardKeys } from '@/hooks/useDashboardQuery'
import { toast } from 'sonner'

// Hooks de messagerie entreprise
// Architecture simplifiee pour correspondre au backend

export const messagingKeys = {
  all: ['company-messages'],
  list: () => [...messagingKeys.all, 'list'],
  detail: (conversationId) => [...messagingKeys.all, 'conversation', conversationId],
  messages: (conversationId) => [...messagingKeys.all, 'conversation', conversationId, 'messages'],
}

// ============================================================================
// QUERIES
// ============================================================================

export function useCompanyConversations(options = {}) {
  return useQuery({
    queryKey: messagingKeys.list(),
    queryFn: () => getCompanyConversations(options),
    staleTime: 30_000,
  })
}

export function useCompanyConversation(conversationId) {
  return useQuery({
    queryKey: messagingKeys.detail(conversationId),
    queryFn: () => getCompanyConversation(conversationId),
    enabled: Boolean(conversationId),
    staleTime: 30_000,
  })
}

export function useCompanyConversationMessages(conversationId, params = {}) {
  const { pollInterval } = params

  return useQuery({
    queryKey: messagingKeys.messages(conversationId),
    queryFn: () => getCompanyMessages(conversationId, params),
    enabled: Boolean(conversationId),
    refetchInterval: pollInterval ?? 10_000,
    keepPreviousData: true,
  })
}

// ============================================================================
// MUTATIONS
// ============================================================================

export function useCreateCompanyContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (companyId) => createCompanyContact(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.list() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.companies() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() })
    },
    onError: (error) => {
      const message = error?.response?.data?.message ?? error?.message ?? 'Impossible de creer la relation'
      toast.error(message)
    },
  })
}

export function useCreateCompanyConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCompanyConversation,
    onSuccess: (conversation) => {
      toast.success('Conversation creee')
      queryClient.invalidateQueries({ queryKey: messagingKeys.list() })
      if (conversation?.id) {
        queryClient.invalidateQueries({ queryKey: messagingKeys.detail(conversation.id) })
      }
    },
    onError: (error) => {
      const message = error?.response?.data?.message ?? error?.message ?? 'Impossible de creer la conversation'
      toast.error(message)
    },
  })
}

export function useSendCompanyMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sendCompanyMessage,
    onSuccess: (message) => {
      toast.success('Message envoye')
      if (message?.conversationId) {
        queryClient.setQueryData(messagingKeys.messages(message.conversationId), (old) => {
          const existing = Array.isArray(old) ? old : []
          const alreadyThere = existing.some((item) => item.id === message.id)
          if (alreadyThere) {
            return existing
          }
          return [...existing, { ...message, isOwn: true }]
        })
        queryClient.invalidateQueries({ queryKey: messagingKeys.messages(message.conversationId) })
      }
      queryClient.invalidateQueries({ queryKey: messagingKeys.list() })
    },
    onError: (error) => {
      const message = error?.response?.data?.message ?? error?.message ?? 'Impossible d\'envoyer le message'
      toast.error(message)
    },
  })
}

export function useMarkConversationAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markConversationAsRead,
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.list() })
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: messagingKeys.detail(conversationId) })
      }
    },
  })
}

// ============================================================================
// HELPERS COMPOSES
// ============================================================================

export function useMessagingHelpers() {
  const createContactMutation = useCreateCompanyContact()
  const createConversationMutation = useCreateCompanyConversation()
  const sendMessageMutation = useSendCompanyMessage()
  const markAsReadMutation = useMarkConversationAsRead()

  const ensureContact = useCallback(async (companyId) => {
    return await createContactMutation.mutateAsync(companyId)
  }, [createContactMutation])

  const createConversation = useCallback(async (payload) => {
    return await createConversationMutation.mutateAsync(payload)
  }, [createConversationMutation])

  const sendMessage = useCallback(async ({ conversationId, body }) => {
    return await sendMessageMutation.mutateAsync({ conversationId, body })
  }, [sendMessageMutation])

  const markAsRead = useCallback(async (conversationId) => {
    if (!conversationId) return
    await markAsReadMutation.mutateAsync(conversationId)
  }, [markAsReadMutation])

  return {
    ensureContact,
    createConversation,
    sendMessage,
    markAsRead,
    createContactMutation,
    createConversationMutation,
    sendMessageMutation,
    markAsReadMutation,
  }
}