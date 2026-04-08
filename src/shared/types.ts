export interface Prompt {
  id: string
  title: string
  content: string
  tags: string[]
  folder: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export type PromptMeta = Omit<Prompt, 'content'>

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  editorFontSize: number
  autoSaveDelay: number
  language: 'fr' | 'en' | 'es' | 'pt' | 'de'
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  editorFontSize: 14,
  autoSaveDelay: 500,
  language: 'fr'
}

export interface SearchResult {
  id: string
  title: string
  folder: string
  tags: string[]
  snippet: string
}

export interface User {
  id: string
  email: string
  displayName: string
  role?: string
}

export interface AdminUser {
  id: string
  email: string
  displayName: string
  role: string
  isActive: boolean
  createdAt: string
}

export interface ServerConfig {
  id: string
  name: string
  url: string
  email: string
}

export interface ServerStatus {
  connected: boolean
  activeServerId: string | null
  user: User | null
}

export interface ElectronAPI {
  // Server config (CRUD)
  getServers(): Promise<ServerConfig[]>
  addServer(name: string, url: string, email: string): Promise<ServerConfig>
  updateServer(id: string, data: { name?: string; url?: string; email?: string }): Promise<ServerConfig | null>
  removeServer(id: string): Promise<void>

  // Server connection
  connectToServer(serverId: string, password: string): Promise<User>
  signupOnServer(serverId: string, email: string, displayName: string, password: string): Promise<User>
  disconnectServer(): Promise<void>
  tryRestoreServer(serverId: string): Promise<boolean>
  serverStatus(): Promise<ServerStatus>
  getAuthToken(): Promise<string | null>
  getServerUrl(): Promise<string | null>

  // Prompts (local or remote depending on connection)
  getPrompts(): Promise<PromptMeta[]>
  getPrompt(id: string): Promise<Prompt>
  createPrompt(data: Partial<Prompt>): Promise<Prompt>
  updatePrompt(id: string, data: Partial<Prompt>): Promise<Prompt>
  deletePrompt(id: string): Promise<void>

  // Folders
  getFolders(): Promise<string[]>
  createFolder(folderPath: string): Promise<void>
  getAllTags(): Promise<string[]>
  renameFolder(oldPath: string, newPath: string): Promise<void>
  deleteFolder(folderPath: string): Promise<void>
  getFolderContext(folderPath: string): Promise<string>
  setFolderContext(folderPath: string, context: string): Promise<void>

  // Search & utils
  searchAllPrompts(query: string): Promise<SearchResult[]>
  copyToClipboard(text: string): Promise<void>
  saveImage(imageData: string, mimeType: string): Promise<string>
  pickAndSaveImage(): Promise<string | null>
  exportPromptAsMarkdown(id: string): Promise<void>
  importMarkdown(): Promise<Prompt[]>

  // Settings (always local)
  getSettings(): Promise<AppSettings>
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>

  // Window management
  hidePalette(): Promise<void>
  resizePalette(height: number): Promise<void>
  rebuildMenu(): Promise<void>
  onOpenCommandPalette(callback: () => void): () => void

  // Admin (requires server connection + admin role)
  adminGetUsers(): Promise<AdminUser[]>
  adminActivateUser(userId: string): Promise<AdminUser>
  adminDeactivateUser(userId: string): Promise<AdminUser>

  // Migration
  migrateLocalData(): Promise<{ promptsCount: number; foldersCount: number; imagesCount: number }>
}
