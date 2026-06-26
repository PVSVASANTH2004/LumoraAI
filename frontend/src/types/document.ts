export type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'error'

export interface Document {
  id: string
  name: string
  size: number
  pageCount: number
  status: DocumentStatus
  uploadedAt: string
  updatedAt: string
  collectionId: string | null
  thumbnailUrl: string | null
  url: string
  mimeType: string
  tags: string[]
  summary: string | null
}

export interface Collection {
  id: string
  name: string
  description: string | null
  color: string
  documentCount: number
  createdAt: string
  updatedAt: string
}

export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error'
  error?: string
  docId?: string
}

export interface DocumentChunk {
  id: string
  documentId: string
  pageNumber: number
  text: string
  score: number
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
}
