import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync, renameSync } from 'fs'
import { randomUUID } from 'crypto'
import type { Prompt, PromptMeta } from '../../shared/types'

const DATA_DIR = join(app.getPath('userData'), 'prompts')
const INDEX_PATH = join(app.getPath('userData'), 'index.json')

function ensureDataDir(): void {
  mkdirSync(DATA_DIR, { recursive: true })
  if (!existsSync(INDEX_PATH)) {
    writeFileSync(INDEX_PATH, '[]', 'utf-8')
  }
}

function readIndex(): PromptMeta[] {
  ensureDataDir()
  return JSON.parse(readFileSync(INDEX_PATH, 'utf-8'))
}

function writeIndex(index: PromptMeta[]): void {
  const tmp = INDEX_PATH + '.tmp'
  writeFileSync(tmp, JSON.stringify(index, null, 2), 'utf-8')
  renameSync(tmp, INDEX_PATH)
}

function promptPath(id: string): string {
  return join(DATA_DIR, `${id}.json`)
}

function toMeta(prompt: Prompt): PromptMeta {
  const { content: _, ...meta } = prompt
  return meta
}

export function getPrompts(): PromptMeta[] {
  return readIndex()
}

export function getPrompt(id: string): Prompt {
  const filePath = promptPath(id)
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

export function createPrompt(data: Partial<Prompt>): Prompt {
  ensureDataDir()
  const now = new Date().toISOString()
  const prompt: Prompt = {
    id: randomUUID(),
    title: data.title || 'Sans titre',
    content: data.content || '',
    tags: data.tags || [],
    folder: data.folder || '/',
    isFavorite: data.isFavorite || false,
    createdAt: now,
    updatedAt: now
  }

  const tmp = promptPath(prompt.id) + '.tmp'
  writeFileSync(tmp, JSON.stringify(prompt, null, 2), 'utf-8')
  renameSync(tmp, promptPath(prompt.id))

  const index = readIndex()
  index.unshift(toMeta(prompt))
  writeIndex(index)

  return prompt
}

export function updatePrompt(id: string, data: Partial<Prompt>): Prompt {
  const existing = getPrompt(id)
  const updated: Prompt = {
    ...existing,
    ...data,
    id,
    updatedAt: new Date().toISOString()
  }

  const tmp = promptPath(id) + '.tmp'
  writeFileSync(tmp, JSON.stringify(updated, null, 2), 'utf-8')
  renameSync(tmp, promptPath(id))

  const index = readIndex()
  const idx = index.findIndex((p) => p.id === id)
  if (idx !== -1) {
    index[idx] = toMeta(updated)
  }
  writeIndex(index)

  return updated
}

export function deletePrompt(id: string): void {
  const filePath = promptPath(id)
  if (existsSync(filePath)) {
    unlinkSync(filePath)
  }

  const index = readIndex()
  const filtered = index.filter((p) => p.id !== id)
  writeIndex(filtered)
}

export function getFolders(): string[] {
  const index = readIndex()
  const folders = new Set(index.map((p) => p.folder))
  folders.add('/')
  // Include custom folders from registry
  const foldersFile = join(app.getPath('userData'), 'folders.json')
  if (existsSync(foldersFile)) {
    const customFolders: string[] = JSON.parse(readFileSync(foldersFile, 'utf-8'))
    for (const f of customFolders) folders.add(f)
  }
  return Array.from(folders).sort()
}

export function getAllTags(): string[] {
  const index = readIndex()
  const tags = new Set(index.flatMap((p) => p.tags))
  return Array.from(tags).sort()
}

export function createFolder(folderPath: string): void {
  // Create a metadata-only entry in folders by creating a prompt in the folder
  // Actually, we just need to ensure getFolders returns this folder
  // We store folders alongside index - create a folders registry
  const foldersFile = join(app.getPath('userData'), 'folders.json')
  let customFolders: string[] = []
  if (existsSync(foldersFile)) {
    customFolders = JSON.parse(readFileSync(foldersFile, 'utf-8'))
  }
  const normalized = folderPath.startsWith('/') ? folderPath : `/${folderPath}`
  if (normalized.includes('..') || normalized.includes('\0')) {
    throw new Error('Invalid folder path')
  }
  if (!customFolders.includes(normalized)) {
    customFolders.push(normalized)
    writeFileSync(foldersFile, JSON.stringify(customFolders, null, 2), 'utf-8')
  }
}

export function renameFolder(oldPath: string, newPath: string): void {
  const index = readIndex()
  const normalized = newPath.startsWith('/') ? newPath : `/${newPath}`
  if (normalized.includes('..') || normalized.includes('\0')) {
    throw new Error('Invalid folder path')
  }

  for (const meta of index) {
    if (meta.folder === oldPath) {
      meta.folder = normalized
      // Also update the individual prompt file
      const prompt = getPrompt(meta.id)
      prompt.folder = normalized
      const tmp = promptPath(meta.id) + '.tmp'
      writeFileSync(tmp, JSON.stringify(prompt, null, 2), 'utf-8')
      renameSync(tmp, promptPath(meta.id))
    }
  }

  writeIndex(index)

  // Sync folder context on rename
  const contexts = readFolderContexts()
  if (contexts[oldPath]) {
    contexts[normalized] = contexts[oldPath]
    delete contexts[oldPath]
    writeFolderContexts(contexts)
  }
}

export interface SearchResult {
  id: string
  title: string
  folder: string
  tags: string[]
  snippet: string
}

export function searchAllPrompts(query: string): SearchResult[] {
  const index = readIndex()
  const q = query.toLowerCase()
  const results: SearchResult[] = []

  for (const meta of index) {
    const prompt = getPrompt(meta.id)
    const titleMatch = prompt.title.toLowerCase().includes(q)
    const contentMatch = prompt.content.toLowerCase().includes(q)
    const tagMatch = prompt.tags.some((t) => t.toLowerCase().includes(q))

    if (titleMatch || contentMatch || tagMatch) {
      let snippet = ''
      if (contentMatch) {
        const idx = prompt.content.toLowerCase().indexOf(q)
        const start = Math.max(0, idx - 60)
        const end = Math.min(prompt.content.length, idx + query.length + 60)
        snippet = (start > 0 ? '...' : '') + prompt.content.slice(start, end).replace(/\n/g, ' ') + (end < prompt.content.length ? '...' : '')
      } else {
        snippet = prompt.content.slice(0, 120).replace(/\n/g, ' ') + (prompt.content.length > 120 ? '...' : '')
      }

      results.push({
        id: prompt.id,
        title: prompt.title,
        folder: prompt.folder,
        tags: prompt.tags,
        snippet
      })
    }
  }

  return results
}

// --- Folder context ---

const FOLDER_CONTEXTS_PATH = join(app.getPath('userData'), 'folder-contexts.json')

function readFolderContexts(): Record<string, string> {
  if (existsSync(FOLDER_CONTEXTS_PATH)) {
    return JSON.parse(readFileSync(FOLDER_CONTEXTS_PATH, 'utf-8'))
  }
  return {}
}

function writeFolderContexts(contexts: Record<string, string>): void {
  const tmp = FOLDER_CONTEXTS_PATH + '.tmp'
  writeFileSync(tmp, JSON.stringify(contexts, null, 2), 'utf-8')
  renameSync(tmp, FOLDER_CONTEXTS_PATH)
}

export function getFolderContext(folderPath: string): string {
  const contexts = readFolderContexts()
  return contexts[folderPath] || ''
}

export function setFolderContext(folderPath: string, context: string): void {
  const contexts = readFolderContexts()
  if (context.trim()) {
    contexts[folderPath] = context
  } else {
    delete contexts[folderPath]
  }
  writeFolderContexts(contexts)
}

export function deleteFolder(folderPath: string): void {
  const index = readIndex()

  for (const meta of index) {
    if (meta.folder === folderPath) {
      meta.folder = '/'
      const prompt = getPrompt(meta.id)
      prompt.folder = '/'
      const tmp = promptPath(meta.id) + '.tmp'
      writeFileSync(tmp, JSON.stringify(prompt, null, 2), 'utf-8')
      renameSync(tmp, promptPath(meta.id))
    }
  }

  writeIndex(index)

  // Clean up folder context
  const contexts = readFolderContexts()
  if (contexts[folderPath]) {
    delete contexts[folderPath]
    writeFolderContexts(contexts)
  }
}
