import api, { unwrap } from './axios'

export const getPlayer = id => api.get(`/players/${id}`).then(unwrap)
