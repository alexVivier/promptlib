import { app, safeStorage } from 'electron'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

export interface ServerConfig {
  id: string
  name: string
  url: string
  email: string
}

/** What we persist to disk (refresh token encrypted) */
interface PersistedServer {
  id: string
  name: string
  url: string
  email: string
  encryptedRefreshToken: string | null
}

const SERVERS_PATH = join(app.getPath('userData'), 'servers.json')

function readAll(): PersistedServer[] {
  if (!existsSync(SERVERS_PATH)) return []
  try {
    return JSON.parse(readFileSync(SERVERS_PATH, 'utf-8'))
  } catch {
    return []
  }
}

function writeAll(servers: PersistedServer[]): void {
  writeFileSync(SERVERS_PATH, JSON.stringify(servers, null, 2), 'utf-8')
}

export function getServers(): ServerConfig[] {
  return readAll().map(({ id, name, url, email }) => ({ id, name, url, email }))
}

export function addServer(name: string, url: string, email: string): ServerConfig {
  const servers = readAll()
  const server: PersistedServer = {
    id: randomUUID(),
    name,
    url: url.replace(/\/+$/, ''),
    email,
    encryptedRefreshToken: null
  }
  servers.push(server)
  writeAll(servers)
  return { id: server.id, name: server.name, url: server.url, email: server.email }
}

export function updateServer(id: string, data: { name?: string; url?: string; email?: string }): ServerConfig | null {
  const servers = readAll()
  const idx = servers.findIndex((s) => s.id === id)
  if (idx === -1) return null

  if (data.name !== undefined) servers[idx].name = data.name
  if (data.url !== undefined) servers[idx].url = data.url.replace(/\/+$/, '')
  if (data.email !== undefined) {
    servers[idx].email = data.email
    servers[idx].encryptedRefreshToken = null // clear token when email changes
  }

  writeAll(servers)
  const s = servers[idx]
  return { id: s.id, name: s.name, url: s.url, email: s.email }
}

export function removeServer(id: string): void {
  const servers = readAll().filter((s) => s.id !== id)
  writeAll(servers)
}

export function getServerRefreshToken(id: string): string | null {
  const server = readAll().find((s) => s.id === id)
  if (!server?.encryptedRefreshToken) return null

  try {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(Buffer.from(server.encryptedRefreshToken, 'base64'))
    }
    return server.encryptedRefreshToken
  } catch {
    return null
  }
}

export function setServerRefreshToken(id: string, refreshToken: string | null): void {
  const servers = readAll()
  const server = servers.find((s) => s.id === id)
  if (!server) return

  if (refreshToken === null) {
    server.encryptedRefreshToken = null
  } else if (safeStorage.isEncryptionAvailable()) {
    server.encryptedRefreshToken = safeStorage.encryptString(refreshToken).toString('base64')
  } else {
    server.encryptedRefreshToken = refreshToken
  }

  writeAll(servers)
}

export function getServerById(id: string): PersistedServer | null {
  return readAll().find((s) => s.id === id) ?? null
}
