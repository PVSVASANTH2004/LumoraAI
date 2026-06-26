import { create } from 'zustand'
import type { ChatSession, Message, Source } from '@/types'

interface ChatStore {
  sessions: ChatSession[]
  activeSessionId: string | null
  streamingMessageId: string | null
  streamingContent: string        // live token buffer — separate from sessions
  isSending: boolean
  sidebarOpen: boolean
  sourcePanelOpen: boolean
  activeSources: Source[]

  setActiveSession: (id: string | null) => void
  addSession: (session: ChatSession) => void
  updateSession: (id: string, updates: Partial<ChatSession>) => void
  deleteSession: (id: string) => void
  addMessage: (sessionId: string, message: Message) => void
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void
  finalizeMessage: (sessionId: string, messageId: string, content: string, sources?: Source[]) => void
  setStreamingContent: (content: string) => void
  setStreamingMessageId: (id: string | null) => void
  setIsSending: (isSending: boolean) => void
  toggleSidebar: () => void
  setSourcePanel: (open: boolean, sources?: Source[]) => void
  setSessions: (sessions: ChatSession[]) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  sessions: [],
  activeSessionId: null,
  streamingMessageId: null,
  streamingContent: '',
  isSending: false,
  sidebarOpen: true,
  sourcePanelOpen: false,
  activeSources: [],

  setActiveSession: (id) => set({ activeSessionId: id }),
  addSession: (session) =>
    set((s) => ({ sessions: [session, ...s.sessions] })),
  updateSession: (id, updates) =>
    set((s) => ({
      sessions: s.sessions.map((sess) => (sess.id === id ? { ...sess, ...updates } : sess)),
    })),
  deleteSession: (id) =>
    set((s) => ({
      sessions: s.sessions.filter((sess) => sess.id !== id),
      activeSessionId: s.activeSessionId === id ? null : s.activeSessionId,
    })),
  addMessage: (sessionId, message) =>
    set((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId
          ? { ...sess, messages: [...sess.messages, message], updatedAt: new Date().toISOString() }
          : sess,
      ),
    })),
  updateMessage: (sessionId, messageId, updates) =>
    set((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId
          ? {
              ...sess,
              messages: sess.messages.map((m) =>
                m.id === messageId ? { ...m, ...updates } : m,
              ),
            }
          : sess,
      ),
    })),
  setStreamingContent: (content) => set({ streamingContent: content }),
  // Atomically commits final content + clears streaming buffer in one render
  finalizeMessage: (sessionId, messageId, content, sources) =>
    set((s) => ({
      streamingContent: '',
      streamingMessageId: null,
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId
          ? {
              ...sess,
              messages: sess.messages.map((m) =>
                m.id === messageId
                  ? { ...m, content, isStreaming: false, ...(sources ? { sources } : {}) }
                  : m,
              ),
            }
          : sess,
      ),
    })),
  setStreamingMessageId: (id) => set({ streamingMessageId: id }),
  setIsSending: (isSending) => set({ isSending }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSourcePanel: (open, sources) =>
    set({ sourcePanelOpen: open, activeSources: sources ?? [] }),
  setSessions: (sessions) => set({ sessions }),
}))
