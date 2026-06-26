import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'

export function useGlobalKeyboard() {
  const { setCommandPaletteOpen } = useUIStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setCommandPaletteOpen])
}
