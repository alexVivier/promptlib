import { create } from 'zustand'

type ViewMode = 'split' | 'editor' | 'preview'
export type ThemeMode = 'light' | 'dark' | 'system'

interface UIState {
  viewMode: ViewMode
  sidebarOpen: boolean
  searchQuery: string
  showDeleteConfirm: string | null
  showCommandPalette: boolean
  theme: ThemeMode

  setViewMode: (mode: ViewMode) => void
  toggleSidebar: () => void
  setSearchQuery: (query: string) => void
  setShowDeleteConfirm: (id: string | null) => void
  setShowCommandPalette: (show: boolean) => void
  setTheme: (theme: ThemeMode) => void
  cycleTheme: () => void
}

const THEME_KEY = 'promptlib-theme'

function loadTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {}
  return 'system'
}

export const useUIStore = create<UIState>((set, get) => ({
  viewMode: 'split',
  sidebarOpen: true,
  searchQuery: '',
  showDeleteConfirm: null,
  showCommandPalette: false,
  theme: loadTheme(),

  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setShowDeleteConfirm: (id) => set({ showDeleteConfirm: id }),
  setShowCommandPalette: (show) => set({ showCommandPalette: show }),
  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme)
    set({ theme })
  },
  cycleTheme: () => {
    const order: ThemeMode[] = ['system', 'light', 'dark']
    const current = get().theme
    const next = order[(order.indexOf(current) + 1) % order.length]
    localStorage.setItem(THEME_KEY, next)
    set({ theme: next })
  }
}))
