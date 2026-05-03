import client from './client'

export const applyLoan = (payload) =>
  client.post('/api/loan/apply', payload)


export const getLoanApplications = (userId) =>
  client.get(`/api/loan/applications/${userId}`)
