import client from './client'

export const sendMessage = (payload) =>
  client.post('/api/chat', payload)

export const getChatHistory = (userId) =>
  client.get(`/api/chat/history/${userId}`)

export const getChatSession = (userId, sessionId) =>
  client.get(`/api/chat/session/${userId}/${sessionId}`)
