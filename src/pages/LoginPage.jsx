import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as authApi from '../api/auth'
import { getFormErrors } from '../api/errors'
import { AuthContext } from '../context/AuthContext'
import SkyPage from '../components/SkyPage'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import usePageTitle from '../hooks/usePageTitle'

export default function LoginPage() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  // ── STATE ──
  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  usePageTitle('Login')

  // ── HANDLERS ──
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFieldErrors({})
    setError('')
    setLoading(true)
    try {
      const { token, user } = await authApi.login(form)
      login(token, user)
      navigate('/')
    } catch (err) {
      const { fieldErrors: fields, message } = getFormErrors(err, 'Login failed. Check your credentials.')
      setFieldErrors(fields)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SkyPage>
      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-6">
          <p className="font-cinzel text-xs font-bold uppercase tracking-widest text-white/70 mb-1" style={{ letterSpacing: '0.2em' }}>
            TCG Manager
          </p>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Welcome Back</h1>
        </div>

        <Card className="p-8">
          <p className="text-sm text-ink-soft mb-6">Sign in to your TCG Manager account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email" name="email" type="email" value={form.email}
              onChange={handleChange} required placeholder="you@example.com" errors={fieldErrors} />
            <Field label="Password" name="password" type="password" value={form.password}
              onChange={handleChange} required placeholder="••••••••" errors={fieldErrors} />
            <Button type="submit" disabled={loading} className="w-full py-2.5">
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-sm text-ink-soft mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">Register</Link>
          </p>
        </Card>
      </div>
    </SkyPage>
  )
}
