import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, MessageSquare, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useDocumentStore } from '@/store/documentStore'
import { chatApi } from '@/services/api'
import { useChatStore } from '@/store/chatStore'
import UploadDropZone from './UploadDropZone'

export default function UploadModal() {
  const { setUploadModalOpen } = useUIStore()
  const { uploads } = useDocumentStore()
  const { addSession, setActiveSession } = useChatStore()
  const navigate = useNavigate()
  const [starting, setStarting] = useState(false)

  const doneUploads = uploads.filter((u) => u.status === 'done' && u.docId)
  const allSettled = uploads.length > 0 && uploads.every((u) => u.status === 'done' || u.status === 'error')
  const hasCompleted = allSettled && doneUploads.length > 0

  const handleStartChat = async () => {
    const docIds = doneUploads.map((u) => u.docId!)
    setStarting(true)
    try {
      const session = await chatApi.createSession(docIds)
      addSession(session)
      setActiveSession(session.id)
      setUploadModalOpen(false)
      navigate(`/chat/${session.id}`)
    } catch {
      setStarting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setUploadModalOpen(false)}
      />
      <motion.div
        className="relative w-full max-w-xl bg-surface-container border border-white/[0.08] rounded-2xl p-6 shadow-float z-10"
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Upload Documents</h2>
            <p className="text-sm text-muted-foreground">Upload PDFs and other documents to analyze with AI</p>
          </div>
          <button
            onClick={() => setUploadModalOpen(false)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface-high hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <UploadDropZone />

        {hasCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex gap-3"
          >
            <button
              onClick={() => setUploadModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl text-sm text-muted-foreground/70 hover:text-foreground transition-colors"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              Close
            </button>
            <button
              onClick={handleStartChat}
              disabled={starting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, rgba(207,188,255,0.9), rgba(147,197,253,0.7))',
                color: 'rgba(20,10,40,0.95)',
                boxShadow: '0 0 20px rgba(207,188,255,0.3)',
              }}
            >
              {starting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
              {starting ? 'Opening chat...' : 'Start Chat with Document'}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
