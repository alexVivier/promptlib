import { useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { usePromptStore } from './stores/promptStore'
import { useUIStore } from './stores/uiStore'
import { useAuthStore } from './stores/authStore'
import { Sidebar } from './components/layout/Sidebar'
import { StatusBar } from './components/layout/StatusBar'
import { MarkdownEditor } from './components/editor/MarkdownEditor'
import { MarkdownPreview } from './components/editor/MarkdownPreview'
import { EditorToolbar } from './components/editor/EditorToolbar'
import { ConfirmDialog } from './components/common/ConfirmDialog'
import { FolderContextDialog } from './components/common/FolderContextDialog'
import { useKeyboard } from './hooks/useKeyboard'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const { loadPrompts, activePrompt } = usePromptStore()
  const { viewMode, sidebarOpen, showDeleteConfirm, splitRatio, setSplitRatio } = useUIStore()
  const { loadServers, connectionStatus } = useAuthStore()
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  useKeyboard()
  useTheme()

  // Load server list on mount
  useEffect(() => {
    loadServers()
  }, [loadServers])

  // Load prompts on mount and when connection status changes
  useEffect(() => {
    loadPrompts()
  }, [loadPrompts, connectionStatus])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const ratio = (e.clientX - rect.left) / rect.width
      setSplitRatio(ratio)
    }

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [setSplitRatio])

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Titlebar drag region */}
      <div className="titlebar-drag h-8 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
        <span className="text-xs text-zinc-400 select-none">PromptLib</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && <Sidebar />}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activePrompt ? (
            <>
              <EditorToolbar />
              <div ref={containerRef} className="flex-1 flex overflow-hidden">
                {(viewMode === 'split' || viewMode === 'editor') && (
                  <div
                    className="overflow-hidden border-r border-zinc-200 dark:border-zinc-700"
                    style={{
                      width: viewMode === 'split' ? `${splitRatio * 100}%` : '100%'
                    }}
                  >
                    <MarkdownEditor />
                  </div>
                )}
                {viewMode === 'split' && (
                  <div
                    className="split-handle"
                    onMouseDown={handleMouseDown}
                  />
                )}
                {(viewMode === 'split' || viewMode === 'preview') && (
                  <div
                    className="overflow-auto p-6"
                    style={{
                      width: viewMode === 'split' ? `${(1 - splitRatio) * 100}%` : '100%'
                    }}
                  >
                    <MarkdownPreview />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-400 fade-in">
              <div className="text-center">
                <p className="text-lg mb-2">{t('noPromptSelected')}</p>
                <p className="text-sm">
                  {t('createNewPromptWith')}{' '}
                  <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-mono">
                    ⌘ + N
                  </kbd>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <StatusBar />

      {showDeleteConfirm && <ConfirmDialog />}
      <FolderContextDialog />
    </div>
  )
}
