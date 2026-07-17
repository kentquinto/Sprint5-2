import { useState, useEffect, useRef } from 'react'
import { logout as apiLogout } from '../api/auth'
import { getMe } from '../api/me'
import { setOnUnauthorized } from '../api/axios'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      localStorage.removeItem('user')
      return null
    }
  })

  function login(newToken, newUser) {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  function updateUser(data) {
    setUser(prev => {
      const updated = { ...prev, ...data }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }

  // Local-only clear — used when the token is already invalid server-side
  // (e.g. after account deletion or a 401), so there's no point calling /logout.
  function clearSession() {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function logout() {
    try {
      await apiLogout()
    } catch {
      // token may already be expired — clear locally regardless
    }
    clearSession()
  }

  // Any 401 from the API means the session is dead — clear it. Registered
  // every render so the interceptor always calls the latest closure.
  useEffect(() => {
    setOnUnauthorized(clearSession)
  })

  // Validate the cached session once on app load. localStorage may hold an
  // expired token — without this the UI greets a ghost user until the first
  // API call fails. A 401 here is handled by the interceptor above; other
  // errors (network down) keep the cached user rather than logging out.
  const validated = useRef(false)
  useEffect(() => {
    if (validated.current || !token) return
    validated.current = true
    getMe().then(updateUser).catch(() => {})
  }, [token])

  return (
    <AuthContext.Provider value={{ token, user, updateUser, login, logout, clearSession }}>
      {children}
    </AuthContext.Provider>
  )
}
