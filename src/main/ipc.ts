import { ipcMain, clipboard, dialog } from 'electron'
import { readFileSync, writeFileSync } from 'fs'
import { basename } from 'path'
import * as promptStore from './services/prompt-store'
import * as settingsStore from './services/settings-store'
import * as imageStore from './services/image-store'

export function registerIpcHandlers(): void {
  ipcMain.handle('get-prompts', () => {
    return promptStore.getPrompts()
  })

  ipcMain.handle('get-prompt', (_, id: string) => {
    return promptStore.getPrompt(id)
  })

  ipcMain.handle('create-prompt', (_, data) => {
    return promptStore.createPrompt(data)
  })

  ipcMain.handle('update-prompt', (_, id: string, data) => {
    return promptStore.updatePrompt(id, data)
  })

  ipcMain.handle('delete-prompt', (_, id: string) => {
    return promptStore.deletePrompt(id)
  })

  ipcMain.handle('get-folders', () => {
    return promptStore.getFolders()
  })

  ipcMain.handle('get-all-tags', () => {
    return promptStore.getAllTags()
  })

  ipcMain.handle('search-all-prompts', (_, query: string) => {
    return promptStore.searchAllPrompts(query)
  })

  ipcMain.handle('create-folder', (_, folderPath: string) => {
    return promptStore.createFolder(folderPath)
  })

  ipcMain.handle('rename-folder', (_, oldPath: string, newPath: string) => {
    return promptStore.renameFolder(oldPath, newPath)
  })

  ipcMain.handle('delete-folder', (_, folderPath: string) => {
    return promptStore.deleteFolder(folderPath)
  })

  ipcMain.handle('get-folder-context', (_, folderPath: string) => {
    return promptStore.getFolderContext(folderPath)
  })

  ipcMain.handle('set-folder-context', (_, folderPath: string, context: string) => {
    return promptStore.setFolderContext(folderPath, context)
  })

  ipcMain.handle('copy-to-clipboard', (_, text: string) => {
    clipboard.writeText(text)
  })

  ipcMain.handle('export-prompt-as-markdown', async (event, id: string) => {
    const prompt = promptStore.getPrompt(id)
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
    const imported: ReturnType<typeof promptStore.createPrompt>[] = []
    for (const filePath of filePaths) {
      const content = readFileSync(filePath, 'utf-8')
      const title = basename(filePath).replace(/\.(md|txt)$/, '')
      const prompt = promptStore.createPrompt({ title, content })
      imported.push(prompt)
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

  ipcMain.handle('get-settings', () => {
    return settingsStore.getSettings()
  })

  ipcMain.handle('update-settings', (_, settings) => {
    return settingsStore.updateSettings(settings)
  })
}
