import type { PromptMeta } from '../../../../shared/types'
import { usePromptStore } from '../../stores/promptStore'

interface PromptListItemProps {
  prompt: PromptMeta
}

export function PromptListItem({ prompt }: PromptListItemProps) {
  const { activePromptId, loadPrompt, selectedFolder } = usePromptStore()
  const isActive = activePromptId === prompt.id
  const showFolder = !selectedFolder

  const date = new Date(prompt.updatedAt)
  const timeStr = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })

  const folderLabel = prompt.folder === '/' ? 'Général' : prompt.folder.replace(/^\//, '')

  return (
    <button
      onClick={() => loadPrompt(prompt.id)}
      className={`w-full text-left px-2 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-100 dark:bg-blue-900/30'
          : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
      }`}
    >
      <div className="flex items-start gap-1">
        <span className="flex-1 text-sm font-medium truncate">{prompt.title}</span>
        {prompt.isFavorite && <span className="text-yellow-500 text-xs shrink-0">&#9733;</span>}
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-xs text-zinc-400">{timeStr}</span>
        {showFolder && (
          <span className="text-[10px] px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-zinc-500 dark:text-zinc-400 shrink-0">
            {folderLabel}
          </span>
        )}
        {prompt.tags.length > 0 && (
          <span className="text-xs text-zinc-400 truncate">
            {prompt.tags.slice(0, 2).join(', ')}
          </span>
        )}
      </div>
    </button>
  )
}
