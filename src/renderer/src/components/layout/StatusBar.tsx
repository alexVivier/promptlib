import { usePromptStore } from '../../stores/promptStore'
import { useUIStore } from '../../stores/uiStore'

const themeLabels = { system: 'Auto', light: 'Clair', dark: 'Sombre' } as const
const themeIcons = { system: '\u25D1', light: '\u2600', dark: '\u263E' } as const

export function StatusBar() {
  const { activePrompt } = usePromptStore()
  const { theme, cycleTheme } = useUIStore()

  const wordCount = activePrompt
    ? activePrompt.content
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length
    : 0

  const charCount = activePrompt ? activePrompt.content.length : 0

  return (
    <div className="h-8 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 flex items-center px-3 text-xs text-zinc-400 shrink-0">
      {activePrompt && (
        <>
          <span>{wordCount} mot{wordCount !== 1 ? 's' : ''}</span>
          <span className="mx-2">&middot;</span>
          <span>{charCount} car.</span>
          <span className="mx-2">&middot;</span>
          <span>{activePrompt.folder === '/' ? 'Général' : activePrompt.folder.replace(/^\//, '')}</span>
          {activePrompt.tags.length > 0 && (
            <>
              <span className="mx-2">&middot;</span>
              <span>{activePrompt.tags.join(', ')}</span>
            </>
          )}
        </>
      )}

      <span className="flex-1" />

      <button
        onClick={cycleTheme}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        title={`Thème : ${themeLabels[theme]}`}
      >
        <span>{themeIcons[theme]}</span>
        <span>{themeLabels[theme]}</span>
      </button>
    </div>
  )
}
