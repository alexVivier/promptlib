import { useCallback, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { usePromptStore } from '../../stores/promptStore'
import { useResolvedDark } from '../../hooks/useTheme'

export function MarkdownEditor() {
  const { activePrompt, updatePrompt } = usePromptStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDark = useResolvedDark()

  const handleChange = useCallback(
    (value: string) => {
      if (!activePrompt) return

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        updatePrompt(activePrompt.id, { content: value })
      }, 500)
    },
    [activePrompt, updatePrompt]
  )

  if (!activePrompt) return null

  return (
    <CodeMirror
      value={activePrompt.content}
      onChange={handleChange}
      extensions={[markdown()]}
      theme={isDark ? oneDark : undefined}
      className="h-full"
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: true,
        highlightSelectionMatches: true
      }}
    />
  )
}
