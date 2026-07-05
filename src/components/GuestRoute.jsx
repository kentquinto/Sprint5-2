import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function GuestRoute({ children }) {
  const { token } = useContext(AuthContext)
  return token ? <Navigate to="/" replace /> : children
}
