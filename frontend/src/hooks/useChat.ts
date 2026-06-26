import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { chatApi } from '@/services/api'
import { useChatStore } from '@/store/chatStore'
import { useUIStore } from '@/store/uiStore'
import type { Message, Source } from '@/types'
import { toast } from 'sonner'

export function useChatSessions() {
  const { setSessions } = useChatStore()

  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const sessions = await chatApi.listSessions()
      setSessions(sessions)
      return sessions
    },
  })
}

export function useChatSession(id: string | null) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => chatApi.getSession(id!),
    enabled: !!id,
  })
}

export function useCreateSession() {
  const qc = useQueryClient()
  const { addSession, setActiveSession } = useChatStore()

  return useMutation({
    mutationFn: chatApi.createSession,
    onSuccess: (session) => {
      addSession(session)
      setActiveSession(session.id)
      qc.invalidateQueries({ queryKey: ['sessions'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['dashboard-activity'] })
    },
  })
}

export function useDeleteSession() {
  const qc = useQueryClient()
  const { deleteSession } = useChatStore()

  return useMutation({
    mutationFn: chatApi.deleteSession,
    onSuccess: (data) => {
      deleteSession(data.id)
      qc.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Conversation deleted')
    },
  })
}

export function useSendMessage(sessionId: string, documentIds?: string[]) {
  const {
    addMessage, updateMessage, finalizeMessage,
    setStreamingContent, setStreamingMessageId, setIsSending, setSourcePanel,
  } = useChatStore()
  const autoOpenSources = useUIStore((s) => s.autoOpenSources)

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        sources: [],
        createdAt: new Date().toISOString(),
        feedback: null,
      }
      addMessage(sessionId, userMsg)

      const assistantMsgId = `msg-${Date.now() + 1}`
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        sources: [],
        createdAt: new Date().toISOString(),
        isStreaming: true,
        feedback: null,
      }
      addMessage(sessionId, assistantMsg)
      setStreamingMessageId(assistantMsgId)
      setStreamingContent('')
      setIsSending(true)

      let pendingSources: Source[] | undefined

      try {
        let accumulated = ''
        let lastFlush = 0
        const THROTTLE_MS = 50

        for await (const chunk of chatApi.streamMessage(sessionId, content, documentIds)) {
          if (chunk.type === 'delta' && chunk.content) {
            accumulated += chunk.content
            const now = Date.now()
            if (now - lastFlush >= THROTTLE_MS) {
              // Only update the lightweight streamingContent field — sessions array untouched
              setStreamingContent(accumulated)
              lastFlush = now
            }
          } else if (chunk.type === 'sources' && chunk.sources) {
            pendingSources = chunk.sources
            if (autoOpenSources) setSourcePanel(true, chunk.sources)
          } else if (chunk.type === 'done') {
            // One atomic commit: clear buffer + write final content into sessions
            finalizeMessage(sessionId, assistantMsgId, accumulated, pendingSources)
          } else if (chunk.type === 'error') {
            throw new Error(chunk.error)
          }
        }
      } catch {
        finalizeMessage(sessionId, assistantMsgId, 'Sorry, something went wrong. Please try again.')
        toast.error('Failed to send message')
      } finally {
        setIsSending(false)
      }
    },
    [sessionId, documentIds, autoOpenSources, addMessage, updateMessage, finalizeMessage,
     setStreamingContent, setStreamingMessageId, setIsSending, setSourcePanel],
  )

  return { sendMessage }
}
