import { Clock, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import ChatInput from './ChatInput'
import MessageList from './MessageList'
import useChat from '../../hooks/useChat'
import useGeolocation from '../../hooks/useGeolocation'
import useProfile from '../../hooks/useProfile'
import { getChatHistory } from '../../api/chat'
import { useUIStore } from '../../store/uiStore'
import { useUserStore } from '../../store/userStore'

export default function Chat() {
  const {
    messages,
    isLoading,
    selectedHospital,
    submitMessage,
    loadSession,
    setSelectedHospital,
    clearChat,
  } = useChat()
  const userId = useUserStore((s) => s.userId)
  const { position, loading: locating, requestLocation } = useGeolocation()
  const { profile } = useProfile({ autoLoad: !messages.length })
  const providerMode = useUIStore((s) => s.providerMode)
  const toast = useUIStore((s) => s.toast)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  async function refreshHistory() {
    if (!userId) return
    setHistoryLoading(true)
    try {
      const data = await getChatHistory(userId)
      setHistory(Array.isArray(data.sessions) ? data.sessions : [])
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    refreshHistory()
  }, [userId])

  async function handleSend(message) {
    await submitMessage(message, position)
    refreshHistory()
  }

  async function handleRequestLocation() {
    const loc = await requestLocation()
    if (loc) toast('Location enabled for distance estimates', 'success')
  }

  function handleSelectHospital(hospital) {
    setSelectedHospital(hospital)
    toast(`${hospital.hospital_name} selected`, 'success')
  }

  async function handleLoadSession(sessionId) {
    await loadSession(sessionId)
    toast('Chat loaded', 'success')
  }

  return (
    <div className="app-content" style={{
      maxWidth: 1120,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - var(--topbar-height))',
      paddingBottom: 0,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 16,
      }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 6 }}>
            Care navigation{profile?.name ? ` for ${profile.name.split(' ')[0]}` : ''}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Hospital discovery, cost clarity, emergency support, and PFL financing in one guided chat.
          </p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={clearChat} disabled={isLoading}>
          <RotateCcw size={14} /> New chat
        </button>
      </div>

      <div className="card" style={{
        padding: 12,
        marginBottom: 12,
        display: 'grid',
        gap: 10,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 'var(--text-sm)' }}>
            <Clock size={15} color="var(--teal-600)" /> Recent chats
          </div>
          <button className="btn btn-ghost btn-sm" onClick={refreshHistory} disabled={historyLoading}>
            Refresh
          </button>
        </div>
        {history.length > 0 ? (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {history.map((item) => (
              <button
                key={item.session_id}
                className="btn btn-outline btn-sm"
                onClick={() => handleLoadSession(item.session_id)}
                disabled={isLoading}
                title={item.title}
                style={{ flexShrink: 0, maxWidth: 220, justifyContent: 'flex-start' }}
              >
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {item.title || 'Saved chat'}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
            {historyLoading ? 'Loading recent chats...' : 'No saved chats yet.'}
          </div>
        )}
      </div>

      <div className="card" style={{
        flex: 1,
        minHeight: 560,
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <MessageList
          messages={messages}
          loading={isLoading}
          providerMode={providerMode}
          profile={profile}
          selectedHospital={selectedHospital}
          onSelectHospital={handleSelectHospital}
        />
        <ChatInput
          onSend={handleSend}
          disabled={isLoading}
          location={position}
          locating={locating}
          onRequestLocation={handleRequestLocation}
        />
      </div>
    </div>
  )
}
