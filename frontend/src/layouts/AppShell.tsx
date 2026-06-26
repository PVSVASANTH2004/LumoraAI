import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import { useUIStore } from '@/store/uiStore'
import { useGlobalKeyboard } from '@/hooks/useKeyboard'
import UploadModal from '@/features/documents/UploadModal'
import CommandPalette from '@/components/common/CommandPalette'

export default function AppShell() {
  useGlobalKeyboard()
  const { sidebarCollapsed, uploadModalOpen, commandPaletteOpen, reducedMotion, compactMode } = useUIStore()

  // Apply data-attributes to <html> so CSS selectors can react to settings
  useEffect(() => {
    const root = document.documentElement
    root.dataset.reducedMotion = String(reducedMotion)
    root.dataset.compact = String(compactMode)
  }, [reducedMotion, compactMode])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => useUIStore.getState().setSidebarCollapsed(true)}
          />
        )}
      </AnimatePresence>

      <main
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: 0 }}
      >
        <Outlet />
      </main>

      {uploadModalOpen && <UploadModal />}
      {commandPaletteOpen && <CommandPalette />}
    </div>
  )
}
