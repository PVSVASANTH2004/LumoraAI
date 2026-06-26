import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText, MessageSquare, Zap, HardDrive, TrendingUp,
  Clock, ArrowRight, Upload, Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/common/SkeletonCard'
import { useDashboardStats, useDashboardActivity } from '@/hooks/useDashboard'
import { useDocuments } from '@/hooks/useDocuments'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { formatFileSize, formatRelativeTime, formatStoragePercent } from '@/utils/format'
import type { ActivityItem } from '@/types'

const activityIcons: Record<ActivityItem['type'], typeof FileText> = {
  upload: FileText,
  chat: MessageSquare,
  collection: FileText,
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { setUploadModalOpen } = useUIStore()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activity, isLoading: activityLoading } = useDashboardActivity()
  const { data: documents } = useDocuments()

  const storagePercent = stats ? formatStoragePercent(stats.storageUsed, stats.storageLimit) : 0
  const recentDocs = documents?.slice(0, 4) ?? []

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Good {getGreeting()}, {user?.displayName?.split(' ')[0] ?? 'there'} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Here's what's happening in your workspace</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setUploadModalOpen(true)}>
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload
            </Button>
            <Button size="sm" onClick={() => navigate('/chat')}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New chat
            </Button>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Documents',
              value: statsLoading ? null : stats?.totalDocuments,
              icon: FileText,
              delta: `+${stats?.documentsThisMonth ?? 0} this month`,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
            },
            {
              label: 'Questions Asked',
              value: statsLoading ? null : stats?.totalQuestions,
              icon: MessageSquare,
              delta: `+${stats?.questionsThisMonth ?? 0} this month`,
              color: 'text-violet-400',
              bg: 'bg-violet-500/10',
            },
            {
              label: 'Avg Response',
              value: statsLoading ? null : `${stats?.avgResponseTime}s`,
              icon: Zap,
              delta: 'Per query average',
              color: 'text-yellow-400',
              bg: 'bg-yellow-500/10',
            },
            {
              label: 'Storage Used',
              value: statsLoading ? null : formatFileSize(stats?.storageUsed ?? 0),
              icon: HardDrive,
              delta: `${storagePercent}% of ${formatFileSize(stats?.storageLimit ?? 0)}`,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
            },
          ].map((stat, i) => (
            <motion.div key={stat.label} custom={i} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                  </div>
                  <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                {stat.value === null ? (
                  <Skeleton className="h-7 w-16 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">{stat.delta}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Documents */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent Documents</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/documents')} className="text-xs text-muted-foreground">
                    View all <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentDocs.length === 0 ? (
                  <div className="py-8 text-center">
                    <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No documents yet</p>
                    <Button size="sm" className="mt-3" onClick={() => setUploadModalOpen(true)}>
                      Upload your first document
                    </Button>
                  </div>
                ) : (
                  recentDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => navigate(`/pdf/${doc.id}`)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-high transition-colors text-left group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4.5 h-4.5 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-lumora-primary transition-colors">
                          {doc.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {doc.pageCount} pages · {formatRelativeTime(doc.uploadedAt)}
                        </p>
                      </div>
                      <Badge
                        variant={doc.status === 'ready' ? 'success' : doc.status === 'processing' ? 'processing' : 'secondary'}
                      >
                        {doc.status}
                      </Badge>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Storage */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground">Storage</p>
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                </div>
                {statsLoading ? (
                  <Skeleton className="h-2 w-full rounded-full mb-2" />
                ) : (
                  <Progress value={storagePercent} className="mb-2" />
                )}
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(stats?.storageUsed ?? 0)} of {formatFileSize(stats?.storageLimit ?? 0)} used
                </p>
              </Card>
            </motion.div>

            {/* Activity */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activityLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <Skeleton className="w-7 h-7 rounded-lg" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-2.5 w-1/2" />
                        </div>
                      </div>
                    ))
                  ) : (
                    activity?.slice(0, 5).map((item) => {
                      const Icon = activityIcons[item.type]
                      return (
                        <div key={item.id} className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-surface-high flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                            <p className="text-[10px] text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                            <Clock className="w-2.5 h-2.5" />
                            {formatRelativeTime(item.timestamp)}
                          </div>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
