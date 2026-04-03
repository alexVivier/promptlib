import { useTranslation } from 'react-i18next'
import { usePromptStore } from '../../stores/promptStore'
import { useUIStore } from '../../stores/uiStore'

export function ConfirmDialog() {
  const { showDeleteConfirm, setShowDeleteConfirm } = useUIStore()
  const { deletePrompt } = usePromptStore()
  const { t } = useTranslation()

  if (!showDeleteConfirm) return null

  const handleConfirm = () => {
    deletePrompt(showDeleteConfirm)
    setShowDeleteConfirm(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-enter">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl p-6 max-w-sm mx-4 dialog-enter">
        <h3 className="text-lg font-semibold mb-2">{t('deletePromptTitle')}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          {t('deletePromptMessage')}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowDeleteConfirm(null)}
            className="px-4 py-2 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all interactive btn-press"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all interactive btn-press"
          >
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  )
}
