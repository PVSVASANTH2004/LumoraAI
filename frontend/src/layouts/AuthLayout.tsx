import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Logo from '@/components/common/Logo'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-low items-center justify-center p-12">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lumora-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        </div>
        <motion.div
          className="relative z-10 max-w-md"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Logo size="lg" className="mb-12" />
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-4">
            Intelligence meets your <span className="gradient-text">documents</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            Upload any PDF, ask questions in natural language, and get precise answers with source citations.
          </p>
          <div className="space-y-3">
            {[
              'Instant answers from your documents',
              'Source citations with page numbers',
              'Multi-document conversation threads',
              'AI-powered document summaries',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-4 h-4 rounded-full bg-lumora-primary/20 border border-lumora-primary/40 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-lumora-primary" />
                </div>
                {feat}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Logo size="md" />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
