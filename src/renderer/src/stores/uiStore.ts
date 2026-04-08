import { create } from 'zustand'
import type { SupportedLanguage } from '../i18n'
import type { EditorView } from '@codemirror/view'
import i18n from '../i18n'

type ViewMode = 'split' | 'editor' | 'preview'
export type ThemeMode = 'light' | 'dark' | 'system'

interface UIState {
  viewMode: ViewMode
  sidebarOpen: boolean
  searchQuery: string
  showDeleteConfirm: string | null
  showCommandPalette: boolean
  editingFolderContext: string | null
  theme: ThemeMode
  language: SupportedLanguage
  splitRatio: number
  editorView: EditorView | null

  setViewMode: (mode: ViewMode) => void
  toggleSidebar: () => void
  setSearchQuery: (query: string) => void
  setShowDeleteConfirm: (id: string | null) => void
  setShowCommandPalette: (show: boolean) => void
  setEditingFolderContext: (folder: string | null) => void
  setTheme: (theme: ThemeMode) => void
  cycleTheme: () => void
  setLanguage: (lang: SupportedLanguage) => void
  setSplitRatio: (ratio: number) => void
  setEditorView: (view: EditorView | null) => void
}

const THEME_KEY = 'promptlib-theme'
const LANGUAGE_KEY = 'promptlib-language'

function loadTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {}
  return 'system'
}

function loadLanguage(): SupportedLanguage {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY)
    if (stored === 'fr' || stored === 'en' || stored === 'es' || stored === 'pt' || stored === 'de')
      return stored
  } catch {}
  return 'fr'
}

// Initialize i18n with stored language
const initialLang = loadLanguage()
i18n.changeLanguage(initialLang)

export const useUIStore = create<UIState>((set, get) => ({
  viewMode: 'split',
  sidebarOpen: true,
  searchQuery: '',
  showDeleteConfirm: null,
  showCommandPalette: false,
  editingFolderContext: null,
  theme: loadTheme(),
  language: initialLang,
  splitRatio: 0.5,
  editorView: null,

  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setShowDeleteConfirm: (id) => set({ showDeleteConfirm: id }),
  setShowCommandPalette: (show) => set({ showCommandPalette: show }),
  setEditingFolderContext: (folder) => set({ editingFolderContext: folder }),
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
  },
  setSplitRatio: (ratio) => set({ splitRatio: Math.max(0.2, Math.min(0.8, ratio)) }),
  setEditorView: (view) => set({ editorView: view }),
  setLanguage: (lang) => {
    localStorage.setItem(LANGUAGE_KEY, lang)
    i18n.changeLanguage(lang)
    set({ language: lang })
    // Persist to settings and rebuild native menu
    window.api.updateSettings({ language: lang }).then(() => {
      window.api.rebuildMenu()
    })
  }
}))
