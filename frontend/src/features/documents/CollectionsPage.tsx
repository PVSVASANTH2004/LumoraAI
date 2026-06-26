import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, Trash2, FileText, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import EmptyState from '@/components/common/EmptyState'
import { useCollections, useCreateCollection } from '@/hooks/useDocuments'
import { useDocumentStore } from '@/store/documentStore'
import { COLLECTION_COLORS } from '@/utils/constants'
import { formatRelativeTime } from '@/utils/format'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  description: z.string().max(200).optional(),
})
type FormData = z.infer<typeof schema>

export default function CollectionsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState(COLLECTION_COLORS[0])
  const { data: collections } = useCollections()
  const { documents } = useDocumentStore()
  const { mutate: createCollection, isPending } = useCreateCollection()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    createCollection({ ...data, description: data.description ?? '', color: selectedColor })
    reset()
    setCreateOpen(false)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-foreground">Collections</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Organize your documents into workspaces</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Collection
          </Button>
        </div>

        {!collections?.length ? (
          <EmptyState
            icon={<BookOpen className="w-7 h-7" />}
            title="No collections yet"
            description="Create collections to organize your documents into projects or topics."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create collection
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {collections.map((col, i) => {
                const colDocs = documents.filter((d) => d.collectionId === col.id)
                return (
                  <motion.div
                    key={col.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card rounded-2xl p-5 group hover:shadow-glow-primary transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${col.color}20`, border: `1px solid ${col.color}40` }}
                      >
                        <BookOpen className="w-5 h-5" style={{ color: col.color }} />
                      </div>
                      <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface-high opacity-0 group-hover:opacity-100 transition-all hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{col.name}</h3>
                    {col.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{col.description}</p>}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {colDocs.slice(0, 3).map((doc) => (
                        <div key={doc.id} className="flex items-center gap-1 text-[10px] text-muted-foreground bg-surface-high px-2 py-0.5 rounded-full">
                          <FileText className="w-2.5 h-2.5" />
                          <span className="truncate max-w-20">{doc.name.replace('.pdf', '')}</span>
                        </div>
                      ))}
                      {colDocs.length > 3 && (
                        <span className="text-[10px] text-muted-foreground bg-surface-high px-2 py-0.5 rounded-full">
                          +{colDocs.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-3">
                      <span>{col.documentCount} documents</span>
                      <span>{formatRelativeTime(col.updatedAt)}</span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="e.g. Finance Reports" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input placeholder="What's in this collection?" {...register('description')} />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex gap-2">
                {COLLECTION_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      outline: selectedColor === color ? `2px solid ${color}` : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Collection
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
