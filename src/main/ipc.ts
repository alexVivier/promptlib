import { ipcMain, clipboard, dialog } from 'electron'
import { readFileSync, writeFileSync } from 'fs'
import { basename } from 'path'
import * as promptStore from './services/prompt-store'
import * as settingsStore from './services/settings-store'
import * as imageStore from './services/image-store'
import * as serverCfg from './services/server-config'
import { apiClient } from './services/api-client'
import { migrateLocalData } from './services/migration'
import type { Prompt, PromptMeta, SearchResult, AppSettings, AdminUser } from '../shared/types'

function isRemote(): boolean {
  return apiClient.isConnected()
}

export function registerIpcHandlers(): void {
  // === Server config (CRUD) ===
  ipcMain.handle('get-servers', () => serverCfg.getServers())

  ipcMain.handle('add-server', (_, name: string, url: string, email: string) => {
    return serverCfg.addServer(name, url, email)
  })

  ipcMain.handle('update-server', (_, id: string, data: { name?: string; url?: string; email?: string }) => {
    return serverCfg.updateServer(id, data)
  })

  ipcMain.handle('remove-server', (_, id: string) => {
    // Disconnect first if this is the active server
    if (apiClient.getActiveServerId() === id) {
      apiClient.disconnect()
    }
    serverCfg.removeServer(id)
  })

  // === Server connection ===
  ipcMain.handle('connect-to-server', (_, serverId: string, password: string) => {
    return apiClient.connectToServer(serverId, password)
  })

  ipcMain.handle('signup-on-server', (_, serverId: string, email: string, displayName: string, password: string) => {
    return apiClient.signupAndConnect(serverId, email, displayName, password)
  })

  ipcMain.handle('disconnect-server', () => apiClient.disconnect())

  ipcMain.handle('try-restore-server', (_, serverId: string) => {
    return apiClient.tryRestoreServer(serverId)
  })

  ipcMain.handle('server-status', () => ({
    connected: apiClient.isConnected(),
    activeServerId: apiClient.getActiveServerId(),
    user: apiClient.getCurrentUser()
  }))

  ipcMain.handle('get-auth-token', () => apiClient.getAccessToken())
  ipcMain.handle('get-server-url', () => apiClient.getActiveServerUrl())

  // === Prompts ===
  ipcMain.handle('get-prompts', () => {
    if (isRemote()) return apiClient.request<PromptMeta[]>('GET', '/prompts')
    return promptStore.getPrompts()
  })

  ipcMain.handle('get-prompt', (_, id: string) => {
    if (isRemote()) return apiClient.request<Prompt>('GET', `/prompts/${id}`)
    return promptStore.getPrompt(id)
  })

  ipcMain.handle('create-prompt', (_, data: Partial<Prompt>) => {
    if (isRemote()) return apiClient.request<Prompt>('POST', '/prompts', data)
    return promptStore.createPrompt(data)
  })

  ipcMain.handle('update-prompt', (_, id: string, data: Partial<Prompt>) => {
    if (isRemote()) return apiClient.request<Prompt>('PATCH', `/prompts/${id}`, data)
    return promptStore.updatePrompt(id, data)
  })

  ipcMain.handle('delete-prompt', (_, id: string) => {
    if (isRemote()) return apiClient.request('DELETE', `/prompts/${id}`)
    return promptStore.deletePrompt(id)
  })

  // === Folders ===
  ipcMain.handle('get-folders', async () => {
    if (isRemote()) {
      const folders = await apiClient.request<{ id: string; path: string }[]>('GET', '/folders')
      return ['/', ...folders.map((f) => f.path)]
    }
    return promptStore.getFolders()
  })

  ipcMain.handle('get-all-tags', () => {
    if (isRemote()) return apiClient.request<string[]>('GET', '/prompts/tags')
    return promptStore.getAllTags()
  })

  ipcMain.handle('search-all-prompts', (_, query: string) => {
    if (isRemote()) return apiClient.request<SearchResult[]>('GET', `/prompts/search?q=${encodeURIComponent(query)}`)
    return promptStore.searchAllPrompts(query)
  })

  ipcMain.handle('create-folder', (_, folderPath: string) => {
    if (isRemote()) return apiClient.request('POST', '/folders', { path: folderPath })
    return promptStore.createFolder(folderPath)
  })

  ipcMain.handle('rename-folder', async (_, oldPath: string, newPath: string) => {
    if (isRemote()) {
      const folders = await apiClient.request<{ id: string; path: string }[]>('GET', '/folders')
      const folder = folders.find((f) => f.path === oldPath)
      if (folder) await apiClient.request('PATCH', `/folders/${folder.id}`, { path: newPath })
      return
    }
    return promptStore.renameFolder(oldPath, newPath)
  })

  ipcMain.handle('delete-folder', async (_, folderPath: string) => {
    if (isRemote()) {
      const folders = await apiClient.request<{ id: string; path: string }[]>('GET', '/folders')
      const folder = folders.find((f) => f.path === folderPath)
      if (folder) await apiClient.request('DELETE', `/folders/${folder.id}`)
      return
    }
    return promptStore.deleteFolder(folderPath)
  })

  ipcMain.handle('get-folder-context', async (_, folderPath: string) => {
    if (isRemote()) {
      const folders = await apiClient.request<{ id: string; path: string; context: string }[]>('GET', '/folders')
      return folders.find((f) => f.path === folderPath)?.context ?? ''
    }
    return promptStore.getFolderContext(folderPath)
  })

  ipcMain.handle('set-folder-context', async (_, folderPath: string, context: string) => {
    if (isRemote()) {
      const folders = await apiClient.request<{ id: string; path: string }[]>('GET', '/folders')
      const folder = folders.find((f) => f.path === folderPath)
      if (folder) await apiClient.request('PATCH', `/folders/${folder.id}`, { context })
      return
    }
    return promptStore.setFolderContext(folderPath, context)
  })

  // === Local-only operations ===
  ipcMain.handle('copy-to-clipboard', (_, text: string) => {
    clipboard.writeText(text)
  })

  ipcMain.handle('export-prompt-as-markdown', async (_, id: string) => {
    const prompt = isRemote()
      ? await apiClient.request<Prompt>('GET', `/prompts/${id}`)
      : promptStore.getPrompt(id)
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: `${prompt.title}.md`,
      filters: [{ name: 'Markdown', extensions: ['md'] }]
    })
    if (filePath) {
      writeFileSync(filePath, prompt.content, 'utf-8')
    }
  })

  ipcMain.handle('import-markdown', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      filters: [{ name: 'Markdown', extensions: ['md', 'txt'] }],
      properties: ['openFile', 'multiSelections']
    })
    const imported: Prompt[] = []
    for (const fp of filePaths) {
      const content = readFileSync(fp, 'utf-8')
      const title = basename(fp).replace(/\.(md|txt)$/, '')
      if (isRemote()) {
        const prompt = await apiClient.request<Prompt>('POST', '/prompts', { title, content })
        imported.push(prompt)
      } else {
        imported.push(promptStore.createPrompt({ title, content }))
      }
    }
    return imported
  })

  ipcMain.handle('save-image', (_, imageData: string, mimeType: string) => {
    const buffer = Buffer.from(imageData, 'base64')
    return imageStore.saveImageFromBuffer(buffer, mimeType)
  })

  ipcMain.handle('pick-and-save-image', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] }],
      properties: ['openFile']
    })
    if (filePaths.length === 0) return null
    return imageStore.saveImageFromPath(filePaths[0])
  })

  // === Settings (always local) ===
  ipcMain.handle('get-settings', () => settingsStore.getSettings())
  ipcMain.handle('update-settings', (_, settings: Partial<AppSettings>) => settingsStore.updateSettings(settings))

  // === Admin ===
  ipcMain.handle('admin-get-users', () => apiClient.request<AdminUser[]>('GET', '/admin/users'))
  ipcMain.handle('admin-activate-user', (_, userId: string) => apiClient.request<AdminUser>('POST', `/admin/users/${userId}/activate`))
  ipcMain.handle('admin-deactivate-user', (_, userId: string) => apiClient.request<AdminUser>('POST', `/admin/users/${userId}/deactivate`))

  // === Migration ===
  ipcMain.handle('migrate-local-data', () => migrateLocalData())
}
