import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useUIStore } from '../../stores/uiStore'

export function FolderContextDialog() {
  const { editingFolderContext, setEditingFolderContext } = useUIStore()
  const { t } = useTranslation()
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (editingFolderContext) {
      setLoading(true)
      window.api.getFolderContext(editingFolderContext).then((ctx) => {
        setContext(ctx)
        setLoading(false)
      })
    }
  }, [editingFolderContext])

  if (!editingFolderContext) return null

  const handleSave = async () => {
    await window.api.setFolderContext(editingFolderContext, context)
    setEditingFolderContext(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-enter">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 dialog-enter">
        <h3 className="text-lg font-semibold mb-1">
          {t('folderContext')}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
          {editingFolderContext.replace(/^\//, '')} — {t('folderContextDescription')}
        </p>
        {loading ? (
          <div className="h-32 flex items-center justify-center text-zinc-400 text-sm">...</div>
        ) : (
          <textarea
            autoFocus
            value={context}
            onChange={(e) => setContext(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setEditingFolderContext(null)
              if (e.key === 'Enter' && e.metaKey) handleSave()
            }}
            placeholder={t('folderContextPlaceholder')}
            className="w-full h-40 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:border-blue-500 transition-colors resize-none font-mono"
          />
        )}
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-zinc-400">{t('folderContextHint')}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingFolderContext(null)}
              className="px-4 py-2 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all interactive btn-press"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all interactive btn-press"
            >
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
