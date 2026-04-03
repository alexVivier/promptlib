import { useEffect } from 'react'
import { usePromptStore } from './stores/promptStore'
import { useUIStore } from './stores/uiStore'
import { Sidebar } from './components/layout/Sidebar'
import { StatusBar } from './components/layout/StatusBar'
import { MarkdownEditor } from './components/editor/MarkdownEditor'
import { MarkdownPreview } from './components/editor/MarkdownPreview'
import { EditorToolbar } from './components/editor/EditorToolbar'
import { ConfirmDialog } from './components/common/ConfirmDialog'
import { useKeyboard } from './hooks/useKeyboard'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const { loadPrompts, activePrompt } = usePromptStore()
  const { viewMode, sidebarOpen, showDeleteConfirm } = useUIStore()

  useKeyboard()
  useTheme()

  useEffect(() => {
    loadPrompts()
  }, [loadPrompts])


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
              <div className="flex-1 flex overflow-hidden">
                {(viewMode === 'split' || viewMode === 'editor') && (
                  <div
                    className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} overflow-hidden border-r border-zinc-200 dark:border-zinc-700`}
                  >
                    <MarkdownEditor />
                  </div>
                )}
                {(viewMode === 'split' || viewMode === 'preview') && (
                  <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} overflow-auto p-6`}>
                    <MarkdownPreview />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-400">
              <div className="text-center">
                <p className="text-lg mb-2">Aucun prompt sélectionné</p>
                <p className="text-sm">
                  Crée un nouveau prompt avec{' '}
                  <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-mono">
                    ⌘N
                  </kbd>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <StatusBar />

      {showDeleteConfirm && <ConfirmDialog />}
    </div>
  )
}
