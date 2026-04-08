import { useCallback, useEffect, useMemo, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { usePromptStore } from '../../stores/promptStore'
import { useUIStore } from '../../stores/uiStore'
import { useResolvedDark } from '../../hooks/useTheme'

function insertImageAtCursor(view: EditorView, uri: string): void {
  const pos = view.state.selection.main.head
  view.dispatch({ changes: { from: pos, insert: `![](${uri})` } })
}

async function handleImageFile(file: File, view: EditorView): Promise<void> {
  const reader = new FileReader()
  reader.onload = async () => {
    const base64 = (reader.result as string).split(',')[1]
    try {
      const uri = await window.api.saveImage(base64, file.type)
      insertImageAtCursor(view, uri)
    } catch {
      // silently fail if image save errors
    }
  }
  reader.readAsDataURL(file)
}

export function MarkdownEditor() {
  const { activePrompt, updatePrompt } = usePromptStore()
  const setEditorView = useUIStore((s) => s.setEditorView)
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

  const imageExtension = useMemo(
    () =>
      EditorView.domEventHandlers({
        paste(event: ClipboardEvent, view: EditorView) {
          const items = event.clipboardData?.items
          if (!items) return false

          for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
              event.preventDefault()
              const file = item.getAsFile()
              if (file) handleImageFile(file, view)
              return true
            }
          }
          return false
        },
        drop(event: DragEvent, view: EditorView) {
          const files = event.dataTransfer?.files
          if (!files) return false

          for (const file of Array.from(files)) {
            if (file.type.startsWith('image/')) {
              event.preventDefault()
              handleImageFile(file, view)
              return true
            }
          }
          return false
        },
        dragover(event: DragEvent) {
          const types = event.dataTransfer?.types
          if (types && Array.from(types).includes('Files')) {
            event.preventDefault()
            return true
          }
          return false
        }
      }),
    []
  )

  // Cleanup editorView ref on unmount
  useEffect(() => {
    return () => setEditorView(null)
  }, [setEditorView])

  if (!activePrompt) return null

  return (
    <CodeMirror
      value={activePrompt.content}
      onChange={handleChange}
      onCreateEditor={(view) => setEditorView(view)}
      extensions={[markdown(), EditorView.lineWrapping, imageExtension]}
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
