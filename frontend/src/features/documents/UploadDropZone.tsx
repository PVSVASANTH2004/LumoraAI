import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useUpload } from '@/hooks/useUpload'
import { useDocumentStore } from '@/store/documentStore'
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '@/utils/constants'
import { cn } from '@/utils/cn'

export default function UploadDropZone({ compact = false }: { compact?: boolean }) {
  const { uploadFiles, isDragging, setIsDragging } = useUpload()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDragging(false)
      uploadFiles(acceptedFiles)
    },
    [uploadFiles, setIsDragging],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  })

  if (compact) {
    return (
      <div>
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200',
            isDragActive
              ? 'border-lumora-primary bg-lumora-primary/5'
              : 'border-border hover:border-lumora-primary/50 hover:bg-surface-high',
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-1.5" />
          <p className="text-xs text-muted-foreground">Drop files or <span className="text-lumora-primary">browse</span></p>
        </div>
        <UploadQueue />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300',
          isDragActive || isDragging
            ? 'border-lumora-primary bg-lumora-primary/5 shadow-glow-primary'
            : 'border-border hover:border-lumora-primary/40 hover:bg-surface-high',
        )}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-high border border-border flex items-center justify-center mb-4">
            <Upload className={cn('w-7 h-7 transition-colors', isDragActive ? 'text-lumora-primary' : 'text-muted-foreground')} />
          </div>
        </motion.div>

        <h3 className="text-base font-semibold text-foreground mb-2">
          {isDragActive ? 'Drop your files here' : 'Upload documents'}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Drag & drop your PDF, Word, or text files here, or click to browse
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>PDF, DOC, DOCX, TXT, MD</span>
          <span>·</span>
          <span>Up to 50MB per file</span>
          <span>·</span>
          <span>Max 10 files</span>
        </div>
        {!isDragActive && (
          <Button variant="outline" size="sm" className="mt-4" type="button">
            Choose files
          </Button>
        )}
      </div>

      <UploadQueue />
    </div>
  )
}

function UploadQueue() {
  const { uploads, removeUpload } = useDocumentStore()

  if (uploads.length === 0) return null

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {uploads.map((upload) => (
          <motion.div
            key={upload.fileId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-border/50">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-foreground truncate">{upload.fileName}</p>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {upload.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {(upload.status === 'uploading' || upload.status === 'processing') && (
                      <Loader2 className="w-3.5 h-3.5 text-lumora-primary animate-spin" />
                    )}
                    {upload.status === 'error' && (
                      <button onClick={() => removeUpload(upload.fileId)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <Progress value={upload.progress} className="h-1" />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {upload.status === 'uploading' && `Uploading... ${upload.progress}%`}
                  {upload.status === 'processing' && 'Processing...'}
                  {upload.status === 'done' && 'Complete'}
                  {upload.status === 'error' && (upload.error ?? 'Failed')}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
