import { useCallback } from 'react'
import { getChatSession, sendMessage } from '../api/chat'
import { useChatStore } from '../store/chatStore'
import { useUIStore } from '../store/uiStore'
import { useUserStore } from '../store/userStore'

export default function useChat() {
  const userId = useUserStore((s) => s.userId)
  const sessionId = useChatStore((s) => s.sessionId)
  const messages = useChatStore((s) => s.messages)
  const selectedHospital = useChatStore((s) => s.selectedHospital)
  const isLoading = useChatStore((s) => s.isLoading)
  const setSessionId = useChatStore((s) => s.setSessionId)
  const setMessages = useChatStore((s) => s.setMessages)
  const addMessage = useChatStore((s) => s.addMessage)
  const setLoading = useChatStore((s) => s.setLoading)
  const setSelectedHospital = useChatStore((s) => s.setSelectedHospital)
  const clearChat = useChatStore((s) => s.clearChat)
  const toast = useUIStore((s) => s.toast)

  const submitMessage = useCallback(async (message, location = null, hospitalId = null) => {
    const trimmed = message.trim()
    if (!trimmed || isLoading) return null

    addMessage({ role: 'user', content: trimmed })
    setLoading(true)

    try {
      const data = await sendMessage({
        message: trimmed,
        user_id: userId,
        session_id: sessionId,
        selected_hospital: hospitalId || selectedHospital?.hospital_id || null,
        user_lat: location?.lat,
        user_lon: location?.lon,
      })

      if (data.session_id) setSessionId(data.session_id)
      addMessage({
        role: 'ai',
        content: data.response?.explanation || data.response?.question || 'I found a result for you.',
        data: data.response,
      })
      return data.response
    } catch (err) {
      toast(err.message || 'Could not send message', 'error')
      addMessage({
        role: 'ai',
        content: 'I could not process that request. Please try again in a moment.',
        data: { type: 'error' },
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addMessage, isLoading, selectedHospital, sessionId, setLoading, setSessionId, toast, userId])

  const loadSession = useCallback(async (nextSessionId) => {
    if (!userId || !nextSessionId) return null

    try {
      const data = await getChatSession(userId, nextSessionId)
      const history = data.session?.conversation_history || []
      const restored = history.flatMap((turn, index) => {
        const pair = []
        if (turn.user) {
          pair.push({
            id: `${nextSessionId}-u-${index}`,
            role: 'user',
            content: turn.user,
            timestamp: new Date(),
          })
        }
        if (turn.assistant) {
          pair.push({
            id: `${nextSessionId}-a-${index}`,
            role: 'ai',
            content: turn.assistant,
            data: { type: turn.type || 'recommendation' },
            timestamp: new Date(),
          })
        }
        return pair
      })

      setSessionId(nextSessionId)
      setSelectedHospital(null)
      setMessages(restored)
      return data.session
    } catch (err) {
      toast(err.message || 'Could not load chat', 'error')
      throw err
    }
  }, [setMessages, setSelectedHospital, setSessionId, toast, userId])

  return {
    messages,
    sessionId,
    selectedHospital,
    isLoading,
    submitMessage,
    loadSession,
    setSelectedHospital,
    clearChat,
  }
}
