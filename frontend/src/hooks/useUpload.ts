import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { documentsApi } from '@/services/api'
import { useDocumentStore } from '@/store/documentStore'
import type { UploadProgress } from '@/types'
import { toast } from 'sonner'
import { MAX_FILE_SIZE, MAX_FILES_PER_UPLOAD } from '@/utils/constants'

export function useUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const { addUpload, updateUpload, removeUpload, addDocument } = useDocumentStore()
  const qc = useQueryClient()

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const validFiles = files.slice(0, MAX_FILES_PER_UPLOAD).filter((f) => {
        if (f.size > MAX_FILE_SIZE) {
          toast.error(`${f.name} exceeds 50MB limit`)
          return false
        }
        return true
      })

      if (validFiles.length === 0) return

      const uploads: UploadProgress[] = validFiles.map((f) => ({
        fileId: `upload-${Date.now()}-${f.name}`,
        fileName: f.name,
        progress: 0,
        status: 'pending',
      }))

      uploads.forEach((u) => addUpload(u))

      await Promise.all(
        validFiles.map(async (file, i) => {
          const fileId = uploads[i].fileId
          try {
            updateUpload(fileId, { status: 'uploading' })
            const doc = await documentsApi.upload(file, (progress) => {
              updateUpload(fileId, { progress })
            })
            updateUpload(fileId, { status: 'processing', progress: 100 })
            updateUpload(fileId, { status: 'done', docId: doc.id })
            addDocument(doc)
            qc.invalidateQueries({ queryKey: ['documents'] })
            qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
            qc.invalidateQueries({ queryKey: ['dashboard-activity'] })
            setTimeout(() => removeUpload(fileId), 3000)
            toast.success(`${file.name} uploaded successfully`)
          } catch {
            updateUpload(fileId, { status: 'error', error: 'Upload failed' })
            toast.error(`Failed to upload ${file.name}`)
          }
        }),
      )
    },
    [addUpload, updateUpload, removeUpload, addDocument, qc],
  )

  return { uploadFiles, isDragging, setIsDragging }
}
