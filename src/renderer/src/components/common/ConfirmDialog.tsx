import { usePromptStore } from '../../stores/promptStore'
import { useUIStore } from '../../stores/uiStore'

export function ConfirmDialog() {
  const { showDeleteConfirm, setShowDeleteConfirm } = useUIStore()
  const { deletePrompt } = usePromptStore()

  if (!showDeleteConfirm) return null

  const handleConfirm = () => {
    deletePrompt(showDeleteConfirm)
    setShowDeleteConfirm(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl p-6 max-w-sm mx-4">
        <h3 className="text-lg font-semibold mb-2">Supprimer ce prompt ?</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Cette action est irréversible. Le prompt sera définitivement supprimé.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowDeleteConfirm(null)}
            className="px-4 py-2 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
