import api, { unwrap } from './axios'

// List endpoint keeps its pagination meta, so it returns an explicit shape
// instead of the raw envelope.
export async function getEvents(params) {
  const res = await api.get('/events', { params })
  return { events: res.data.data ?? res.data, meta: res.data.meta }
}

export const getEvent = id => api.get(`/events/${id}`).then(unwrap)

export const createEvent = payload => api.post('/events', payload)

export const updateEvent = (id, payload) => api.put(`/events/${id}`, payload)

export const deleteEvent = id => api.delete(`/events/${id}`)

export const getParticipants = eventId =>
  api.get(`/events/${eventId}/participants`).then(res => unwrap(res) ?? [])

export const joinEvent = eventId => api.post(`/events/${eventId}/participants`)

export const leaveEvent = eventId => api.delete(`/events/${eventId}/participants`)
