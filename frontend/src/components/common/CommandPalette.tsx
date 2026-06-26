import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, FileText, MessageSquare, LayoutDashboard, BookOpen, History, Settings, X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useDocumentStore } from '@/store/documentStore'
import { cn } from '@/utils/cn'

const staticCommands = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, to: '/dashboard', category: 'Navigation' },
  { id: 'documents', label: 'Go to Documents', icon: FileText, to: '/documents', category: 'Navigation' },
  { id: 'chat', label: 'Start AI Chat', icon: MessageSquare, to: '/chat', category: 'Navigation' },
  { id: 'collections', label: 'Browse Collections', icon: BookOpen, to: '/collections', category: 'Navigation' },
  { id: 'history', label: 'View History', icon: History, to: '/history', category: 'Navigation' },
  { id: 'settings', label: 'Open Settings', icon: Settings, to: '/settings', category: 'Navigation' },
]

export default function CommandPalette() {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { setCommandPaletteOpen } = useUIStore()
  const { documents } = useDocumentStore()
  const navigate = useNavigate()

  useEffect(() => {
    inputRef.current?.focus()
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCommandPaletteOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setCommandPaletteOpen])

  const docCommands = documents
    .filter((d) => d.status === 'ready')
    .map((d) => ({
      id: d.id,
      label: d.name,
      icon: FileText,
      to: `/pdf/${d.id}`,
      category: 'Documents',
    }))

  const allCommands = [...staticCommands, ...docCommands]
  const filtered = query
    ? allCommands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : allCommands

  const grouped = filtered.reduce<Record<string, typeof allCommands>>(
    (acc, cmd) => ({ ...acc, [cmd.category]: [...(acc[cmd.category] ?? []), cmd] }),
    {},
  )

  const handleSelect = (to: string) => {
    navigate(to)
    setCommandPaletteOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setCommandPaletteOpen(false)}
      />
      <motion.div
        className="relative w-full max-w-lg glass-card rounded-2xl overflow-hidden shadow-float border border-white/[0.1]"
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, documents..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button onClick={() => setCommandPaletteOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {Object.keys(grouped).length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">No results found</p>
          ) : (
            Object.entries(grouped).map(([category, cmds]) => (
              <div key={category}>
                <p className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  {category}
                </p>
                {cmds.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd.to)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground',
                      'hover:bg-surface-high transition-colors text-left',
                    )}
                  >
                    <cmd.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{cmd.label}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border/50 px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground">
          <span><kbd className="bg-surface-high border border-border rounded px-1">↑↓</kbd> navigate</span>
          <span><kbd className="bg-surface-high border border-border rounded px-1">↵</kbd> select</span>
          <span><kbd className="bg-surface-high border border-border rounded px-1">ESC</kbd> close</span>
        </div>
      </motion.div>
    </div>
  )
}
