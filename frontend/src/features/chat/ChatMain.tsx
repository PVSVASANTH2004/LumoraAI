import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, BookOpen, Sparkles, FileText, Zap, Search, Plus, X } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatStore } from '@/store/chatStore'
import { useSendMessage } from '@/hooks/useChat'
import { useUIStore } from '@/store/uiStore'
import { useDocumentStore } from '@/store/documentStore'
import { chatApi } from '@/services/api'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import NewChatDialog from './NewChatDialog'

const STARTER_PROMPTS = [
  { icon: Search, text: 'Summarize the key findings' },
  { icon: Zap, text: 'What are the main risks?' },
  { icon: FileText, text: 'List the key recommendations' },
  { icon: Sparkles, text: 'Explain the technical details' },
]

export default function ChatMain() {
  const { sessions, activeSessionId, updateSession } = useChatStore(
    useShallow((s) => ({ sessions: s.sessions, activeSessionId: s.activeSessionId, updateSession: s.updateSession }))
  )
  const { setUploadModalOpen } = useUIStore()
  const { documents } = useDocumentStore()
  const [showDocPicker, setShowDocPicker] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const { sendMessage } = useSendMessage(activeSessionId ?? '', activeSession?.documentIds)
  const linkedDocs = documents.filter((d) => activeSession?.documentIds.includes(d.id))

  const handleAddDocuments = useCallback((newDocIds: string[]) => {
    if (!activeSession) return
    setShowDocPicker(false)
    const merged = Array.from(new Set([...activeSession.documentIds, ...newDocIds]))
    updateSession(activeSession.id, { documentIds: merged })
    void chatApi.updateDocs(activeSession.id, merged)
  }, [activeSession, updateSession])

  const handleRemoveDoc = useCallback((docId: string) => {
    if (!activeSession) return
    const updated = activeSession.documentIds.filter((id) => id !== docId)
    updateSession(activeSession.id, { documentIds: updated })
    void chatApi.updateDocs(activeSession.id, updated)
  }, [activeSession, updateSession])

  const handleUploadDoc = useCallback((docId: string) => {
    if (!activeSession) return
    const merged = Array.from(new Set([...activeSession.documentIds, docId]))
    updateSession(activeSession.id, { documentIds: merged })
    void chatApi.updateDocs(activeSession.id, merged)
  }, [activeSession, updateSession])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSession?.messages?.length])

  if (!activeSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8 relative overflow-hidden">
        {/* Background ambient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, rgba(207,188,255,1) 0%, transparent 70%)' }} />
        </div>

        <motion.div
          className="text-center relative z-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo mark */}
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-40"
              style={{ background: 'linear-gradient(135deg, rgba(207,188,255,0.8), rgba(147,197,253,0.5))' }} />
            <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(207,188,255,0.15) 0%, rgba(147,197,253,0.1) 100%)',
                border: '1px solid rgba(207,188,255,0.2)',
              }}>
              <Sparkles className="w-7 h-7 text-lumora-primary" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2 tracking-tight">
            Ask anything about your documents
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Upload a PDF and start a conversation. Lumora AI will analyze your documents and answer questions with precise citations.
          </p>

          <motion.button
            className="mt-5 px-5 py-2.5 rounded-xl text-sm font-medium text-lumora-primary transition-all"
            style={{
              background: 'rgba(207,188,255,0.08)',
              border: '1px solid rgba(207,188,255,0.18)',
            }}
            onClick={() => setUploadModalOpen(true)}
            whileHover={{ scale: 1.02, background: 'rgba(207,188,255,0.13)' }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            Upload your first document
          </motion.button>
        </motion.div>

        {/* Starter prompts */}
        <motion.div
          className="grid grid-cols-2 gap-2.5 max-w-md w-full relative z-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {STARTER_PROMPTS.map(({ icon: Icon, text }) => (
            <button
              key={text}
              className="group flex items-center gap-2.5 p-3.5 rounded-xl text-left text-sm transition-all duration-200"
              style={{
                background: 'var(--overlay-subtle)',
                border: '1px solid var(--border-subtle)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgb(var(--lumora-primary) / 0.05)'
                e.currentTarget.style.borderColor = 'rgb(var(--lumora-primary) / 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--overlay-subtle)'
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
              }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(207,188,255,0.08)' }}>
                <Icon className="w-3.5 h-3.5 text-lumora-primary/70" />
              </div>
              <span className="text-muted-foreground/70 group-hover:text-foreground/70 transition-colors text-xs leading-snug">{text}</span>
            </button>
          ))}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Title row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="relative w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(207,188,255,0.1)', border: '1px solid rgba(207,188,255,0.15)' }}>
              <MessageSquare className="w-3.5 h-3.5 text-lumora-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground/90 leading-tight">{activeSession.title}</h2>
              <p className="text-[10px] text-muted-foreground/50">
                {activeSession.messageCount} message{activeSession.messageCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Documents row */}
        <div className="flex items-center gap-2 flex-wrap">
          {linkedDocs.length === 0 ? (
            <button
              onClick={() => setShowDocPicker(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-all"
              style={{
                background: 'rgba(239,68,68,0.07)',
                border: '1px dashed rgba(239,68,68,0.25)',
                color: 'rgba(239,68,68,0.7)',
              }}
            >
              <BookOpen className="w-3 h-3" />
              No documents linked — click to add
            </button>
          ) : (
            <>
              {linkedDocs.map((doc) => (
                <motion.div
                  key={doc.id}
                  className="group flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-[11px]"
                  style={{
                    background: 'rgba(207,188,255,0.07)',
                    border: '1px solid rgba(207,188,255,0.15)',
                    color: 'rgba(207,188,255,0.8)',
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <FileText className="w-3 h-3 shrink-0" />
                  <span className="truncate max-w-32">{doc.name.replace(/\.[^.]+$/, '')}</span>
                  <button
                    onClick={() => handleRemoveDoc(doc.id)}
                    className="opacity-0 group-hover:opacity-100 ml-0.5 p-0.5 rounded hover:text-red-400 transition-all"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </motion.div>
              ))}
              <button
                onClick={() => setShowDocPicker(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all"
                style={{
                  background: 'var(--overlay-subtle)',
                  border: '1px dashed var(--border-medium)',
                }}
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </>
          )}
        </div>
      </div>

      {/* Doc picker sheet */}
      <AnimatePresence>
        {showDocPicker && (
          <NewChatDialog
            onStart={handleAddDocuments}
            onClose={() => setShowDocPicker(false)}
          />
        )}
      </AnimatePresence>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="max-w-[820px] mx-auto py-6">
          {activeSession.messages.length === 0 ? (
            <motion.div
              className="py-16 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: 'rgba(207,188,255,0.07)', border: '1px solid rgba(207,188,255,0.12)' }}>
                <Sparkles className="w-5 h-5 text-lumora-primary/60" />
              </div>
              <p className="text-sm text-muted-foreground/60">
                Ask a question about your documents to get started.
              </p>
            </motion.div>
          ) : (
            activeSession.messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                sessionId={activeSession.id}
                isLast={index === activeSession.messages.length - 1}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <ChatInput onSend={sendMessage} sessionId={activeSession.id} onUpload={handleUploadDoc} />
      </div>
    </div>
  )
}
