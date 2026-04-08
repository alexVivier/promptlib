import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/authStore'
import { usePromptStore } from '../../stores/promptStore'
import type { ServerConfig, AdminUser } from '../../../../shared/types'

type View = 'list' | 'add' | 'edit' | 'connect' | 'signup' | 'admin'

export function ServerPanel({ onClose }: { onClose: () => void }) {
  const {
    servers, activeServerId, connectionStatus, user, error,
    loadServers, addServer, updateServer, removeServer,
    connectToServer, signupOnServer, disconnect
  } = useAuthStore()
  const { loadPrompts } = usePromptStore()
  const { t } = useTranslation()

  const [view, setView] = useState<View>('list')
  const [selectedServer, setSelectedServer] = useState<ServerConfig | null>(null)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [adminLoading, setAdminLoading] = useState(false)

  useEffect(() => { loadServers() }, [loadServers])

  const isConnected = connectionStatus === 'connected'
  const isAdmin = user?.role === 'admin'

  const loadAdminUsers = async () => {
    setAdminLoading(true)
    try {
      const users = await window.api.adminGetUsers()
      setAdminUsers(users)
    } catch {
      // not admin or not connected
    } finally {
      setAdminLoading(false)
    }
  }

  const toggleUserActive = async (userId: string, currentlyActive: boolean) => {
    try {
      if (currentlyActive) {
        await window.api.adminDeactivateUser(userId)
      } else {
        await window.api.adminActivateUser(userId)
      }
      await loadAdminUsers()
    } catch {
      // ignore
    }
  }

  const resetForm = () => {
    setName(''); setUrl(''); setEmail(''); setDisplayName(''); setPassword('')
    setLocalError(null); setSelectedServer(null)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const server = await addServer(name, url, email)
    resetForm()
    setSelectedServer(server)
    setView('connect')
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedServer) return
    await updateServer(selectedServer.id, { name, url, email })
    resetForm()
    setView('list')
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedServer) return
    setLocalError(null)
    setLoading(true)
    try {
      await connectToServer(selectedServer.id, password)
      await loadPrompts()
      setPassword('')
      onClose()
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedServer) return
    setLocalError(null)
    setLoading(true)
    try {
      await signupOnServer(selectedServer.id, email, displayName, password)
      await loadPrompts()
      setPassword('')
      setDisplayName('')
      onClose()
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    await disconnect()
    await loadPrompts()
    onClose()
  }

  const openEdit = (srv: ServerConfig) => {
    setSelectedServer(srv)
    setName(srv.name); setUrl(srv.url); setEmail(srv.email)
    setView('edit')
  }

  const openConnect = (srv: ServerConfig) => {
    setSelectedServer(srv)
    setPassword('')
    setLocalError(null)
    setView('connect')
  }

  const inputClass = 'w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1'
  const btnPrimary = 'w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors'
  const btnSecondary = 'w-full py-2 px-4 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-sm transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl w-full max-w-md p-6 relative max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-lg">&times;</button>

        {/* LIST VIEW */}
        {view === 'list' && (
          <>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
              {t('servers') || 'Servers'}
            </h2>

            {isConnected && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-zinc-700 dark:text-zinc-200">
                    {user?.displayName} - {servers.find((s) => s.id === activeServerId)?.name}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => { loadAdminUsers(); setView('admin') }}
                      className="ml-auto text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600"
                    >
                      {t('admin')}
                    </button>
                  )}
                  <button onClick={handleDisconnect} className={`${isAdmin ? '' : 'ml-auto '}text-xs text-red-500 hover:text-red-600`}>
                    {t('disconnect') || 'Disconnect'}
                  </button>
                </div>
              </div>
            )}

            {servers.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-6">
                {t('noServers') || 'No servers configured. Add one to collaborate.'}
              </p>
            ) : (
              <div className="space-y-2 mb-4">
                {servers.map((srv) => (
                  <div key={srv.id} className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">{srv.name}</p>
                      <p className="text-xs text-zinc-400 truncate">{srv.url}</p>
                      <p className="text-xs text-zinc-400 truncate">{srv.email}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {activeServerId === srv.id && isConnected ? (
                        <>
                          {isAdmin && (
                            <button onClick={() => { loadAdminUsers(); setView('admin') }} className="px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">
                              {t('admin')}
                            </button>
                          )}
                          <button onClick={handleDisconnect} className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">
                            {t('disconnect')}
                          </button>
                        </>
                      ) : activeServerId !== srv.id ? (
                        <button onClick={() => openConnect(srv)} className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                          {t('connect')}
                        </button>
                      ) : null}
                      <button onClick={() => openEdit(srv)} className="px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">
                        {t('edit')}
                      </button>
                      {activeServerId !== srv.id && (
                        <button onClick={() => removeServer(srv.id)} className="px-2 py-1 text-xs text-red-500 hover:text-red-600">
                          &times;
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => { resetForm(); setView('add') }} className={btnPrimary}>
              + {t('addServer') || 'Add Server'}
            </button>
          </>
        )}

        {/* ADD VIEW */}
        {view === 'add' && (
          <>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
              {t('addServer') || 'Add Server'}
            </h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className={labelClass}>{t('serverName') || 'Name'}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Team Server" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>URL</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="http://192.168.1.100:3001" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
              </div>
              <button type="submit" className={btnPrimary}>{t('save') || 'Save'}</button>
              <button type="button" onClick={() => { resetForm(); setView('list') }} className={btnSecondary}>{t('cancel') || 'Cancel'}</button>
            </form>
          </>
        )}

        {/* EDIT VIEW */}
        {view === 'edit' && selectedServer && (
          <>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
              {t('editServer') || 'Edit Server'}
            </h2>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className={labelClass}>{t('serverName') || 'Name'}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>URL</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
              </div>
              <button type="submit" className={btnPrimary}>{t('save') || 'Save'}</button>
              <button type="button" onClick={() => { resetForm(); setView('list') }} className={btnSecondary}>{t('cancel') || 'Cancel'}</button>
            </form>
          </>
        )}

        {/* CONNECT VIEW */}
        {view === 'connect' && selectedServer && (
          <>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
              {selectedServer.name}
            </h2>
            <p className="text-xs text-zinc-400 mb-4">{selectedServer.url} - {selectedServer.email}</p>
            <form onSubmit={handleConnect} className="space-y-3">
              <div>
                <label className={labelClass}>{t('password') || 'Password'}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required minLength={6} />
              </div>
              {(localError || error) && <p className="text-red-500 text-xs">{localError || error}</p>}
              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? '...' : (t('connect') || 'Connect')}
              </button>
              <button type="button" onClick={() => { resetForm(); setLocalError(null); setView('signup'); setSelectedServer(selectedServer) }} className="w-full text-xs text-blue-500 hover:text-blue-600 py-1">
                {t('noAccount') || "No account? Sign up"}
              </button>
              <button type="button" onClick={() => { resetForm(); setView('list') }} className={btnSecondary}>{t('back') || 'Back'}</button>
            </form>
          </>
        )}

        {/* SIGNUP VIEW */}
        {view === 'signup' && selectedServer && (
          <>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
              {t('signup') || 'Sign up'} - {selectedServer.name}
            </h2>
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>{t('displayName') || 'Display Name'}</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>{t('password') || 'Password'}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required minLength={6} />
              </div>
              {(localError || error) && <p className="text-red-500 text-xs">{localError || error}</p>}
              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? '...' : (t('signupAndConnect') || 'Sign up & Connect')}
              </button>
              <button type="button" onClick={() => { resetForm(); setLocalError(null); setView('connect'); setSelectedServer(selectedServer) }} className="w-full text-xs text-blue-500 hover:text-blue-600 py-1">
                {t('hasAccount') || 'Already have an account?'}
              </button>
              <button type="button" onClick={() => { resetForm(); setView('list') }} className={btnSecondary}>{t('back') || 'Back'}</button>
            </form>
          </>
        )}

        {/* ADMIN VIEW */}
        {view === 'admin' && (
          <>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
              {t('userManagement')}
            </h2>

            {adminLoading ? (
              <p className="text-sm text-zinc-400 text-center py-4">...</p>
            ) : adminUsers.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-4">{t('noUsers')}</p>
            ) : (
              <div className="space-y-2 mb-4">
                {adminUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">{u.displayName}</p>
                        {u.role === 'admin' && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                            {t('admin')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs text-zinc-400">
                        {u.isActive ? t('active') : t('inactive')}
                      </span>
                      {u.id !== user?.id && (
                        <button
                          onClick={() => toggleUserActive(u.id, u.isActive)}
                          className={`px-2 py-1 text-xs rounded ${
                            u.isActive
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-900/50'
                          }`}
                        >
                          {u.isActive ? t('deactivate') : t('activate')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button type="button" onClick={() => setView('list')} className={btnSecondary}>{t('back') || 'Back'}</button>
          </>
        )}
      </div>
    </div>
  )
}
