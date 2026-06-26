import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      className={cn('flex flex-col items-center justify-center text-center py-16 px-4', className)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-lumora-primary/5 rounded-full blur-3xl scale-150" />
        <div className="relative w-16 h-16 rounded-2xl bg-surface-high border border-border flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">{description}</p>
      {action}
    </motion.div>
  )
}
