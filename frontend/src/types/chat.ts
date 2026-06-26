import type { DocumentChunk } from './document'

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Source {
  documentId: string
  documentName: string
  pageNumber: number
  score: number
  snippet: string
  chunk: DocumentChunk | null
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  sources: Source[]
  createdAt: string
  isStreaming?: boolean
  feedback?: 'positive' | 'negative' | null
}

export interface ChatSession {
  id: string
  title: string
  documentIds: string[]
  messages: Message[]
  createdAt: string
  updatedAt: string
  messageCount: number
}

export interface StreamChunk {
  type: 'delta' | 'sources' | 'done' | 'error'
  content?: string
  sources?: Source[]
  error?: string
}
