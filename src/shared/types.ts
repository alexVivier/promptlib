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
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  editorFontSize: 14,
  autoSaveDelay: 500
}

export interface SearchResult {
  id: string
  title: string
  folder: string
  tags: string[]
  snippet: string
}

export interface ElectronAPI {
  getPrompts(): Promise<PromptMeta[]>
  getPrompt(id: string): Promise<Prompt>
  createPrompt(data: Partial<Prompt>): Promise<Prompt>
  updatePrompt(id: string, data: Partial<Prompt>): Promise<Prompt>
  deletePrompt(id: string): Promise<void>
  getFolders(): Promise<string[]>
  createFolder(folderPath: string): Promise<void>
  getAllTags(): Promise<string[]>
  renameFolder(oldPath: string, newPath: string): Promise<void>
  deleteFolder(folderPath: string): Promise<void>
  searchAllPrompts(query: string): Promise<SearchResult[]>
  copyToClipboard(text: string): Promise<void>
  exportPromptAsMarkdown(id: string): Promise<void>
  importMarkdown(): Promise<Prompt[]>
  getSettings(): Promise<AppSettings>
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>
  hidePalette(): Promise<void>
  resizePalette(height: number): Promise<void>
  onOpenCommandPalette(callback: () => void): () => void
}
