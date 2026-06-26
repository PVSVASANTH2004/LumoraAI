import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  Copy, Check, RefreshCw, ThumbsUp, ThumbsDown,
  FileText, ChevronDown, ChevronUp, ExternalLink, Sparkles,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import { getScoreColor } from '@/utils/constants'
import { cn } from '@/utils/cn'
import type { Message } from '@/types'

interface ChatMessageProps {
  message: Message
  sessionId: string
  isLast: boolean
}

function ChatMessage({ message, sessionId, isLast }: ChatMessageProps) {
  // Stable function references — selector never changes, no re-renders from these
  const updateMessage = useChatStore((s) => s.updateMessage)
  const setSourcePanel = useChatStore((s) => s.setSourcePanel)
  // Only the active streaming message subscribes to streamingContent — all others return null
  const streamingContent = useChatStore((s) =>
    message.isStreaming ? s.streamingContent : null
  )
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const [sourcesExpanded, setSourcesExpanded] = useState(false)

  const isUser = message.role === 'user'
  const isStreaming = message.isStreaming
  // During streaming: show live buffer; after done: show committed message content
  const displayContent = isStreaming && streamingContent !== null ? streamingContent : message.content

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFeedback = (fb: 'positive' | 'negative') => {
    updateMessage(sessionId, message.id, { feedback: message.feedback === fb ? null : fb })
  }

  const handleViewSource = (sourceIdx: number) => {
    setSourcePanel(true, message.sources)
    setSourcesExpanded(true)
    void sourceIdx
  }

  return (
    <motion.div
      className={cn('group flex gap-3 py-4', isUser && 'flex-row-reverse')}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="relative w-7 h-7 shrink-0 mt-0.5">
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-lumora-primary/40 to-purple-500/20 blur-sm opacity-70" />
          <Avatar className="relative w-7 h-7 ring-1 ring-lumora-primary/20">
            <AvatarFallback className="text-[11px] font-semibold bg-lumora-primary/10 text-lumora-primary">
              {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      ) : (
        <div className="relative w-7 h-7 shrink-0 mt-0.5">
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-lumora-primary/30 to-blue-400/20 blur-md opacity-60" />
          <div
            className="relative w-7 h-7 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(207,188,255,0.2) 0%, rgba(147,197,253,0.15) 100%)',
              border: '1px solid rgba(207,188,255,0.25)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-lumora-primary" />
          </div>
        </div>
      )}

      {/* Content column */}
      <div className={cn('flex-1 max-w-[86%]', isUser && 'flex flex-col items-end')}>
        {/* Sender label */}
        <p className={cn(
          'text-[10px] font-semibold mb-1.5 px-0.5',
          isUser ? 'text-lumora-primary/70' : 'text-muted-foreground/60',
        )}>
          {isUser ? (user?.displayName ?? 'You') : 'Lumora AI'}
        </p>

        {/* Bubble */}
        <div
          className={cn('rounded-2xl px-4 py-3 text-sm leading-relaxed', isUser ? 'rounded-tr-sm' : 'rounded-tl-sm')}
          style={isUser ? {
            background: 'linear-gradient(135deg, rgb(var(--lumora-primary) / 0.18) 0%, rgba(147,197,253,0.12) 100%)',
            border: '1px solid rgb(var(--lumora-primary) / 0.2)',
          } : {
            background: 'var(--glass-card-bg)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--glass-border)',
          }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{displayContent}</p>
          ) : isStreaming ? (
            // Plain text while streaming — no markdown parsing overhead
            <div className="text-sm leading-relaxed">
              <span className="whitespace-pre-wrap">{displayContent}</span>
              <span className="inline-block w-0.5 h-4 bg-lumora-primary ml-0.5 animate-typing rounded-sm align-middle" />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert
              prose-p:leading-relaxed prose-p:my-1.5 prose-p:text-foreground
              prose-headings:text-foreground prose-headings:font-semibold
              prose-strong:text-foreground prose-strong:font-semibold
              prose-a:text-lumora-primary prose-a:no-underline hover:prose-a:underline
              prose-ul:my-2 prose-li:my-0.5 prose-li:text-foreground
              prose-ol:my-2 prose-code:text-foreground
            ">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className ?? '')
                    const isBlock = !!match
                    return isBlock ? (
                      <div className="relative my-3 rounded-xl overflow-hidden"
                        style={{ border: '1px solid var(--border-subtle)' }}>
                        <div className="flex items-center justify-between px-4 py-2"
                          style={{ background: 'var(--overlay-medium)', borderBottom: '1px solid var(--border-subtle)' }}>
                          <span className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-wider">
                            {match[1]}
                          </span>
                          <button
                            onClick={handleCopy}
                            className="flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-lumora-primary transition-colors"
                          >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ margin: 0, borderRadius: 0, background: '#0a0810', fontSize: '12px', padding: '16px' }}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code
                        className="px-1.5 py-0.5 rounded-md font-mono text-[11px] text-lumora-primary"
                        style={{ background: 'rgba(207,188,255,0.1)', border: '1px solid rgba(207,188,255,0.15)' }}
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-3 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                        <table className="w-full text-xs">{children}</table>
                      </div>
                    )
                  },
                  th({ children }) {
                    return <th className="px-3 py-2 text-left font-semibold text-foreground/80"
                      style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{children}</th>
                  },
                  td({ children }) {
                    return <td className="px-3 py-2 border-b border-white/[0.04]">{children}</td>
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-2 border-lumora-primary/40 pl-4 my-2 text-muted-foreground/80 italic">
                        {children}
                      </blockquote>
                    )
                  },
                }}
              >
                {displayContent}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources.length > 0 && (
          <div className="mt-2.5 w-full space-y-2">
            <button
              onClick={() => setSourcesExpanded((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-lumora-primary/80 transition-colors"
            >
              <FileText className="w-3 h-3" />
              <span>{message.sources.length} source{message.sources.length > 1 ? 's' : ''} referenced</span>
              {sourcesExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <AnimatePresence>
              {sourcesExpanded && (
                <motion.div
                  className="flex flex-wrap gap-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {message.sources.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleViewSource(idx)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] transition-all duration-150 hover:scale-[1.02]"
                      style={{
                        background: 'rgba(147,197,253,0.07)',
                        border: '1px solid rgba(147,197,253,0.15)',
                        color: 'rgba(147,197,253,0.85)',
                      }}
                    >
                      <FileText className="w-2.5 h-2.5 opacity-70" />
                      <span className="truncate max-w-28 font-medium">{src.documentName.replace('.pdf', '')}</span>
                      <span className="opacity-60">·</span>
                      <span>p.{src.pageNumber}</span>
                      <span className={cn('font-bold', getScoreColor(src.score))}>
                        {Math.round(src.score * 100)}%
                      </span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Action bar */}
        {!isUser && !isStreaming && (
          <TooltipProvider delayDuration={300}>
          <motion.div
            className="flex items-center gap-0.5 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            initial={false}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground/70 hover:bg-white/[0.05] transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>{copied ? 'Copied!' : 'Copy response'}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground/70 hover:bg-white/[0.05] transition-all">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Regenerate</TooltipContent>
            </Tooltip>

            <div className="w-px h-3.5 mx-0.5" style={{ background: 'var(--border-subtle)' }} />

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleFeedback('positive')}
                  className={cn(
                    'p-1.5 rounded-lg transition-all',
                    message.feedback === 'positive'
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-muted-foreground/50 hover:text-emerald-400/70 hover:bg-white/[0.05]',
                  )}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Good response</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleFeedback('negative')}
                  className={cn(
                    'p-1.5 rounded-lg transition-all',
                    message.feedback === 'negative'
                      ? 'text-red-400 bg-red-500/10'
                      : 'text-muted-foreground/50 hover:text-red-400/70 hover:bg-white/[0.05]',
                  )}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Poor response</TooltipContent>
            </Tooltip>
          </motion.div>
          </TooltipProvider>
        )}
      </div>
    </motion.div>
  )
}

// Non-streaming messages are fully memoized — they never re-render during streaming.
// The streaming message re-renders via its own streamingContent subscription.
export default memo(ChatMessage, (prev, next) =>
  prev.message.isStreaming === next.message.isStreaming &&
  prev.message.content === next.message.content &&
  prev.message.sources === next.message.sources &&
  prev.message.feedback === next.message.feedback &&
  prev.isLast === next.isLast
)
