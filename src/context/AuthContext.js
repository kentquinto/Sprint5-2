import { createContext } from 'react'

// Context object only — the provider lives in AuthProvider.jsx. Keeping them
// in separate files lets Vite Fast Refresh work (component-only exports).
export const AuthContext = createContext(null)
