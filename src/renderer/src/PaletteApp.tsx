import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { SearchResult } from '../../shared/types'

export function PaletteApp() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-focus on mount and when window regains focus
  useEffect(() => {
    inputRef.current?.focus()
    const onFocus = () => {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
      setCopiedId(null)
      inputRef.current?.focus()
      requestAnimationFrame(() => inputRef.current?.focus())
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  // Global Escape listener (works even if input loses focus)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.api.hidePalette()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

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
    }, 100)
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
    setTimeout(() => setCopiedId(null), 1200)
  }

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const items = listRef.current.children
    if (items[selectedIndex]) {
      items[selectedIndex].scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
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

  // Click on backdrop = close palette
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      window.api.hidePalette()
    }
  }

  // Detect system dark mode
  const [isDark, setIsDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div className={isDark ? 'dark' : ''}>
      {/* Full-screen backdrop — near-invisible bg so Electron captures clicks on transparent window */}
      <div
        className="fixed inset-0 flex justify-center"
        style={{ paddingTop: 180, backgroundColor: 'rgba(0,0,0,0.01)' }}
        onMouseDown={handleBackdropClick}
      >
        {/* Palette content */}
        <div className="w-[680px] h-fit max-h-[400px] flex flex-col palette-enter">
          <div className="liquid-glass relative rounded-2xl overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4">
              <svg
                className="w-5 h-5 text-zinc-400 shrink-0"
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
                autoFocus
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('searchPrompt')}
                className="flex-1 bg-transparent text-lg font-light outline-none placeholder:text-zinc-400/60 dark:placeholder:text-zinc-500 text-zinc-800 dark:text-zinc-100"
              />
              <kbd className="glass-kbd px-2 py-1 rounded-md text-[11px] text-zinc-500 dark:text-zinc-400 font-mono shrink-0">
                ESC
              </kbd>
            </div>

            {/* Results */}
            {(results.length > 0 || (query.trim() && results.length === 0)) && (
              <div className="glass-divider border-t">
                <div ref={listRef} className="max-h-72 overflow-y-auto">
                  {query.trim() && results.length === 0 && (
                    <div className="px-5 py-8 text-center text-sm text-zinc-400/80 dark:text-zinc-500 fade-in">
                      {t('noResultsShort')}
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
                        <span
                          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-white ${
                            copiedId === result.id
                              ? 'glass-copy-btn-success'
                              : index === selectedIndex
                                ? 'glass-copy-btn'
                                : 'glass-pill text-zinc-600 dark:text-zinc-300'
                          }`}
                        >
                          {copiedId === result.id ? t('copied') : t('copy')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
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
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
