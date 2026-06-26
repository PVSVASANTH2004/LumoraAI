import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw,
  ArrowLeft, Search, Maximize2, Download, MessageSquare, FileX,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDocumentStore } from '@/store/documentStore'
import { cn } from '@/utils/cn'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const DEV_TOKEN = 'lumora-dev-token'

export default function PdfViewerPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const navigate = useNavigate()
  const { documents } = useDocumentStore()
  const document = documents.find((d) => d.id === documentId)

  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (!documentId) return
    let objectUrl: string | null = null

    setLoading(true)
    setLoadError(false)
    setPdfUrl(null)

    fetch(`/api/v1/documents/${documentId}/download`, {
      headers: { Authorization: `Bearer ${DEV_TOKEN}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.blob()
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        setPdfUrl(objectUrl)
      })
      .catch(() => {
        setLoadError(true)
        setLoading(false)
      })

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [documentId])

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
  }, [])

  const onDocumentLoadError = useCallback(() => {
    setLoadError(true)
    setLoading(false)
  }, [])

  const zoom = (delta: number) => setScale((s) => Math.min(3, Math.max(0.5, s + delta)))
  const rotate = () => setRotation((r) => (r + 90) % 360)
  const prev = () => setCurrentPage((p) => Math.max(1, p - 1))
  const next = () => setCurrentPage((p) => Math.min(numPages, p + 1))

  const handleDownload = () => {
    if (!pdfUrl || !document) return
    const a = window.document.createElement('a')
    a.href = pdfUrl
    a.download = document.name
    a.click()
  }

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Document not found</p>
          <Button variant="outline" onClick={() => navigate('/documents')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to documents
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/30 bg-surface-low/40 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface-high hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{document.name}</p>
        </div>

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search in PDF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 w-44 text-xs"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-0.5">
          <ToolbarBtn onClick={() => zoom(-0.2)} label="Zoom out"><ZoomOut className="w-4 h-4" /></ToolbarBtn>
          <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(scale * 100)}%</span>
          <ToolbarBtn onClick={() => zoom(0.2)} label="Zoom in"><ZoomIn className="w-4 h-4" /></ToolbarBtn>
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarBtn onClick={rotate} label="Rotate"><RotateCw className="w-4 h-4" /></ToolbarBtn>
          <ToolbarBtn onClick={() => setScale(1)} label="Fit to page"><Maximize2 className="w-4 h-4" /></ToolbarBtn>
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarBtn onClick={handleDownload} label="Download"><Download className="w-4 h-4" /></ToolbarBtn>
        </div>

        <Button size="sm" onClick={() => navigate('/chat')} className="shrink-0">
          <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
          Ask AI
        </Button>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-surface-lowest flex flex-col items-center py-6">
        {/* Loading spinner */}
        {loading && !loadError && (
          <div className="flex items-center justify-center h-96">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-lumora-primary animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {loadError && (
          <div className="w-full max-w-2xl mx-auto rounded-2xl bg-surface-container border border-border/50 p-16 text-center">
            <FileX className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">{document.name}</p>
            <p className="text-xs text-muted-foreground">
              Unable to load PDF preview. The file may still be processing.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => navigate('/documents')}
            >
              Back to documents
            </Button>
          </div>
        )}

        {/* PDF Document */}
        {pdfUrl && !loadError && (
          <motion.div
            className={cn('shadow-float', loading && 'opacity-0')}
            style={{ transform: `scale(${scale}) rotate(${rotation}deg)`, transformOrigin: 'top center' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
            >
              <Page
                pageNumber={currentPage}
                renderTextLayer
                renderAnnotationLayer
                className="rounded-lg overflow-hidden"
              />
            </Document>
          </motion.div>
        )}
      </div>

      {/* Page navigation */}
      <div className="flex items-center justify-center gap-4 px-4 py-3 border-t border-border/30 bg-surface-low/40 flex-shrink-0">
        <button
          onClick={prev}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface-high hover:text-foreground transition-colors disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Input
            type="number"
            value={currentPage}
            onChange={(e) => {
              const v = parseInt(e.target.value)
              if (v >= 1 && v <= numPages) setCurrentPage(v)
            }}
            className="w-14 h-7 text-center text-xs"
            min={1}
            max={numPages}
          />
          <span className="text-muted-foreground">/ {numPages || document.pageCount}</span>
        </div>
        <button
          onClick={next}
          disabled={currentPage >= numPages}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface-high hover:text-foreground transition-colors disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function ToolbarBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface-high hover:text-foreground transition-colors"
    >
      {children}
    </button>
  )
}
