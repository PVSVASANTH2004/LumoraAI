import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'
import { useChatStore } from '@/store/chatStore'
import { useChatSessions, useCreateSession } from '@/hooks/useChat'
import { useDocuments } from '@/hooks/useDocuments'
import { chatApi } from '@/services/api'
import { toast } from 'sonner'
import ChatSidebar from './ChatSidebar'
import ChatMain from './ChatMain'
import ChatSourcesPanel from './ChatSourcesPanel'
import NewChatDialog from './NewChatDialog'

export default function ChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { activeSessionId, setActiveSession, sessions, updateSession, sourcePanelOpen } = useChatStore(
    useShallow((s) => ({
      activeSessionId: s.activeSessionId,
      setActiveSession: s.setActiveSession,
      sessions: s.sessions,
      updateSession: s.updateSession,
      sourcePanelOpen: s.sourcePanelOpen,
    }))
  )
  const { mutateAsync: createSession } = useCreateSession()
  // Auto-open New Chat dialog when navigated here from upload (state flag)
  const [showNewChatDialog, setShowNewChatDialog] = useState(
    () => (location.state as { openNewChat?: boolean } | null)?.openNewChat === true
  )
  useChatSessions()
  useDocuments()

  useEffect(() => {
    if (sessionId) {
      setActiveSession(sessionId)
    } else if (!activeSessionId && sessions.length > 0) {
      setActiveSession(sessions[0].id)
    }
  }, [sessionId, activeSessionId, sessions, setActiveSession])

  // Fetch full messages when active session changes
  useEffect(() => {
    if (!activeSessionId) return
    const session = sessions.find((s) => s.id === activeSessionId)
    if (!session || session.messages.length > 0) return // already loaded
    chatApi.getSession(activeSessionId).then((full) => {
      if (full && full.messages.length > 0) {
        updateSession(activeSessionId, { messages: full.messages, messageCount: full.messageCount })
      }
    })
  }, [activeSessionId, sessions, updateSession])

  const handleNewChat = () => setShowNewChatDialog(true)

  const handleStartChat = async (documentIds: string[]) => {
    setShowNewChatDialog(false)
    try {
      const session = await createSession(documentIds)
      navigate(`/chat/${session.id}`)
    } catch {
      toast.error('Failed to create conversation. Is the backend running?')
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      <ChatSidebar onNewChat={handleNewChat} />

      <div className="flex-1 flex flex-col min-w-0">
        <ChatMain />
      </div>

      <AnimatePresence>
        {sourcePanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="shrink-0 overflow-hidden"
            style={{ borderLeft: '1px solid var(--border-subtle)' }}
          >
            <div className="w-80 h-full">
              <ChatSourcesPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewChatDialog && (
          <NewChatDialog
            onStart={handleStartChat}
            onClose={() => setShowNewChatDialog(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
