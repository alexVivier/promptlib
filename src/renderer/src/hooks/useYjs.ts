import { useEffect, useRef, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { useAuthStore } from '../stores/authStore'

// Deterministic color from user ID
function userColor(id: string): string {
  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
    '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd',
    '#01a3a4', '#f368e0', '#ff6348', '#7bed9f'
  ]
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0
  }
  return colors[Math.abs(hash) % colors.length]
}

interface UseYjsResult {
  ytext: Y.Text | null
  provider: WebsocketProvider | null
  connected: boolean
  synced: boolean
}

export function useYjs(promptId: string | null): UseYjsResult {
  const [connected, setConnected] = useState(false)
  const [synced, setSynced] = useState(false)
  const [ytext, setYtext] = useState<Y.Text | null>(null)
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)
  const user = useAuthStore((s) => s.user)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!promptId || !user) {
      setYtext(null)
      setProvider(null)
      setConnected(false)
      setSynced(false)
      return
    }

    let cancelled = false

    const setup = async () => {
      const token = await window.api.getAuthToken()
      const serverUrl = await window.api.getServerUrl()

      if (cancelled || !serverUrl) return

      // Convert http(s) to ws(s) and add /yjs path
      const wsUrl = serverUrl.replace(/^http/, 'ws') + '/yjs'

      const doc = new Y.Doc()
      const text = doc.getText('content')

      const wsProvider = new WebsocketProvider(
        wsUrl,
        promptId,
        doc,
        {
          params: { token: token || '' },
          connect: true
        }
      )

      wsProvider.on('status', (event: { status: string }) => {
        if (cancelled) return
        setConnected(event.status === 'connected')
      })

      wsProvider.on('sync', (isSynced: boolean) => {
        if (cancelled) return
        setSynced(isSynced)
      })

      // Set awareness user info
      const color = userColor(user.id)
      wsProvider.awareness.setLocalStateField('user', {
        name: user.displayName,
        color,
        colorLight: color + '33'
      })

      setYtext(text)
      setProvider(wsProvider)

      cleanupRef.current = () => {
        wsProvider.disconnect()
        wsProvider.destroy()
        doc.destroy()
      }
    }

    setup()

    return () => {
      cancelled = true
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
      setYtext(null)
      setProvider(null)
      setConnected(false)
      setSynced(false)
    }
  }, [promptId, user])

  return { ytext, provider, connected, synced }
}
