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

export default function RegisterPage() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  // ── STATE ──
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'player' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  usePageTitle('Register')

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
      const { token, user } = await authApi.register(form)
      login(token, user)
      navigate('/')
    } catch (err) {
      const { fieldErrors: fields, message } = getFormErrors(err, 'Registration failed.')
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
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Create Account</h1>
        </div>

        <Card className="p-8">
          <p className="text-sm text-ink-soft mb-6">Join TCG Manager and start competing</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Name" name="name" value={form.name}
              onChange={handleChange} required placeholder="Your name" errors={fieldErrors} />
            <Field label="Email" name="email" type="email" value={form.email}
              onChange={handleChange} required placeholder="you@example.com" errors={fieldErrors} />
            <Field label="Password" name="password" type="password" value={form.password}
              onChange={handleChange} required placeholder="••••••••" errors={fieldErrors} />
            <Field label="Confirm Password" name="password_confirmation" type="password" value={form.password_confirmation}
              onChange={handleChange} required placeholder="••••••••" errors={fieldErrors} />
            <Field label="Account Type" name="role" as="select" value={form.role}
              onChange={handleChange} errors={fieldErrors}>
              <option value="player">Player</option>
              <option value="organizer">Organizer</option>
            </Field>
            <Button type="submit" disabled={loading} className="w-full py-2.5">
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-ink-soft mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </Card>
      </div>
    </SkyPage>
  )
}
