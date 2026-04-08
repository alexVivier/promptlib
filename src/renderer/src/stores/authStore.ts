import { create } from 'zustand'
import type { User, ServerConfig } from '../../../shared/types'

type ConnectionStatus = 'local' | 'connecting' | 'connected' | 'error'

interface AuthState {
  user: User | null
  servers: ServerConfig[]
  activeServerId: string | null
  connectionStatus: ConnectionStatus
  error: string | null

  loadServers: () => Promise<void>
  addServer: (name: string, url: string, email: string) => Promise<ServerConfig>
  updateServer: (id: string, data: { name?: string; url?: string; email?: string }) => Promise<void>
  removeServer: (id: string) => Promise<void>
  connectToServer: (serverId: string, password: string) => Promise<void>
  signupOnServer: (serverId: string, email: string, displayName: string, password: string) => Promise<void>
  disconnect: () => Promise<void>
  tryRestoreServer: (serverId: string) => Promise<boolean>
  setConnectionStatus: (status: ConnectionStatus) => void
  isRemote: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  servers: [],
  activeServerId: null,
  connectionStatus: 'local',
  error: null,

  loadServers: async () => {
    const servers = await window.api.getServers()
    set({ servers })
  },

  addServer: async (name, url, email) => {
    const server = await window.api.addServer(name, url, email)
    set((s) => ({ servers: [...s.servers, server] }))
    return server
  },

  updateServer: async (id, data) => {
    const updated = await window.api.updateServer(id, data)
    if (updated) {
      set((s) => ({ servers: s.servers.map((srv) => (srv.id === id ? updated : srv)) }))
    }
  },

  removeServer: async (id) => {
    await window.api.removeServer(id)
    const state = get()
    set({
      servers: state.servers.filter((s) => s.id !== id),
      ...(state.activeServerId === id
        ? { activeServerId: null, user: null, connectionStatus: 'local' as const, error: null }
        : {})
    })
  },

  connectToServer: async (serverId, password) => {
    set({ connectionStatus: 'connecting', error: null })
    try {
      const user = await window.api.connectToServer(serverId, password)
      set({ user, activeServerId: serverId, connectionStatus: 'connected', error: null })
    } catch (err) {
      set({ connectionStatus: 'error', error: err instanceof Error ? err.message : 'Connection failed' })
      throw err
    }
  },

  signupOnServer: async (serverId, email, displayName, password) => {
    set({ connectionStatus: 'connecting', error: null })
    try {
      const user = await window.api.signupOnServer(serverId, email, displayName, password)
      set({ user, activeServerId: serverId, connectionStatus: 'connected', error: null })
    } catch (err) {
      set({ connectionStatus: 'error', error: err instanceof Error ? err.message : 'Signup failed' })
      throw err
    }
  },

  disconnect: async () => {
    await window.api.disconnectServer()
    set({ user: null, activeServerId: null, connectionStatus: 'local', error: null })
  },

  tryRestoreServer: async (serverId) => {
    set({ connectionStatus: 'connecting' })
    try {
      const restored = await window.api.tryRestoreServer(serverId)
      if (restored) {
        const status = await window.api.serverStatus()
        set({ user: status.user, activeServerId: serverId, connectionStatus: 'connected' })
        return true
      }
      set({ connectionStatus: 'local' })
      return false
    } catch {
      set({ connectionStatus: 'local' })
      return false
    }
  },

  setConnectionStatus: (status) => set({ connectionStatus: status }),
  isRemote: () => get().connectionStatus === 'connected'
}))
