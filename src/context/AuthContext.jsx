import { createContext, useState } from 'react'
import api from '../api/axios'

export const AuthContext = createContext(null)

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
  // (e.g. after account deletion), so there's no point calling /logout.
  function clearSession() {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch {
      // token may already be expired — clear locally regardless
    }
    clearSession()
  }

  return (
    <AuthContext.Provider value={{ token, user, updateUser, login, logout, clearSession }}>
      {children}
    </AuthContext.Provider>
  )
}
