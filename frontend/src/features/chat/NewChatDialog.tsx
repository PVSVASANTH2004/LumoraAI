import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Search, MessageSquare, CheckCircle2, Upload, Sparkles, Loader2 } from 'lucide-react'
import { useDocumentStore } from '@/store/documentStore'
import { useUIStore } from '@/store/uiStore'
import { useDocuments } from '@/hooks/useDocuments'
import { formatFileSize } from '@/utils/format'
import { cn } from '@/utils/cn'

interface NewChatDialogProps {
  onStart: (documentIds: string[]) => void
  onClose: () => void
}

export default function NewChatDialog({ onStart, onClose }: NewChatDialogProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const { documents } = useDocumentStore()
  const { setUploadModalOpen } = useUIStore()
  const { isLoading } = useDocuments()

  const readyDocs = documents.filter(
    (d) => d.status === 'ready' && d.name.toLowerCase().includes(search.toLowerCase()),
  )

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleStart = () => onStart(Array.from(selected))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />

      {/* Dialog */}
      <motion.div
        className="relative w-full max-w-lg z-10 flex flex-col"
        style={{
          background: 'var(--dialog-bg)',
          border: '1px solid var(--sidebar-border)',
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3), 0 0 0 1px var(--border-subtle)',
          maxHeight: '80vh',
        }}
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-24 rounded-t-[20px] pointer-events-none overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(207,188,255,0.08) 0%, transparent 70%)' }} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(207,188,255,0.1)', border: '1px solid rgba(207,188,255,0.15)' }}>
              <Sparkles className="w-4.5 h-4.5 text-lumora-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">New Conversation</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Select documents to chat about</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-white/[0.05] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl outline-none text-foreground placeholder:text-muted-foreground/40"
              style={{
                background: 'var(--overlay-subtle)',
                border: '1px solid var(--border-subtle)',
              }}
            />
          </div>
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-2 min-h-0">
          {isLoading && documents.length === 0 ? (
            <div className="py-10 text-center">
              <Loader2 className="w-6 h-6 text-lumora-primary/50 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-muted-foreground/60">Loading your documents...</p>
            </div>
          ) : readyDocs.length === 0 ? (
            <div className="py-10 text-center">
              {documents.filter(d => d.status === 'ready').length === 0 ? (
                <>
                  <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <FileText className="w-5 h-5 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground/60 mb-3">No documents uploaded yet</p>
                  <button
                    onClick={() => { onClose(); setUploadModalOpen(true) }}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-lumora-primary transition-all"
                    style={{ background: 'rgba(207,188,255,0.08)', border: '1px solid rgba(207,188,255,0.15)' }}
                  >
                    <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                    Upload a document
                  </button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground/60">No documents match your search</p>
              )}
            </div>
          ) : (
            readyDocs.map((doc) => {
              const isSelected = selected.has(doc.id)
              return (
                <motion.button
                  key={doc.id}
                  onClick={() => toggle(doc.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-150"
                  style={isSelected ? {
                    background: 'rgba(207,188,255,0.08)',
                    border: '1px solid rgba(207,188,255,0.2)',
                  } : {
                    background: 'var(--overlay-subtle)',
                    border: '1px solid var(--border-subtle)',
                  }}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                >
                  {/* Doc icon */}
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: isSelected ? 'rgba(207,188,255,0.12)' : 'rgba(239,68,68,0.08)' }}>
                    <FileText className={cn('w-4 h-4', isSelected ? 'text-lumora-primary' : 'text-red-400')} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium truncate', isSelected ? 'text-lumora-primary' : 'text-foreground/80')}>
                      {doc.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                      {doc.pageCount} pages · {formatFileSize(doc.size)}
                    </p>
                  </div>

                  {/* Check */}
                  <div className="shrink-0">
                    {isSelected ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-lumora-primary" />
                    ) : (
                      <div className="w-4.5 h-4.5 rounded-full"
                        style={{ border: '2px solid rgba(255,255,255,0.15)' }} />
                    )}
                  </div>
                </motion.button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-5 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {selected.size > 0 && (
            <motion.p
              className="text-xs text-muted-foreground/60 mb-3 text-center"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {selected.size} document{selected.size > 1 ? 's' : ''} selected
            </motion.p>
          )}

          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm text-muted-foreground/60 hover:text-foreground/70 transition-colors"
              style={{ background: 'var(--overlay-subtle)', border: '1px solid var(--border-subtle)' }}
            >
              Cancel
            </button>

            <motion.button
              onClick={handleStart}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
              style={selected.size > 0 ? {
                background: 'linear-gradient(135deg, rgba(207,188,255,0.9), rgba(147,197,253,0.7))',
                color: 'rgba(20,10,40,0.95)',
                boxShadow: '0 0 20px rgba(207,188,255,0.25)',
              } : {
                background: 'rgba(207,188,255,0.1)',
                border: '1px solid rgba(207,188,255,0.15)',
                color: 'rgba(207,188,255,0.7)',
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {selected.size > 0 ? 'Start Chat' : 'Start Empty Chat'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
