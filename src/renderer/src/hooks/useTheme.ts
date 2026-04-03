import { useEffect, useState } from 'react'
import { useUIStore } from '../stores/uiStore'
import type { ThemeMode } from '../stores/uiStore'

export function useResolvedDark(): boolean {
  const theme = useUIStore((s) => s.theme)
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return theme === 'dark' || (theme === 'system' && systemDark)
}

export function useTheme(): { isDark: boolean; theme: ThemeMode } {
  const theme = useUIStore((s) => s.theme)
  const isDark = useResolvedDark()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return { isDark, theme }
}
