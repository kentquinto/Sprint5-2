import api, { unwrap } from './axios'

export const getGames = () => api.get('/games').then(unwrap)
