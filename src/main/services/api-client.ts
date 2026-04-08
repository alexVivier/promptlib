import * as serverConfig from './server-config'

/** Active connection state */
let activeServerId: string | null = null
let activeServerUrl: string | null = null
let accessToken: string | null = null
let currentUser: { id: string; email: string; displayName: string } | null = null

interface AuthResponse {
  user: { id: string; email: string; displayName: string }
  accessToken: string
  refreshToken: string
}

async function refreshAccessToken(): Promise<boolean> {
  if (!activeServerId || !activeServerUrl) return false

  const refreshToken = serverConfig.getServerRefreshToken(activeServerId)
  if (!refreshToken) return false

  try {
    const res = await fetch(`${activeServerUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })

    if (!res.ok) {
      serverConfig.setServerRefreshToken(activeServerId, null)
      return false
    }

    const data = await res.json()
    accessToken = data.accessToken
    serverConfig.setServerRefreshToken(activeServerId, data.refreshToken)
    return true
  } catch {
    return false
  }
}

async function request<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  if (!activeServerUrl) throw new Error('Not connected to a server')

  const url = `${activeServerUrl}/api${path}`

  const doFetch = async (token: string | null) => {
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    return fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
  }

  let res = await doFetch(accessToken)

  if (res.status === 401 && accessToken) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      res = await doFetch(accessToken)
    }
  }

  if (res.status === 204) return undefined as T

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

async function connectToServer(serverId: string, password: string): Promise<{ id: string; email: string; displayName: string }> {
  const server = serverConfig.getServerById(serverId)
  if (!server) throw new Error('Server not found')

  const res = await fetch(`${server.url}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: server.email, password })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Login failed' }))
    throw new Error(err.error || 'Login failed')
  }

  const data: AuthResponse = await res.json()
  activeServerId = serverId
  activeServerUrl = server.url
  accessToken = data.accessToken
  currentUser = data.user
  serverConfig.setServerRefreshToken(serverId, data.refreshToken)
  return data.user
}

async function signupAndConnect(
  serverId: string,
  email: string,
  displayName: string,
  password: string
): Promise<{ id: string; email: string; displayName: string }> {
  const server = serverConfig.getServerById(serverId)
  if (!server) throw new Error('Server not found')

  const res = await fetch(`${server.url}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, displayName, password })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Signup failed' }))
    throw new Error(err.error || 'Signup failed')
  }

  const data: AuthResponse = await res.json()
  activeServerId = serverId
  activeServerUrl = server.url
  accessToken = data.accessToken
  currentUser = data.user
  serverConfig.setServerRefreshToken(serverId, data.refreshToken)
  return data.user
}

async function disconnect(): Promise<void> {
  if (activeServerId && activeServerUrl) {
    const refreshToken = serverConfig.getServerRefreshToken(activeServerId)
    if (refreshToken) {
      try {
        await fetch(`${activeServerUrl}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        })
      } catch {
        // ignore
      }
    }
  }
  activeServerId = null
  activeServerUrl = null
  accessToken = null
  currentUser = null
}

async function tryRestoreServer(serverId: string): Promise<boolean> {
  const server = serverConfig.getServerById(serverId)
  if (!server) return false

  const refreshToken = serverConfig.getServerRefreshToken(serverId)
  if (!refreshToken) return false

  activeServerId = serverId
  activeServerUrl = server.url

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    activeServerId = null
    activeServerUrl = null
    return false
  }

  // Fetch user info
  try {
    const res = await fetch(`${server.url}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    if (res.ok) {
      const data = await res.json()
      currentUser = data.user
    }
  } catch {
    // ignore
  }

  return true
}

function getActiveServerId(): string | null {
  return activeServerId
}

function getActiveServerUrl(): string | null {
  return activeServerUrl
}

function getAccessToken(): string | null {
  return accessToken
}

function getCurrentUser(): { id: string; email: string; displayName: string } | null {
  return currentUser
}

function isConnected(): boolean {
  return activeServerId !== null && accessToken !== null
}

export const apiClient = {
  request,
  connectToServer,
  signupAndConnect,
  disconnect,
  tryRestoreServer,
  getActiveServerId,
  getActiveServerUrl,
  getAccessToken,
  getCurrentUser,
  isConnected
}
