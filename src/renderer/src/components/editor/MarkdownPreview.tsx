import { useMemo } from 'react'
import { usePromptStore } from '../../stores/promptStore'
import { renderMarkdown } from '../../lib/markdown'

export function MarkdownPreview() {
  const { activePrompt } = usePromptStore()

  const html = useMemo(() => {
    if (!activePrompt) return ''
    return renderMarkdown(activePrompt.content)
  }, [activePrompt?.content])

  if (!activePrompt) return null

  return <div className="prompt-preview" dangerouslySetInnerHTML={{ __html: html }} />
}
