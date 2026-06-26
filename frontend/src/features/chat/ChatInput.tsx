import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Square, Paperclip, Sparkles, X, CheckCircle2, Loader2 } from 'lucide-react'
import { useChatStore } from '@/store/chatStore'
import { documentsApi } from '@/services/api'
import { cn } from '@/utils/cn'

interface ChatInputProps {
  onSend: (content: string) => Promise<void>
  sessionId: string
  onUpload?: (docId: string) => void
}

interface UploadState {
  name: string
  progress: number
  status: 'uploading' | 'done' | 'error'
  error?: string
}

const SUGGESTIONS = [
  'Summarize the key points',
  'What are the main conclusions?',
  'List all important dates',
  'Explain in simple terms',
]

export default function ChatInput({ onSend, sessionId: _sessionId, onUpload }: ChatInputProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [uploading, setUploading] = useState<UploadState | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isSending = useChatStore((s) => s.isSending)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setUploading({ name: file.name, progress: 0, status: 'uploading' })
    try {
      const doc = await documentsApi.upload(file, (p) =>
        setUploading((u) => u ? { ...u, progress: p } : u)
      )
      setUploading({ name: file.name, progress: 100, status: 'done' })
      onUpload?.(doc.id)
      setTimeout(() => setUploading(null), 2500)
    } catch {
      setUploading((u) => u ? { ...u, status: 'error', error: 'Upload failed' } : u)
      setTimeout(() => setUploading(null), 3000)
    }
  }, [onUpload])

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim()
    if (!trimmed || isSending) return
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    await onSend(trimmed)
  }, [value, isSending, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSubmit()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 180)}px`
  }

  const isActive = value.length > 0 || focused || isSending

  return (
    <div className="px-4 py-4 max-w-[820px] mx-auto w-full">
      {/* Suggestion chips */}
      <AnimatePresence>
        {!isSending && value.length === 0 && !focused && (
          <motion.div
            className="flex flex-wrap gap-2 mb-3"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setValue(s)
                  textareaRef.current?.focus()
                }}
                className="px-3 py-1.5 text-xs rounded-lg transition-all duration-150"
                style={{
                  background: 'var(--overlay-subtle)',
                  border: '1px solid var(--border-subtle)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgb(var(--lumora-primary) / 0.06)'
                  e.currentTarget.style.borderColor = 'rgb(var(--lumora-primary) / 0.18)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--overlay-subtle)'
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                }}
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload progress */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(207,188,255,0.06)', border: '1px solid rgba(207,188,255,0.12)' }}>
              {uploading.status === 'uploading' && <Loader2 className="w-3.5 h-3.5 text-lumora-primary animate-spin shrink-0" />}
              {uploading.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              {uploading.status === 'error' && <X className="w-3.5 h-3.5 text-red-400 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground/80 truncate">{uploading.name}</p>
                {uploading.status === 'uploading' && (
                  <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--overlay-medium)' }}>
                    <div className="h-full rounded-full bg-lumora-primary transition-all duration-200"
                      style={{ width: `${uploading.progress}%` }} />
                  </div>
                )}
                {uploading.status === 'done' && <p className="text-[10px] text-emerald-400">Added to this chat</p>}
                {uploading.status === 'error' && <p className="text-[10px] text-red-400">{uploading.error}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input container */}
      <div
        className="relative rounded-2xl transition-all duration-300"
        style={{
          background: 'var(--glass-card-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: isActive
            ? '1px solid rgb(var(--lumora-primary) / 0.3)'
            : '1px solid var(--border-subtle)',
          boxShadow: isActive
            ? '0 0 0 3px rgb(var(--lumora-primary) / 0.06), 0 8px 32px rgba(0,0,0,0.15)'
            : '0 4px 16px rgba(0,0,0,0.1)',
        }}
      >
        {/* Top glow when focused */}
        {isActive && (
          <div className="absolute -top-px left-8 right-8 h-px rounded-full pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(207,188,255,0.4), transparent)' }} />
        )}

        <div className="flex items-end gap-2 p-3">
          {/* Attach */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.docx"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || uploading?.status === 'uploading'}
            className="p-1.5 rounded-lg transition-all shrink-0 mb-0.5 text-muted-foreground/40 hover:text-lumora-primary/70 hover:bg-white/[0.04] disabled:opacity-40"
            title="Attach a document"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Ask anything about your documents..."
            rows={1}
            disabled={isSending}
            className={cn(
              'flex-1 bg-transparent text-sm text-foreground/90 placeholder:text-muted-foreground/35',
              'resize-none outline-none leading-relaxed',
              'min-h-[24px] max-h-[180px] overflow-y-auto',
              'disabled:opacity-60',
            )}
          />

          {/* Send / Stop */}
          <div className="flex items-center gap-1.5 shrink-0 mb-0.5">
            {isSending ? (
              <motion.button
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: 'rgba(239,68,68,0.8)',
                }}
                whileTap={{ scale: 0.9 }}
                title="Stop generating"
              >
                <Square className="w-3.5 h-3.5" fill="currentColor" />
              </motion.button>
            ) : (
              <motion.button
                onClick={() => void handleSubmit()}
                disabled={!value.trim()}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 relative overflow-hidden"
                style={value.trim() ? {
                  background: 'linear-gradient(135deg, rgba(207,188,255,0.9) 0%, rgba(147,197,253,0.7) 100%)',
                  boxShadow: '0 0 16px rgba(207,188,255,0.3)',
                  color: 'rgba(30,15,50,0.95)',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.2)',
                  cursor: 'not-allowed',
                }}
                whileHover={value.trim() ? { scale: 1.05 } : {}}
                whileTap={value.trim() ? { scale: 0.92 } : {}}
                title="Send message (Enter)"
              >
                <Send className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5">
        <Sparkles className="w-2.5 h-2.5 text-muted-foreground/30" />
        <p className="text-[10px] text-muted-foreground/30">
          Lumora AI may make mistakes. Verify critical information.
        </p>
      </div>
    </div>
  )
}
