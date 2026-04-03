import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { usePromptStore } from '../../stores/promptStore'

export function TagInput() {
  const { activePrompt, updatePrompt } = usePromptStore()
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  if (!activePrompt) return null

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase()
    if (trimmed && !activePrompt.tags.includes(trimmed)) {
      updatePrompt(activePrompt.id, { tags: [...activePrompt.tags, trimmed] })
    }
    setInputValue('')
  }

  const removeTag = (tag: string) => {
    updatePrompt(activePrompt.id, {
      tags: activePrompt.tags.filter((t) => t !== tag)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    }
    if (e.key === 'Backspace' && !inputValue && activePrompt.tags.length > 0) {
      removeTag(activePrompt.tags[activePrompt.tags.length - 1])
    }
  }

  return (
    <div className="flex items-center gap-1 flex-wrap flex-1">
      {activePrompt.tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded-full text-xs transition-all"
        >
          {tag}
          <button
            onClick={() => removeTag(tag)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 ml-0.5 transition-colors"
          >
            &times;
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => inputValue && addTag(inputValue)}
        placeholder={t('addTag')}
        className="flex-1 min-w-20 bg-transparent text-xs outline-none placeholder:text-zinc-400"
      />
    </div>
  )
}
