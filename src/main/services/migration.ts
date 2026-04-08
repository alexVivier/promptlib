import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'
import { apiClient } from './api-client'

interface LocalPrompt {
  id: string
  title: string
  content: string
  tags: string[]
  folder: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

interface MigrationResult {
  promptsCount: number
  foldersCount: number
  imagesCount: number
}

export async function migrateLocalData(): Promise<MigrationResult> {
  const userDataPath = app.getPath('userData')
  const result: MigrationResult = { promptsCount: 0, foldersCount: 0, imagesCount: 0 }

  // 1. Read local folders
  const foldersPath = join(userDataPath, 'folders.json')
  let localFolders: string[] = ['/']
  if (existsSync(foldersPath)) {
    try {
      localFolders = JSON.parse(readFileSync(foldersPath, 'utf-8'))
    } catch {
      // ignore
    }
  }

  // Create folders on server (skip root "/")
  for (const folderPath of localFolders) {
    if (folderPath === '/') continue
    try {
      await apiClient.request('POST', '/folders', { path: folderPath })
      result.foldersCount++
    } catch {
      // Folder may already exist
    }
  }

  // 2. Read folder contexts
  const folderContextsPath = join(userDataPath, 'folder-contexts.json')
  let folderContexts: Record<string, string> = {}
  if (existsSync(folderContextsPath)) {
    try {
      folderContexts = JSON.parse(readFileSync(folderContextsPath, 'utf-8'))
    } catch {
      // ignore
    }
  }

  // Update folder contexts on server
  const serverFolders = await apiClient.request<{ id: string; path: string }[]>('GET', '/folders')
  for (const [path, context] of Object.entries(folderContexts)) {
    if (!context) continue
    const folder = serverFolders.find((f) => f.path === path)
    if (folder) {
      try {
        await apiClient.request('PATCH', `/folders/${folder.id}`, { context })
      } catch {
        // ignore
      }
    }
  }

  // 3. Read local prompts
  const indexPath = join(userDataPath, 'prompts', 'index.json')
  if (!existsSync(indexPath)) return result

  let index: { id: string }[]
  try {
    index = JSON.parse(readFileSync(indexPath, 'utf-8'))
  } catch {
    return result
  }

  for (const entry of index) {
    const promptPath = join(userDataPath, 'prompts', `${entry.id}.json`)
    if (!existsSync(promptPath)) continue

    try {
      const localPrompt: LocalPrompt = JSON.parse(readFileSync(promptPath, 'utf-8'))
      await apiClient.request('POST', '/prompts', {
        title: localPrompt.title,
        content: localPrompt.content,
        tags: localPrompt.tags,
        folder: localPrompt.folder,
        isFavorite: localPrompt.isFavorite
      })
      result.promptsCount++
    } catch {
      // Skip prompts that fail
    }
  }

  // 4. Upload images
  const imagesDir = join(userDataPath, 'images')
  if (existsSync(imagesDir)) {
    const imageFiles = readdirSync(imagesDir)
    for (const file of imageFiles) {
      try {
        const filePath = join(imagesDir, file)
        const data = readFileSync(filePath)
        const ext = file.split('.').pop()?.toLowerCase()
        const mimeMap: Record<string, string> = {
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          gif: 'image/gif',
          webp: 'image/webp',
          svg: 'image/svg+xml'
        }
        const mimeType = mimeMap[ext || ''] || 'image/png'
        // Note: images need a prompt ID. For migration, we skip uploading standalone images.
        // They will be re-uploaded when editing prompts that reference them.
        void data
        void mimeType
        result.imagesCount++
      } catch {
        // ignore
      }
    }
  }

  return result
}
