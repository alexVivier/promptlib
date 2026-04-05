import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI } from '../shared/types'

const api: ElectronAPI = {
  getPrompts: () => ipcRenderer.invoke('get-prompts'),
  getPrompt: (id) => ipcRenderer.invoke('get-prompt', id),
  createPrompt: (data) => ipcRenderer.invoke('create-prompt', data),
  updatePrompt: (id, data) => ipcRenderer.invoke('update-prompt', id, data),
  deletePrompt: (id) => ipcRenderer.invoke('delete-prompt', id),
  getFolders: () => ipcRenderer.invoke('get-folders'),
  createFolder: (folderPath) => ipcRenderer.invoke('create-folder', folderPath),
  getAllTags: () => ipcRenderer.invoke('get-all-tags'),
  searchAllPrompts: (query) => ipcRenderer.invoke('search-all-prompts', query),
  renameFolder: (oldPath, newPath) => ipcRenderer.invoke('rename-folder', oldPath, newPath),
  deleteFolder: (folderPath) => ipcRenderer.invoke('delete-folder', folderPath),
  getFolderContext: (folderPath) => ipcRenderer.invoke('get-folder-context', folderPath),
  setFolderContext: (folderPath, context) => ipcRenderer.invoke('set-folder-context', folderPath, context),
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  exportPromptAsMarkdown: (id) => ipcRenderer.invoke('export-prompt-as-markdown', id),
  importMarkdown: () => ipcRenderer.invoke('import-markdown'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
  hidePalette: () => ipcRenderer.invoke('hide-palette'),
  rebuildMenu: () => ipcRenderer.invoke('rebuild-menu'),
  onOpenCommandPalette: (callback: () => void) => {
    ipcRenderer.on('open-command-palette', callback)
    return () => {
      ipcRenderer.removeListener('open-command-palette', callback)
    }
  }
}

contextBridge.exposeInMainWorld('api', api)
