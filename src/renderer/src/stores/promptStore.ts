import { create } from 'zustand'
import type { Prompt, PromptMeta } from '../../../shared/types'

interface PromptState {
  prompts: PromptMeta[]
  activePromptId: string | null
  activePrompt: Prompt | null
  folders: string[]
  tags: string[]
  selectedFolder: string | null
  selectedTag: string | null
  loading: boolean

  loadPrompts: () => Promise<void>
  loadPrompt: (id: string) => Promise<void>
  createPrompt: (folder?: string) => Promise<void>
  updatePrompt: (id: string, data: Partial<Prompt>) => Promise<void>
  deletePrompt: (id: string) => Promise<void>
  duplicatePrompt: (id: string) => Promise<void>
  renameFolder: (oldPath: string, newPath: string) => Promise<void>
  deleteFolder: (folderPath: string) => Promise<void>
  importMarkdown: () => Promise<void>
  setSelectedFolder: (folder: string | null) => void
  setSelectedTag: (tag: string | null) => void
}

export const usePromptStore = create<PromptState>((set, get) => ({
  prompts: [],
  activePromptId: null,
  activePrompt: null,
  folders: ['/'],
  tags: [],
  selectedFolder: null,
  selectedTag: null,
  loading: false,

  loadPrompts: async () => {
    set({ loading: true })
    const [prompts, folders, tags] = await Promise.all([
      window.api.getPrompts(),
      window.api.getFolders(),
      window.api.getAllTags()
    ])
    set({ prompts, folders, tags, loading: false })
  },

  loadPrompt: async (id: string) => {
    const prompt = await window.api.getPrompt(id)
    set({ activePromptId: id, activePrompt: prompt })
  },

  createPrompt: async (folder = '/') => {
    const prompt = await window.api.createPrompt({ folder })
    const folders = await window.api.getFolders()
    set((state) => ({
      prompts: [
        {
          id: prompt.id,
          title: prompt.title,
          tags: prompt.tags,
          folder: prompt.folder,
          isFavorite: prompt.isFavorite,
          createdAt: prompt.createdAt,
          updatedAt: prompt.updatedAt
        },
        ...state.prompts
      ],
      folders,
      activePromptId: prompt.id,
      activePrompt: prompt
    }))
  },

  updatePrompt: async (id: string, data: Partial<Prompt>) => {
    const updated = await window.api.updatePrompt(id, data)
    set((state) => ({
      activePrompt: state.activePromptId === id ? updated : state.activePrompt,
      prompts: state.prompts.map((p) =>
        p.id === id
          ? {
              id: updated.id,
              title: updated.title,
              tags: updated.tags,
              folder: updated.folder,
              isFavorite: updated.isFavorite,
              createdAt: updated.createdAt,
              updatedAt: updated.updatedAt
            }
          : p
      )
    }))

    // Refresh folders and tags if they may have changed
    if (data.folder || data.tags) {
      const [folders, tags] = await Promise.all([
        window.api.getFolders(),
        window.api.getAllTags()
      ])
      set({ folders, tags })
    }
  },

  duplicatePrompt: async (id: string) => {
    const original = await window.api.getPrompt(id)
    const prompt = await window.api.createPrompt({
      title: `${original.title} (copie)`,
      content: original.content,
      tags: original.tags,
      folder: original.folder
    })
    const [folders, tags] = await Promise.all([
      window.api.getFolders(),
      window.api.getAllTags()
    ])
    set((state) => ({
      prompts: [
        {
          id: prompt.id,
          title: prompt.title,
          tags: prompt.tags,
          folder: prompt.folder,
          isFavorite: prompt.isFavorite,
          createdAt: prompt.createdAt,
          updatedAt: prompt.updatedAt
        },
        ...state.prompts
      ],
      folders,
      tags,
      activePromptId: prompt.id,
      activePrompt: prompt
    }))
  },

  deletePrompt: async (id: string) => {
    await window.api.deletePrompt(id)
    const state = get()
    const filtered = state.prompts.filter((p) => p.id !== id)
    const nextActive = state.activePromptId === id ? null : state.activePromptId
    set({
      prompts: filtered,
      activePromptId: nextActive,
      activePrompt: nextActive ? state.activePrompt : null
    })
    const [folders, tags] = await Promise.all([
      window.api.getFolders(),
      window.api.getAllTags()
    ])
    set({ folders, tags })
  },

  renameFolder: async (oldPath: string, newPath: string) => {
    await window.api.renameFolder(oldPath, newPath)
    const [prompts, folders] = await Promise.all([
      window.api.getPrompts(),
      window.api.getFolders()
    ])
    const state = get()
    set({
      prompts,
      folders,
      selectedFolder: state.selectedFolder === oldPath ? newPath : state.selectedFolder
    })
    // Reload active prompt if it was in the renamed folder
    if (state.activePrompt && state.activePrompt.folder === oldPath) {
      const prompt = await window.api.getPrompt(state.activePrompt.id)
      set({ activePrompt: prompt })
    }
  },

  deleteFolder: async (folderPath: string) => {
    await window.api.deleteFolder(folderPath)
    const [prompts, folders] = await Promise.all([
      window.api.getPrompts(),
      window.api.getFolders()
    ])
    const state = get()
    set({
      prompts,
      folders,
      selectedFolder: state.selectedFolder === folderPath ? null : state.selectedFolder
    })
    if (state.activePrompt && state.activePrompt.folder === folderPath) {
      const prompt = await window.api.getPrompt(state.activePrompt.id)
      set({ activePrompt: prompt })
    }
  },

  importMarkdown: async () => {
    const imported = await window.api.importMarkdown()
    if (imported.length > 0) {
      const [prompts, folders, tags] = await Promise.all([
        window.api.getPrompts(),
        window.api.getFolders(),
        window.api.getAllTags()
      ])
      set({
        prompts,
        folders,
        tags,
        activePromptId: imported[0].id,
        activePrompt: imported[0]
      })
    }
  },

  setSelectedFolder: (folder) => set({ selectedFolder: folder, selectedTag: null }),
  setSelectedTag: (tag) => set({ selectedTag: tag, selectedFolder: null })
}))
