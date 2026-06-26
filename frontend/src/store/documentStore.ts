import { create } from 'zustand'
import type { Document, Collection, UploadProgress } from '@/types'

interface DocumentStore {
  documents: Document[]
  collections: Collection[]
  uploads: UploadProgress[]
  selectedDocumentIds: string[]
  viewMode: 'grid' | 'list'

  setDocuments: (docs: Document[]) => void
  addDocument: (doc: Document) => void
  updateDocument: (id: string, updates: Partial<Document>) => void
  removeDocument: (id: string) => void
  setCollections: (cols: Collection[]) => void
  addCollection: (col: Collection) => void
  addUpload: (upload: UploadProgress) => void
  updateUpload: (fileId: string, updates: Partial<UploadProgress>) => void
  removeUpload: (fileId: string) => void
  toggleDocumentSelection: (id: string) => void
  clearSelection: () => void
  setViewMode: (mode: 'grid' | 'list') => void
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  documents: [],
  collections: [],
  uploads: [],
  selectedDocumentIds: [],
  viewMode: 'grid',

  setDocuments: (documents) => set({ documents }),
  addDocument: (doc) => set((s) => ({ documents: [doc, ...s.documents] })),
  updateDocument: (id, updates) =>
    set((s) => ({
      documents: s.documents.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),
  removeDocument: (id) =>
    set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),
  setCollections: (collections) => set({ collections }),
  addCollection: (col) => set((s) => ({ collections: [...s.collections, col] })),
  addUpload: (upload) => set((s) => ({ uploads: [...s.uploads, upload] })),
  updateUpload: (fileId, updates) =>
    set((s) => ({
      uploads: s.uploads.map((u) => (u.fileId === fileId ? { ...u, ...updates } : u)),
    })),
  removeUpload: (fileId) =>
    set((s) => ({ uploads: s.uploads.filter((u) => u.fileId !== fileId) })),
  toggleDocumentSelection: (id) =>
    set((s) => ({
      selectedDocumentIds: s.selectedDocumentIds.includes(id)
        ? s.selectedDocumentIds.filter((i) => i !== id)
        : [...s.selectedDocumentIds, id],
    })),
  clearSelection: () => set({ selectedDocumentIds: [] }),
  setViewMode: (viewMode) => set({ viewMode }),
}))
