import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, MessageSquare, Zap, Shield, Search, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from '@/components/common/Logo'

const features = [
  { icon: FileText, title: 'Multi-format Support', desc: 'Upload PDFs, Word docs, and more' },
  { icon: MessageSquare, title: 'Natural Language Chat', desc: 'Ask questions in plain English' },
  { icon: Zap, title: 'Instant Answers', desc: 'Get responses in under 2 seconds' },
  { icon: Search, title: 'Source Citations', desc: 'Every answer linked to page & snippet' },
  { icon: BookOpen, title: 'Collections', desc: 'Organize documents into workspaces' },
  { icon: Shield, title: 'Secure & Private', desc: 'Enterprise-grade encryption' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-border/30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign in</Button>
            <Button size="sm" onClick={() => navigate('/register')}>Get started</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-lumora-primary/4 rounded-full blur-3xl" />
          <div className="absolute top-32 left-1/4 w-[300px] h-[300px] bg-blue-500/3 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <motion.div
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-lumora-primary/10 border border-lumora-primary/20 text-lumora-primary text-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Zap className="w-3.5 h-3.5" />
            Powered by advanced RAG architecture
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl font-bold text-foreground tracking-tight mb-6 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Chat with your{' '}
            <span className="gradient-text">documents</span>
            <br />intelligently
          </motion.h1>

          <motion.p
            className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Upload any PDF, ask questions in natural language, and get precise answers grounded in your
            documents — with source citations and page references.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Button size="lg" onClick={() => navigate('/register')} className="gap-2 text-base px-8 py-3 h-auto">
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/login')} className="text-base px-8 py-3 h-auto">
              Sign in
            </Button>
          </motion.div>

          <motion.p
            className="mt-4 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            No credit card required · Free tier available
          </motion.p>
        </div>
      </section>

      {/* Preview mockup */}
      <section className="px-6 pb-24">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <div className="rounded-2xl border border-white/[0.08] bg-surface-container overflow-hidden shadow-float">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="flex-1 mx-3 bg-surface-low rounded-md h-6 flex items-center px-3">
                <span className="text-[10px] text-muted-foreground">app.documind.ai/chat</span>
              </div>
            </div>
            <div className="h-72 flex items-center justify-center bg-gradient-surface">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-primary flex items-center justify-center mb-4 shadow-glow-primary">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <p className="text-muted-foreground text-sm">DocuMind AI — Chat Interface Preview</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">Everything you need</h2>
            <p className="text-muted-foreground">Built for power users who demand precision and speed</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="glass-card rounded-2xl p-6 hover:shadow-glow-primary transition-all"
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-glow-primary">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <motion.div
          className="max-w-2xl mx-auto text-center glass-card rounded-3xl p-12 relative overflow-hidden"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-gradient-radial from-lumora-primary/5 via-transparent to-transparent" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-8">Join thousands of teams using DocuMind to unlock insights from their documents.</p>
            <Button size="lg" onClick={() => navigate('/register')} className="gap-2 text-base px-10">
              Create free account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-xs text-muted-foreground">© 2025 DocuMind AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
