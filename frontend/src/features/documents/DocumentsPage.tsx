import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Grid3X3, List, Search, Upload, Trash2,
  MessageSquare, MoreHorizontal, Clock, Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import EmptyState from '@/components/common/EmptyState'
import { SkeletonCard } from '@/components/common/SkeletonCard'
import { useDocuments, useDeleteDocument } from '@/hooks/useDocuments'
import { useCreateSession } from '@/hooks/useChat'
import { useDocumentStore } from '@/store/documentStore'
import { useUIStore } from '@/store/uiStore'
import { formatFileSize, formatRelativeTime } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { Document } from '@/types'
import UploadDropZone from './UploadDropZone'

export default function DocumentsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { viewMode, setViewMode } = useDocumentStore()
  const { setUploadModalOpen } = useUIStore()
  const { data: documents, isLoading } = useDocuments()
  const { mutate: deleteDoc } = useDeleteDocument()
  const { mutateAsync: createSession } = useCreateSession()

  const handleChatAboutDoc = async (docId: string) => {
    const session = await createSession([docId])
    navigate(`/chat/${session.id}`)
  }

  const filtered = (documents ?? []).filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border/30 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Documents</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {documents?.length ?? 0} documents in your workspace
            </p>
          </div>
          <Button onClick={() => setUploadModalOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('p-2 transition-colors', viewMode === 'grid' ? 'bg-surface-high text-foreground' : 'text-muted-foreground hover:text-foreground')}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-2 transition-colors', viewMode === 'list' ? 'bg-surface-high text-foreground' : 'text-muted-foreground hover:text-foreground')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className={cn('grid gap-4', viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          search ? (
            <EmptyState
              icon={<Search className="w-7 h-7" />}
              title="No results found"
              description={`No documents match "${search}"`}
              action={<Button variant="outline" size="sm" onClick={() => setSearch('')}>Clear search</Button>}
            />
          ) : (
            <div className="mt-8">
              <UploadDropZone />
            </div>
          )
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              className={cn(
                'grid gap-4',
                viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1',
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {filtered.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {viewMode === 'grid' ? (
                    <DocumentCard doc={doc} onDelete={() => deleteDoc(doc.id)} onOpen={() => navigate(`/pdf/${doc.id}`)} onChat={() => void handleChatAboutDoc(doc.id)} />
                  ) : (
                    <DocumentRow doc={doc} onDelete={() => deleteDoc(doc.id)} onOpen={() => navigate(`/pdf/${doc.id}`)} onChat={() => void handleChatAboutDoc(doc.id)} />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

function DocumentCard({ doc, onOpen, onDelete, onChat }: { doc: Document; onOpen: () => void; onDelete: () => void; onChat: () => void }) {
  return (
    <div className="glass-card rounded-2xl p-5 group cursor-pointer hover:shadow-glow-primary transition-all duration-200" onClick={onOpen}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-red-400" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface-high opacity-0 group-hover:opacity-100 transition-all">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={onOpen}><Eye className="w-3.5 h-3.5 mr-2" />Open PDF</DropdownMenuItem>
            <DropdownMenuItem onClick={onChat}><MessageSquare className="w-3.5 h-3.5 mr-2" />Start chat</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="w-3.5 h-3.5 mr-2" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="font-medium text-foreground text-sm line-clamp-2 mb-2 group-hover:text-lumora-primary transition-colors">{doc.name}</p>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {formatRelativeTime(doc.uploadedAt)}
        </div>
        <Badge variant={doc.status === 'ready' ? 'success' : doc.status === 'processing' ? 'processing' : 'secondary'}>
          {doc.status}
        </Badge>
      </div>
      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
        <span>{doc.pageCount}p</span>
        <span>·</span>
        <span>{formatFileSize(doc.size)}</span>
      </div>
    </div>
  )
}

function DocumentRow({ doc, onOpen, onDelete, onChat }: { doc: Document; onOpen: () => void; onDelete: () => void; onChat: () => void }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-surface-container hover:bg-surface-high group cursor-pointer transition-colors" onClick={onOpen}>
      <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
        <FileText className="w-4.5 h-4.5 text-red-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate group-hover:text-lumora-primary transition-colors">{doc.name}</p>
        <p className="text-xs text-muted-foreground">{doc.pageCount} pages · {formatFileSize(doc.size)} · {formatRelativeTime(doc.uploadedAt)}</p>
      </div>
      <Badge variant={doc.status === 'ready' ? 'success' : doc.status === 'processing' ? 'processing' : 'secondary'}>
        {doc.status}
      </Badge>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <button onClick={onChat} className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface-highest hover:text-foreground transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface-highest hover:text-destructive transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
