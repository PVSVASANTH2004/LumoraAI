export interface DashboardStats {
  totalDocuments: number
  totalQuestions: number
  storageUsed: number
  storageLimit: number
  avgResponseTime: number
  documentsThisMonth: number
  questionsThisMonth: number
}

export interface ActivityItem {
  id: string
  type: 'upload' | 'chat' | 'collection'
  title: string
  description: string
  timestamp: string
  documentId?: string
  sessionId?: string
}
