import { useEffect } from 'react'
import { usePromptStore } from '../stores/promptStore'
import { useUIStore } from '../stores/uiStore'

export function useKeyboard() {
  const { createPrompt, activePrompt, updatePrompt, duplicatePrompt } = usePromptStore()
  const { toggleSidebar, setShowCommandPalette } = useUIStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey

      // Cmd+Alt+P : command palette (recherche globale)
      if (mod && e.altKey && e.code === 'KeyP') {
        e.preventDefault()
        setShowCommandPalette(true)
        return
      }

      // Cmd+N : nouveau prompt
      if (mod && e.key === 'n') {
        e.preventDefault()
        createPrompt()
      }

      // Cmd+D : dupliquer le prompt
      if (mod && e.key === 'd') {
        e.preventDefault()
        if (activePrompt) {
          duplicatePrompt(activePrompt.id)
        }
      }

      // Cmd+B : toggle sidebar
      if (mod && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }

      // Cmd+Shift+C : copier le markdown
      if (mod && e.shiftKey && e.key === 'c') {
        e.preventDefault()
        if (activePrompt) {
          window.api.copyToClipboard(activePrompt.content)
        }
      }

      // Cmd+S : force save (trigger debounced update immediately)
      if (mod && e.key === 's') {
        e.preventDefault()
        // The editor auto-saves, but this gives user peace of mind
        if (activePrompt) {
          updatePrompt(activePrompt.id, { content: activePrompt.content })
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [createPrompt, toggleSidebar, setShowCommandPalette, activePrompt, updatePrompt, duplicatePrompt])
}
