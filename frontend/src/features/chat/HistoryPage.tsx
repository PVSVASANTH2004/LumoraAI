import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, Clock, FileText, ArrowRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import EmptyState from '@/components/common/EmptyState'
import { useChatStore } from '@/store/chatStore'
import { useDeleteSession, useChatSessions } from '@/hooks/useChat'
import { formatRelativeTime } from '@/utils/format'

export default function HistoryPage() {
  const navigate = useNavigate()
  const { sessions } = useChatStore()
  const { mutate: deleteSession } = useDeleteSession()
  useChatSessions()

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-foreground">Chat History</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{sessions.length} conversations</p>
          </div>
          <Button onClick={() => navigate('/chat')}>
            <MessageSquare className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {sessions.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="w-7 h-7" />}
            title="No chat history"
            description="Start a conversation with your documents to see your history here."
            action={
              <Button onClick={() => navigate('/chat')}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Start chatting
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {sessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-5 group hover:shadow-glow-primary transition-all cursor-pointer"
                onClick={() => { navigate(`/chat/${session.id}`) }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-lumora-primary/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-lumora-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-lumora-primary transition-colors">{session.title}</h3>
                    <div className="flex items-center gap-4 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="w-3 h-3" />
                        {session.messageCount} messages
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        {session.documentIds.length} document{session.documentIds.length !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(session.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface-high hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate(`/chat/${session.id}`)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface-high hover:text-foreground transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
