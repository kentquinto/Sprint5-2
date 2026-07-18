import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
})

// The API wraps single resources in a { data: ... } envelope (Laravel API
// Resources). Services use this so pages never deal with envelope shapes.
export const unwrap = res => res.data.data ?? res.data

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// The auth layer owns session state, so the interceptor doesn't touch
// localStorage or navigate itself — it notifies whoever registered.
// AuthProvider registers clearSession; ProtectedRoute then handles the
// redirect through the router, and public pages just drop to logged-out.
let onUnauthorized = null
export const setOnUnauthorized = handler => { onUnauthorized = handler }

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) onUnauthorized?.()
    return Promise.reject(err)
  }
)

export default api
