export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
}

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
export const MAX_FILES_PER_UPLOAD = 10

export const STORAGE_LIMIT = 5 * 1024 * 1024 * 1024 // 5 GB

export const COLLECTION_COLORS = [
  '#7c3aed',
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#db2777',
  '#0891b2',
  '#65a30d',
]

export const SCORE_THRESHOLDS = {
  high: 0.85,
  medium: 0.7,
  low: 0.5,
}

export function getScoreColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.high) return 'text-emerald-400'
  if (score >= SCORE_THRESHOLDS.medium) return 'text-yellow-400'
  return 'text-red-400'
}

export function getScoreLabel(score: number): string {
  if (score >= SCORE_THRESHOLDS.high) return 'High'
  if (score >= SCORE_THRESHOLDS.medium) return 'Medium'
  return 'Low'
}
