import type { PromptMeta } from '../../../../shared/types'
import { PromptListItem } from './PromptListItem'

interface PromptListProps {
  prompts: PromptMeta[]
}

export function PromptList({ prompts }: PromptListProps) {
  if (prompts.length === 0) {
    return (
      <div className="px-3 py-6 text-center text-sm text-zinc-400">Aucun prompt</div>
    )
  }

  return (
    <div className="px-2 py-1 space-y-0.5">
      {prompts.map((prompt) => (
        <PromptListItem key={prompt.id} prompt={prompt} />
      ))}
    </div>
  )
}
