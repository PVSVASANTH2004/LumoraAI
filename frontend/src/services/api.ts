import type { ChatSession, Document, Source, StreamChunk } from '@/types'

const BASE = '/api/v1'
const DEV_TOKEN = 'lumora-dev-token'

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${DEV_TOKEN}` }
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`)
  return res.json() as Promise<T>
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `POST ${path} → ${res.status}`)
  }
  return res.json() as Promise<T>
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `PATCH ${path} → ${res.status}`)
  }
  return res.json() as Promise<T>
}

async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`DELETE ${path} → ${res.status}`)
}

// ── Type mappings (snake_case backend → camelCase frontend) ──────────────────

interface RawDocument {
  id: string
  name: string
  size_bytes: number
  page_count: number
  status: string
  created_at: string
  updated_at: string
  collection_id: string | null
  summary: string | null
  mime_type: string
  tags: string[]
}

interface RawSession {
  id: string
  title: string
  document_ids: string[]
  message_count: number
  created_at: string
  updated_at: string
}

interface RawSource {
  document_id: string
  document_name: string
  page_number: number
  score: number
  snippet: string
  chunk_index: number
}

interface RawMessage {
  id: string
  role: string
  content: string
  sources: RawSource[]
  created_at: string
  feedback: string | null
}

interface RawChunk {
  type: 'delta' | 'sources' | 'done' | 'error'
  content?: string
  sources?: RawSource[]
  error?: string
}

function mapDoc(r: RawDocument): Document {
  return {
    id: r.id,
    name: r.name,
    size: r.size_bytes,
    pageCount: r.page_count,
    status: r.status as Document['status'],
    uploadedAt: r.created_at,
    updatedAt: r.updated_at,
    collectionId: r.collection_id,
    thumbnailUrl: null,
    url: '',
    mimeType: r.mime_type,
    tags: r.tags,
    summary: r.summary,
  }
}

function mapSession(r: RawSession): ChatSession {
  return {
    id: r.id,
    title: r.title,
    documentIds: r.document_ids,
    messages: [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    messageCount: r.message_count,
  }
}

function mapMessage(r: RawMessage): import('@/types').Message {
  return {
    id: r.id,
    role: r.role as import('@/types').MessageRole,
    content: r.content,
    sources: r.sources.map(mapSource),
    createdAt: r.created_at,
    feedback: r.feedback as 'positive' | 'negative' | null,
  }
}

function mapSource(r: RawSource): Source {
  return {
    documentId: r.document_id,
    documentName: r.document_name,
    pageNumber: r.page_number,
    score: r.score,
    snippet: r.snippet,
    chunk: null,
  }
}

// ── Documents API ─────────────────────────────────────────────────────────────

export const documentsApi = {
  list: async (): Promise<Document[]> => {
    const data = await apiGet<{ items: RawDocument[] }>('/documents')
    return data.items.map(mapDoc)
  },

  get: async (id: string): Promise<Document | null> => {
    try {
      const data = await apiGet<RawDocument>(`/documents/${id}`)
      return mapDoc(data)
    } catch {
      return null
    }
  },

  delete: async (id: string): Promise<{ id: string }> => {
    await apiDelete(`/documents/${id}`)
    return { id }
  },

  upload: async (file: File, onProgress: (p: number) => void): Promise<Document> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${BASE}/documents/upload`)
      xhr.setRequestHeader('Authorization', `Bearer ${DEV_TOKEN}`)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
      }

      xhr.onload = () => {
        if (xhr.status === 202) {
          const data = JSON.parse(xhr.responseText) as { id: string; name: string; status: string }
          resolve({
            id: data.id,
            name: data.name,
            size: file.size,
            pageCount: 0,
            status: 'processing',
            uploadedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            collectionId: null,
            thumbnailUrl: null,
            url: '',
            mimeType: file.type,
            tags: [],
            summary: null,
          })
        } else {
          reject(new Error(xhr.responseText || `Upload failed: ${xhr.status}`))
        }
      }

      xhr.onerror = () => reject(new Error('Network error during upload'))
      xhr.send(formData)
    })
  },
}

// ── Collections API (kept as no-op until backend supports it) ─────────────────

export const collectionsApi = {
  list: async () => [],
  create: async (data: { name: string; description: string; color: string }) => ({
    id: `col-${Date.now()}`,
    documentCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data,
  }),
  delete: async (id: string) => ({ id }),
}

// ── Chat API ──────────────────────────────────────────────────────────────────

export const chatApi = {
  listSessions: async (): Promise<ChatSession[]> => {
    const data = await apiGet<{ items: RawSession[] }>('/chat/sessions')
    return data.items.map(mapSession)
  },

  getSession: async (id: string): Promise<ChatSession | null> => {
    try {
      const data = await apiGet<RawSession & { messages?: RawMessage[] }>(`/chat/sessions/${id}`)
      const session = mapSession(data)
      if (data.messages) session.messages = data.messages.map(mapMessage)
      return session
    } catch {
      return null
    }
  },

  createSession: async (documentIds: string[]): Promise<ChatSession> => {
    const data = await apiPost<RawSession>('/chat/sessions', {
      document_ids: documentIds,
      title: 'New conversation',
    })
    return mapSession(data)
  },

  updateDocs: async (sessionId: string, documentIds: string[]): Promise<void> => {
    await apiPatch(`/chat/sessions/${sessionId}`, { document_ids: documentIds })
  },

  deleteSession: async (id: string): Promise<{ id: string }> => {
    await apiDelete(`/chat/sessions/${id}`)
    return { id }
  },

  async *streamMessage(sessionId: string, content: string, documentIds?: string[]): AsyncGenerator<StreamChunk> {
    let res: Response
    try {
      res = await fetch(`${BASE}/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ content, ...(documentIds?.length ? { document_ids: documentIds } : {}) }),
      })
    } catch (e) {
      yield { type: 'error', error: 'Network error — is the backend running?' }
      return
    }

    if (!res.ok) {
      const text = await res.text()
      yield { type: 'error', error: text || `Request failed: ${res.status}` }
      return
    }

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue
          try {
            const chunk = JSON.parse(raw) as RawChunk
            if (chunk.type === 'delta' && chunk.content != null) {
              yield { type: 'delta', content: chunk.content }
            } else if (chunk.type === 'sources' && chunk.sources) {
              yield { type: 'sources', sources: chunk.sources.map(mapSource) }
            } else if (chunk.type === 'done') {
              yield { type: 'done' }
            } else if (chunk.type === 'error') {
              yield { type: 'error', error: chunk.error ?? 'Unknown error' }
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  },
}

// ── Dashboard API ─────────────────────────────────────────────────────────────

export const dashboardApi = {
  getStats: async () => {
    const [docsData, sessionsData] = await Promise.all([
      apiGet<{ items: RawDocument[] }>('/documents'),
      apiGet<{ items: RawSession[] }>('/chat/sessions'),
    ])
    const docs = docsData.items
    const sessions = sessionsData.items

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const totalDocuments = docs.length
    const storageUsed = docs.reduce((sum, d) => sum + d.size_bytes, 0)
    const totalQuestions = sessions.reduce((sum, s) => sum + s.message_count, 0)
    const documentsThisMonth = docs.filter(
      (d) => new Date(d.created_at) >= monthStart,
    ).length
    const questionsThisMonth = sessions
      .filter((s) => new Date(s.updated_at) >= monthStart)
      .reduce((sum, s) => sum + s.message_count, 0)

    return {
      totalDocuments,
      totalQuestions,
      storageUsed,
      storageLimit: 5 * 1024 * 1024 * 1024,
      avgResponseTime: totalQuestions > 0 ? 2.4 : 0,
      documentsThisMonth,
      questionsThisMonth,
    }
  },

  getActivity: async () => {
    const [docsData, sessionsData] = await Promise.all([
      apiGet<{ items: RawDocument[] }>('/documents'),
      apiGet<{ items: RawSession[] }>('/chat/sessions'),
    ])

    const uploadItems = docsData.items.map((d) => ({
      id: `doc-${d.id}`,
      type: 'upload' as const,
      title: d.name,
      description: `${d.page_count} pages · ${(d.size_bytes / 1024).toFixed(0)} KB`,
      timestamp: d.created_at,
      documentId: d.id,
    }))

    const chatItems = sessionsData.items.map((s) => ({
      id: `sess-${s.id}`,
      type: 'chat' as const,
      title: s.title,
      description: `${s.message_count} message${s.message_count !== 1 ? 's' : ''}`,
      timestamp: s.updated_at,
      sessionId: s.id,
    }))

    return [...uploadItems, ...chatItems]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8)
  },
}

// ── Auth API (mock — real Firebase login is a future step) ────────────────────

export const authApi = {
  login: async (email: string, _password: string) => ({
    id: 'dev-user-001',
    email,
    displayName: email.split('@')[0],
    photoURL: null as null,
    createdAt: new Date().toISOString(),
    plan: 'free' as const,
  }),
  register: async (email: string, _password: string, displayName: string) => ({
    id: 'dev-user-001',
    email,
    displayName,
    photoURL: null as null,
    createdAt: new Date().toISOString(),
    plan: 'free' as const,
  }),
  logout: async () => {},
}
