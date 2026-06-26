import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsApi, collectionsApi } from '@/services/api'
import { useDocumentStore } from '@/store/documentStore'
import { useEffect } from 'react'
import { toast } from 'sonner'

export function useDocuments() {
  const { documents, setDocuments } = useDocumentStore()

  // Poll every 3s while any document is still processing
  const hasProcessing = documents.some((d) => d.status === 'processing')

  const query = useQuery({
    queryKey: ['documents'],
    queryFn: documentsApi.list,
    refetchInterval: hasProcessing ? 3000 : false,
  })

  useEffect(() => {
    if (query.data) setDocuments(query.data)
  }, [query.data, setDocuments])

  return query
}

export function useCollections() {
  const { setCollections } = useDocumentStore()

  const query = useQuery({
    queryKey: ['collections'],
    queryFn: collectionsApi.list,
  })

  useEffect(() => {
    if (query.data) setCollections(query.data)
  }, [query.data, setCollections])

  return query
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  const { removeDocument } = useDocumentStore()

  return useMutation({
    mutationFn: documentsApi.delete,
    onSuccess: (data) => {
      removeDocument(data.id)
      qc.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document deleted')
    },
    onError: () => toast.error('Failed to delete document'),
  })
}

export function useCreateCollection() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: collectionsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collections'] })
      toast.success('Collection created')
    },
    onError: () => toast.error('Failed to create collection'),
  })
}
