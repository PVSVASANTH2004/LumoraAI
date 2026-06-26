import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MessageSquare, Trash2, Search } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useShallow } from 'zustand/react/shallow'
import { useChatStore } from '@/store/chatStore'
import { useDeleteSession } from '@/hooks/useChat'
import { formatRelativeTime } from '@/utils/format'
import { cn } from '@/utils/cn'

interface ChatSidebarProps {
  onNewChat: () => void
}

export default function ChatSidebar({ onNewChat }: ChatSidebarProps) {
  const [search, setSearch] = useState('')
  const { sessions, activeSessionId, setActiveSession } = useChatStore(
    useShallow((s) => ({ sessions: s.sessions, activeSessionId: s.activeSessionId, setActiveSession: s.setActiveSession }))
  )
  const { mutate: deleteSession } = useDeleteSession()
  const navigate = useNavigate()

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSelect = (id: string) => {
    setActiveSession(id)
    navigate(`/chat/${id}`)
  }

  return (
    <div className="w-56 flex flex-col border-r border-border/30 bg-surface-low/40 shrink-0">
      <div className="p-3 space-y-2 border-b border-border/30">
        <Button onClick={onNewChat} size="sm" className="w-full">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Chat
        </Button>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 h-7 text-xs"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {filtered.length === 0 ? (
            <div className="py-8 text-center">
              <MessageSquare className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No conversations</p>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="group relative"
                >
                  <button
                    onClick={() => handleSelect(session.id)}
                    className={cn(
                      'w-full text-left px-2.5 py-2 rounded-lg transition-colors',
                      activeSessionId === session.id
                        ? 'bg-lumora-primary/10 text-foreground'
                        : 'text-muted-foreground hover:bg-surface-high hover:text-foreground',
                    )}
                  >
                    <p className="text-xs font-medium truncate">{session.title}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[10px] text-muted-foreground/70">
                        {session.messageCount} msgs
                      </p>
                      <p className="text-[10px] text-muted-foreground/70">
                        {formatRelativeTime(session.updatedAt)}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSession(session.id) }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
