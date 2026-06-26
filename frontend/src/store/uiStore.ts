import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Notifications {
  docProcessing: boolean
  weeklyDigest: boolean
  storageWarnings: boolean
  productUpdates: boolean
}

interface UIStore {
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  uploadModalOpen: boolean
  pdfHighlights: Record<string, number[]>

  // Appearance settings
  reducedMotion: boolean
  compactMode: boolean
  autoOpenSources: boolean
  soundEffects: boolean
  notifications: Notifications

  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setCommandPaletteOpen: (open: boolean) => void
  setUploadModalOpen: (open: boolean) => void
  setPdfHighlights: (documentId: string, pages: number[]) => void
  clearPdfHighlights: (documentId: string) => void

  setReducedMotion: (v: boolean) => void
  setCompactMode: (v: boolean) => void
  setAutoOpenSources: (v: boolean) => void
  setSoundEffects: (v: boolean) => void
  setNotification: (key: keyof Notifications, v: boolean) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      uploadModalOpen: false,
      pdfHighlights: {},

      reducedMotion: false,
      compactMode: false,
      autoOpenSources: true,
      soundEffects: false,
      notifications: {
        docProcessing: true,
        weeklyDigest: false,
        storageWarnings: true,
        productUpdates: true,
      },

      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      setUploadModalOpen: (uploadModalOpen) => set({ uploadModalOpen }),
      setPdfHighlights: (documentId, pages) =>
        set((s) => ({ pdfHighlights: { ...s.pdfHighlights, [documentId]: pages } })),
      clearPdfHighlights: (documentId) =>
        set((s) => {
          const { [documentId]: _, ...rest } = s.pdfHighlights
          return { pdfHighlights: rest }
        }),

      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setCompactMode: (compactMode) => set({ compactMode }),
      setAutoOpenSources: (autoOpenSources) => set({ autoOpenSources }),
      setSoundEffects: (soundEffects) => set({ soundEffects }),
      setNotification: (key, v) =>
        set((s) => ({ notifications: { ...s.notifications, [key]: v } })),
    }),
    {
      name: 'documind-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        reducedMotion: state.reducedMotion,
        compactMode: state.compactMode,
        autoOpenSources: state.autoOpenSources,
        soundEffects: state.soundEffects,
        notifications: state.notifications,
      }),
    },
  ),
)
