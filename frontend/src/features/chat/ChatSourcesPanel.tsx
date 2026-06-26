import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, ExternalLink, ChevronRight } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useChatStore } from '@/store/chatStore'
import { getScoreColor, getScoreLabel } from '@/utils/constants'
import { cn } from '@/utils/cn'

export default function ChatSourcesPanel() {
  const activeSources = useChatStore((s) => s.activeSources)
  const setSourcePanel = useChatStore((s) => s.setSourcePanel)
  const navigate = useNavigate()

  return (
    <div className="h-full flex flex-col bg-surface-low/40">
      <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between flex-shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Sources</h3>
          <p className="text-[10px] text-muted-foreground">{activeSources.length} citation{activeSources.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setSourcePanel(false)}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface-high hover:text-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          <AnimatePresence>
            {activeSources.map((source, idx) => (
              <motion.div
                key={`${source.documentId}-${idx}`}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="rounded-xl border border-border/50 bg-surface-container overflow-hidden"
              >
                {/* Source header */}
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/30">
                  <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                    <FileText className="w-3 h-3 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{source.documentName}</p>
                    <p className="text-[10px] text-muted-foreground">Page {source.pageNumber}</p>
                  </div>
                </div>

                {/* Score bar */}
                <div className="px-3 py-2 border-b border-border/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-muted-foreground">Relevance</span>
                    <div className="flex items-center gap-1.5">
                      <span className={cn('text-[10px] font-semibold', getScoreColor(source.score))}>
                        {getScoreLabel(source.score)}
                      </span>
                      <Badge
                        variant={source.score >= 0.85 ? 'success' : source.score >= 0.7 ? 'warning' : 'secondary'}
                        className="text-[9px] px-1.5 py-0"
                      >
                        {Math.round(source.score * 100)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="h-1 bg-surface-high rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        'h-full rounded-full',
                        source.score >= 0.85 ? 'bg-emerald-500' : source.score >= 0.7 ? 'bg-yellow-500' : 'bg-red-500',
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${source.score * 100}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                    />
                  </div>
                </div>

                {/* Snippet */}
                <div className="px-3 py-2.5">
                  <p className="text-[11px] text-muted-foreground leading-relaxed italic line-clamp-4">
                    "{source.snippet}"
                  </p>
                </div>

                {/* Action */}
                <button
                  onClick={() => navigate(`/pdf/${source.documentId}`)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[11px] text-lumora-primary hover:bg-surface-high transition-colors border-t border-border/20"
                >
                  <span className="flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3" />
                    Open in PDF viewer
                  </span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {activeSources.length === 0 && (
            <div className="py-8 text-center">
              <FileText className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No sources yet</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
