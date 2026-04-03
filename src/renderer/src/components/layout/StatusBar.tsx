import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePromptStore } from '../../stores/promptStore'
import { useUIStore } from '../../stores/uiStore'
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from '../../i18n'
import type { SupportedLanguage } from '../../i18n'

const themeIcons = { system: '\u25D1', light: '\u2600', dark: '\u263E' } as const

export function StatusBar() {
  const { activePrompt } = usePromptStore()
  const { theme, cycleTheme, language, setLanguage } = useUIStore()
  const { t } = useTranslation()
  const [showLangMenu, setShowLangMenu] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  const wordCount = activePrompt
    ? activePrompt.content
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length
    : 0

  const charCount = activePrompt ? activePrompt.content.length : 0

  const themeLabels = { system: t('themeAuto'), light: t('themeLight'), dark: t('themeDark') }

  // Close lang menu on outside click
  useEffect(() => {
    if (!showLangMenu) return
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showLangMenu])

  return (
    <div className="h-8 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 flex items-center px-3 text-xs text-zinc-400 shrink-0">
      {activePrompt && (
        <>
          <span>{t('wordCount', { count: wordCount })}</span>
          <span className="mx-2">&middot;</span>
          <span>{t('chars', { count: charCount })}</span>
          {activePrompt.folder !== '/' && (
            <>
              <span className="mx-2">&middot;</span>
              <span>{activePrompt.folder.replace(/^\//, '')}</span>
            </>
          )}
          {activePrompt.tags.length > 0 && (
            <>
              <span className="mx-2">&middot;</span>
              <span>{activePrompt.tags.join(', ')}</span>
            </>
          )}
        </>
      )}

      <span className="flex-1" />

      {/* Language selector */}
      <div className="relative" ref={langRef}>
        <button
          onClick={() => setShowLangMenu(!showLangMenu)}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors mr-1"
        >
          <span className="text-[10px] uppercase font-medium">{language}</span>
        </button>
        {showLangMenu && (
          <div className="absolute bottom-full right-0 mb-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-30 min-w-32 py-1 lang-dropdown">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang as SupportedLanguage)
                  setShowLangMenu(false)
                }}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${
                  language === lang ? 'text-blue-500 font-medium' : ''
                }`}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <button
        onClick={cycleTheme}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        title={`${t('themeLabel')} : ${themeLabels[theme]}`}
      >
        <span>{themeIcons[theme]}</span>
        <span>{themeLabels[theme]}</span>
      </button>
    </div>
  )
}
