import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePromptStore } from '../../stores/promptStore'
import { useUIStore } from '../../stores/uiStore'
import { TagInput } from '../prompt/TagInput'

export function EditorToolbar() {
  const { activePrompt, updatePrompt, duplicatePrompt, folders } = usePromptStore()
  const { viewMode, setViewMode, setShowDeleteConfirm } = useUIStore()
  const { t } = useTranslation()
  const [editingTitle, setEditingTitle] = useState(false)
  const [showFolderMenu, setShowFolderMenu] = useState(false)
  const [newFolder, setNewFolder] = useState('')
  const [copied, setCopied] = useState(false)

  if (!activePrompt) return null

  const handleTitleSubmit = (value: string) => {
    if (value.trim()) {
      updatePrompt(activePrompt.id, { title: value.trim() })
    }
    setEditingTitle(false)
  }

  const handleCopy = async () => {
    const folderContext = await window.api.getFolderContext(activePrompt.folder)
    const text = folderContext
      ? folderContext + '\n\n---\n\n' + activePrompt.content
      : activePrompt.content
    window.api.copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleExport = () => {
    window.api.exportPromptAsMarkdown(activePrompt.id)
  }

  const handleFolderChange = (folder: string) => {
    updatePrompt(activePrompt.id, { folder })
    setShowFolderMenu(false)
    setNewFolder('')
  }

  const handleNewFolder = () => {
    if (newFolder.trim()) {
      const folder = newFolder.startsWith('/') ? newFolder.trim() : `/${newFolder.trim()}`
      handleFolderChange(folder)
    }
  }

  const viewModes = [
    { key: 'editor' as const, label: t('editor') },
    { key: 'split' as const, label: t('split') },
    { key: 'preview' as const, label: t('preview') }
  ]

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-700 px-4 py-2 space-y-2 shrink-0 titlebar-no-drag">
      {/* Title row */}
      <div className="flex items-center gap-3">
        {editingTitle ? (
          <input
            autoFocus
            defaultValue={activePrompt.title}
            onBlur={(e) => handleTitleSubmit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSubmit(e.currentTarget.value)
              if (e.key === 'Escape') setEditingTitle(false)
            }}
            className="flex-1 text-lg font-semibold bg-transparent border-b-2 border-blue-500 outline-none"
          />
        ) : (
          <h1
            onClick={() => setEditingTitle(true)}
            className="flex-1 text-lg font-semibold cursor-pointer hover:text-blue-500 transition-colors truncate"
          >
            {activePrompt.title}
          </h1>
        )}

        {/* Favorite */}
        <button
          onClick={() => updatePrompt(activePrompt.id, { isFavorite: !activePrompt.isFavorite })}
          className={`text-lg transition-transform hover:scale-110 ${activePrompt.isFavorite ? 'text-yellow-500' : 'text-zinc-300 dark:text-zinc-600 hover:text-yellow-500'}`}
          title={t('favorite')}
        >
          {activePrompt.isFavorite ? '\u2605' : '\u2606'}
        </button>

        {/* View mode toggle */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
          {viewModes.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={`px-2 py-1 text-xs rounded transition-all ${
                viewMode === key
                  ? 'bg-white dark:bg-zinc-700 shadow-sm'
                  : 'hover:bg-zinc-200 dark:hover:bg-zinc-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <button
          onClick={handleCopy}
          className={`px-2 py-1 text-xs rounded transition-all interactive btn-press ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
          title={t('copyMarkdown')}
        >
          {copied ? t('copied') : t('copy')}
        </button>
        <button
          onClick={() => duplicatePrompt(activePrompt.id)}
          className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-all interactive btn-press"
          title={t('duplicateShortcut')}
        >
          {t('duplicate')}
        </button>
        <button
          onClick={handleExport}
          className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-all interactive btn-press"
          title={t('exportMd')}
        >
          {t('export')}
        </button>
        <button
          onClick={() => setShowDeleteConfirm(activePrompt.id)}
          className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all interactive btn-press"
          title={t('delete')}
        >
          {t('delete')}
        </button>
      </div>

      {/* Tags + Folder row */}
      <div className="flex items-center gap-3 text-sm">
        {/* Folder selector */}
        <div className="relative">
          {activePrompt.folder !== '/' && (
            <button
              onClick={() => setShowFolderMenu(!showFolderMenu)}
              className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all interactive"
            >
              {activePrompt.folder.replace(/^\//, '')}
            </button>
          )}
          {activePrompt.folder === '/' && (
            <button
              onClick={() => setShowFolderMenu(!showFolderMenu)}
              className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all interactive text-zinc-400"
            >
              {t('newFolder')}
            </button>
          )}
          {showFolderMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-10 min-w-40 lang-dropdown">
              {folders.filter((f) => f !== '/').map((f) => (
                <button
                  key={f}
                  onClick={() => handleFolderChange(f)}
                  className={`w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${
                    f === activePrompt.folder ? 'text-blue-500' : ''
                  }`}
                >
                  {f.replace(/^\//, '')}
                </button>
              ))}
              <div className="border-t border-zinc-200 dark:border-zinc-700 p-2 flex gap-1">
                <input
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNewFolder()}
                  placeholder={t('newFolderPlaceholder')}
                  className="flex-1 px-2 py-1 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={handleNewFolder}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded interactive btn-press"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <TagInput />
      </div>
    </div>
  )
}
