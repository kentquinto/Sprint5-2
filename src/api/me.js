import api, { unwrap } from './axios'

export const getMe = () => api.get('/me').then(unwrap)

export const updateProfile = payload => api.put('/me', payload).then(unwrap)

export const changePassword = payload => api.put('/me/password', payload)

export const deleteAccount = password => api.delete('/me', { data: { password } })

export const getOrganizedEvents = () => api.get('/me/organized-events').then(unwrap)

export const getJoinedEvents = () => api.get('/me/joined-events').then(unwrap)
