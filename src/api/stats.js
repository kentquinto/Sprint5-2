import api, { unwrap } from './axios'

export const getPlayerStats = () => api.get('/stats/players').then(unwrap)

export const getGameStats = () => api.get('/stats/games').then(unwrap)

export const getOrganizerStats = () => api.get('/stats/organizers').then(unwrap)
