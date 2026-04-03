import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { SearchResult } from '../../../../shared/types'
import { useUIStore } from '../../stores/uiStore'

export function CommandPalette() {
  const { showCommandPalette, setShowCommandPalette } = useUIStore()
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (showCommandPalette) {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
      setCopiedId(null)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [showCommandPalette])

  const search = useCallback((q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (!q.trim()) {
      setResults([])
      setSelectedIndex(0)
      return
    }

    timerRef.current = setTimeout(async () => {
      const res = await window.api.searchAllPrompts(q)
      setResults(res)
      setSelectedIndex(0)
    }, 150)
  }, [])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    search(value)
  }

  const handleCopy = async (id: string) => {
    const prompt = await window.api.getPrompt(id)
    const folderContext = await window.api.getFolderContext(prompt.folder)
    const text = folderContext
      ? folderContext + '\n\n---\n\n' + prompt.content
      : prompt.content
    await window.api.copyToClipboard(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowCommandPalette(false)
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    }
    if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault()
      handleCopy(results[selectedIndex].id)
    }
  }

  if (!showCommandPalette) return null

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center pt-[18vh] z-50 backdrop-enter"
      onClick={() => setShowCommandPalette(false)}
    >
      <div
        className="liquid-glass relative rounded-2xl w-full max-w-xl overflow-hidden palette-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 glass-divider border-b">
          <svg
            className="w-5 h-5 text-zinc-400 dark:text-zinc-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('searchAllPrompts')}
            className="flex-1 bg-transparent text-base font-light outline-none placeholder:text-zinc-400/60 dark:placeholder:text-zinc-500 text-zinc-800 dark:text-zinc-100"
          />
          <kbd className="glass-kbd px-2 py-0.5 rounded-md text-[11px] text-zinc-500 dark:text-zinc-400 font-mono shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query.trim() && results.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-zinc-400/80 dark:text-zinc-500 fade-in">
              {t('noResults', { query })}
            </div>
          )}

          {results.map((result, index) => (
            <div
              key={result.id}
              className={`px-5 py-3 cursor-pointer glass-item-hover ${
                index === selectedIndex ? 'glass-item-selected' : ''
              }`}
              onClick={() => handleCopy(result.id)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate text-zinc-800 dark:text-zinc-100">
                      {result.title}
                    </span>
                    {result.folder !== '/' && (
                      <span className="text-[11px] text-zinc-400/70 dark:text-zinc-500 shrink-0">
                        {result.folder.replace(/^\//, '')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500/80 dark:text-zinc-400/60 mt-0.5 truncate">
                    {result.snippet}
                  </p>
                  {result.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {result.tags.map((tag) => (
                        <span
                          key={tag}
                          className="glass-pill px-2 py-0 rounded-full text-[11px] text-zinc-600 dark:text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopy(result.id)
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-white interactive btn-press ${
                    copiedId === result.id
                      ? 'glass-copy-btn-success'
                      : index === selectedIndex
                        ? 'glass-copy-btn'
                        : 'glass-pill text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  {copiedId === result.id ? t('copied') : t('copy')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        {results.length > 0 && (
          <div className="px-5 py-2.5 glass-divider border-t text-[11px] text-zinc-400/60 dark:text-zinc-500 flex gap-4">
            <span>
              <kbd className="glass-kbd px-1.5 py-0.5 rounded font-mono text-[10px]">
                &#8593;&#8595;
              </kbd>{' '}
              {t('navigate')}
            </span>
            <span>
              <kbd className="glass-kbd px-1.5 py-0.5 rounded font-mono text-[10px]">
                &#9166;
              </kbd>{' '}
              {t('copyAction')}
            </span>
            <span>
              <kbd className="glass-kbd px-1.5 py-0.5 rounded font-mono text-[10px]">
                Esc
              </kbd>{' '}
              {t('close')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
