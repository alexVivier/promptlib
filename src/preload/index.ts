import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI } from '../shared/types'

const api: ElectronAPI = {
  // Server config (CRUD)
  getServers: () => ipcRenderer.invoke('get-servers'),
  addServer: (name, url, email) => ipcRenderer.invoke('add-server', name, url, email),
  updateServer: (id, data) => ipcRenderer.invoke('update-server', id, data),
  removeServer: (id) => ipcRenderer.invoke('remove-server', id),

  // Server connection
  connectToServer: (serverId, password) => ipcRenderer.invoke('connect-to-server', serverId, password),
  signupOnServer: (serverId, email, displayName, password) => ipcRenderer.invoke('signup-on-server', serverId, email, displayName, password),
  disconnectServer: () => ipcRenderer.invoke('disconnect-server'),
  tryRestoreServer: (serverId) => ipcRenderer.invoke('try-restore-server', serverId),
  serverStatus: () => ipcRenderer.invoke('server-status'),
  getAuthToken: () => ipcRenderer.invoke('get-auth-token'),
  getServerUrl: () => ipcRenderer.invoke('get-server-url'),

  // Prompts
  getPrompts: () => ipcRenderer.invoke('get-prompts'),
  getPrompt: (id) => ipcRenderer.invoke('get-prompt', id),
  createPrompt: (data) => ipcRenderer.invoke('create-prompt', data),
  updatePrompt: (id, data) => ipcRenderer.invoke('update-prompt', id, data),
  deletePrompt: (id) => ipcRenderer.invoke('delete-prompt', id),

  // Folders
  getFolders: () => ipcRenderer.invoke('get-folders'),
  createFolder: (folderPath) => ipcRenderer.invoke('create-folder', folderPath),
  getAllTags: () => ipcRenderer.invoke('get-all-tags'),
  searchAllPrompts: (query) => ipcRenderer.invoke('search-all-prompts', query),
  renameFolder: (oldPath, newPath) => ipcRenderer.invoke('rename-folder', oldPath, newPath),
  deleteFolder: (folderPath) => ipcRenderer.invoke('delete-folder', folderPath),
  getFolderContext: (folderPath) => ipcRenderer.invoke('get-folder-context', folderPath),
  setFolderContext: (folderPath, context) => ipcRenderer.invoke('set-folder-context', folderPath, context),

  // Utils
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  saveImage: (imageData, mimeType) => ipcRenderer.invoke('save-image', imageData, mimeType),
  pickAndSaveImage: () => ipcRenderer.invoke('pick-and-save-image'),
  exportPromptAsMarkdown: (id) => ipcRenderer.invoke('export-prompt-as-markdown', id),
  importMarkdown: () => ipcRenderer.invoke('import-markdown'),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),

  // Window management
  hidePalette: () => ipcRenderer.invoke('hide-palette'),
  resizePalette: (height) => ipcRenderer.invoke('resize-palette', height),
  rebuildMenu: () => ipcRenderer.invoke('rebuild-menu'),
  onOpenCommandPalette: (callback: () => void) => {
    ipcRenderer.on('open-command-palette', callback)
    return () => ipcRenderer.removeListener('open-command-palette', callback)
  },

  // Admin
  adminGetUsers: () => ipcRenderer.invoke('admin-get-users'),
  adminActivateUser: (userId) => ipcRenderer.invoke('admin-activate-user', userId),
  adminDeactivateUser: (userId) => ipcRenderer.invoke('admin-deactivate-user', userId),

  // Migration
  migrateLocalData: () => ipcRenderer.invoke('migrate-local-data')
}

contextBridge.exposeInMainWorld('api', api)
