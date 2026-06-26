import type { Document, Collection, ChatSession, DashboardStats, ActivityItem } from '@/types'

export const mockDocuments: Document[] = []

export const mockCollections: Collection[] = []

export const mockSessions: ChatSession[] = []

export const mockStats: DashboardStats = {
  totalDocuments: 0,
  totalQuestions: 0,
  storageUsed: 0,
  storageLimit: 5 * 1024 * 1024 * 1024,
  avgResponseTime: 0,
  documentsThisMonth: 0,
  questionsThisMonth: 0,
}

export const mockActivity: ActivityItem[] = []
