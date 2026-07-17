import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as authApi from '../api/auth'
import { getFormErrors } from '../api/errors'
import { AuthContext } from '../context/AuthContext'
import FieldError from '../components/ui/FieldError'
import { inputCls, labelCls } from '../utils/formStyles'
import SkyPage from '../components/SkyPage'
import Button from '../components/ui/Button'
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
      <div className="relative w-full max-w-md" style={{ animation: 'fadeInUp 0.35s ease-out both' }}>
        <div className="text-center mb-6">
          <p className="font-cinzel text-xs font-bold uppercase tracking-widest text-white/70 mb-1" style={{ letterSpacing: '0.2em' }}>
            TCG Manager
          </p>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Create Account</h1>
        </div>

        <div className="bg-white/85 backdrop-blur-sm border border-white/60 rounded-2xl p-8 shadow-sm">
          <p className="text-sm text-ink-soft mb-6">Join TCG Manager and start competing</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Name</label>
              <input type="text" name="name" value={form.name}
                onChange={handleChange} required placeholder="Your name" className={inputCls} />
              <FieldError errors={fieldErrors} name="name" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" name="email" value={form.email}
                onChange={handleChange} required placeholder="you@example.com" className={inputCls} />
              <FieldError errors={fieldErrors} name="email" />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input type="password" name="password" value={form.password}
                onChange={handleChange} required placeholder="••••••••" className={inputCls} />
              <FieldError errors={fieldErrors} name="password" />
            </div>
            <div>
              <label className={labelCls}>Confirm Password</label>
              <input type="password" name="password_confirmation" value={form.password_confirmation}
                onChange={handleChange} required placeholder="••••••••" className={inputCls} />
              <FieldError errors={fieldErrors} name="password_confirmation" />
            </div>
            <div>
              <label className={labelCls}>Account Type</label>
              <select name="role" value={form.role} onChange={handleChange} className={inputCls}>
                <option value="player">Player</option>
                <option value="organizer">Organizer</option>
              </select>
              <FieldError errors={fieldErrors} name="role" />
            </div>
            <Button type="submit" disabled={loading} className="w-full py-2.5">
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-ink-soft mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </SkyPage>
  )
}
