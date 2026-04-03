import { useMemo, useState } from 'react'
import { usePromptStore } from '../../stores/promptStore'
import { useUIStore } from '../../stores/uiStore'
import { SearchBar } from '../common/SearchBar'
import { PromptList } from '../prompt/PromptList'
import Fuse from 'fuse.js'

export function Sidebar() {
  const {
    prompts,
    folders,
    tags,
    selectedFolder,
    selectedTag,
    createPrompt,
    importMarkdown,
    renameFolder,
    deleteFolder,
    setSelectedFolder,
    setSelectedTag
  } = usePromptStore()
  const { searchQuery } = useUIStore()

  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [folderMenuOpen, setFolderMenuOpen] = useState<string | null>(null)

  const filteredPrompts = useMemo(() => {
    let result = prompts

    if (selectedFolder) {
      result = result.filter((p) => p.folder === selectedFolder)
    }
    if (selectedTag) {
      result = result.filter((p) => p.tags.includes(selectedTag))
    }

    if (searchQuery.trim()) {
      const fuse = new Fuse(result, {
        keys: ['title', 'tags'],
        threshold: 0.4
      })
      result = fuse.search(searchQuery).map((r) => r.item)
    } else {
      // Sort: favorites first, then by updatedAt descending
      result = [...result].sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
    }

    return result
  }, [prompts, selectedFolder, selectedTag, searchQuery])

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    const path = newFolderName.startsWith('/') ? newFolderName.trim() : `/${newFolderName.trim()}`
    await window.api.createFolder(path)
    // Refresh folders list
    const newFolders = await window.api.getFolders()
    usePromptStore.setState({ folders: newFolders })
    setShowNewFolder(false)
    setNewFolderName('')
    setSelectedFolder(path)
  }

  const handleRenameSubmit = (oldPath: string) => {
    if (!renameValue.trim() || renameValue.trim() === oldPath) {
      setRenamingFolder(null)
      return
    }
    const newPath = renameValue.startsWith('/') ? renameValue.trim() : `/${renameValue.trim()}`
    renameFolder(oldPath, newPath)
    setRenamingFolder(null)
    setRenameValue('')
  }

  const handleDeleteFolder = (folderPath: string) => {
    deleteFolder(folderPath)
    setFolderMenuOpen(null)
  }

  const startRenaming = (folder: string) => {
    setRenamingFolder(folder)
    setRenameValue(folder === '/' ? '' : folder.replace(/^\//, ''))
    setFolderMenuOpen(null)
  }

  return (
    <div className="w-60 shrink-0 bg-zinc-50 dark:bg-zinc-800/50 border-r border-zinc-200 dark:border-zinc-700 flex flex-col overflow-hidden titlebar-no-drag">
      {/* New prompt button */}
      <div className="p-3 space-y-1.5">
        <button
          onClick={() => createPrompt(selectedFolder || '/')}
          className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Nouveau prompt
        </button>
        <button
          onClick={() => importMarkdown()}
          className="w-full px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-xs font-medium transition-colors"
        >
          Importer .md
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <SearchBar />
      </div>

      {/* Folders */}
      <div className="px-3 pb-2">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Dossiers</p>
          <button
            onClick={() => setShowNewFolder(!showNewFolder)}
            className="text-zinc-400 hover:text-blue-500 transition-colors text-sm leading-none"
            title="Nouveau dossier"
          >
            +
          </button>
        </div>

        {/* New folder input */}
        {showNewFolder && (
          <div className="flex gap-1 mb-1">
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder()
                if (e.key === 'Escape') {
                  setShowNewFolder(false)
                  setNewFolderName('')
                }
              }}
              placeholder="Nom du dossier..."
              className="flex-1 px-2 py-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded outline-none focus:border-blue-500"
            />
            <button
              onClick={handleCreateFolder}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        )}

        <div className="space-y-0.5">
          {/* "Tous" button */}
          <button
            onClick={() => setSelectedFolder(null)}
            className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
              !selectedFolder
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            Tous
          </button>

          {/* Folder list */}
          {folders.map((folder) => (
            <div key={folder} className="group relative">
              {renamingFolder === folder ? (
                <div className="flex gap-1">
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit(folder)
                      if (e.key === 'Escape') setRenamingFolder(null)
                    }}
                    onBlur={() => handleRenameSubmit(folder)}
                    className="flex-1 px-2 py-1 text-xs bg-white dark:bg-zinc-900 border border-blue-500 rounded outline-none min-w-0"
                  />
                </div>
              ) : (
                <div className="flex items-center">
                  <button
                    onClick={() => setSelectedFolder(folder)}
                    className={`flex-1 text-left px-2 py-1 rounded text-sm transition-colors truncate ${
                      selectedFolder === folder
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {folder === '/' ? 'Général' : folder.replace(/^\//, '')}
                  </button>

                  {/* Folder actions (hidden until hover, not for root) */}
                  {folder !== '/' && (
                    <div className="hidden group-hover:flex items-center shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setFolderMenuOpen(folderMenuOpen === folder ? null : folder)
                        }}
                        className="px-1 py-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-xs"
                        title="Options"
                      >
                        &#8230;
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Context menu */}
              {folderMenuOpen === folder && (
                <div className="absolute right-0 top-full mt-0.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-20 min-w-32 py-1">
                  <button
                    onClick={() => startRenaming(folder)}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Renommer
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(folder)}
                    className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="px-3 pb-2">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Tags</p>
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-0.5 rounded-full text-xs transition-colors ${
                  selectedTag === tag
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompt list */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-1">
          <p className="text-[10px] text-zinc-400">
            {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''}
            {(selectedFolder || selectedTag || searchQuery.trim()) && ` (${prompts.length} au total)`}
          </p>
        </div>
        <PromptList prompts={filteredPrompts} />
      </div>
    </div>
  )
}
