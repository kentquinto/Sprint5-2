import { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { AuthContext } from '../context/AuthContext'
import { inputCls, labelCls } from '../utils/formStyles'
import SkyPage from '../components/SkyPage'

export default function RegisterPage() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  // ── STATE ──
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({}) // keyed by field name, plus `general` for non-field errors
  const [loading, setLoading] = useState(false)

  useEffect(() => { document.title = 'Register — TCG Manager' }, [])

  // ── HANDLERS ──
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const res = await api.post('/register', form)
      const token = res.data.token
      const meRes = await api.get('/me', { headers: { Authorization: `Bearer ${token}` } })
      login(token, meRes.data.data ?? meRes.data)
      navigate('/')
    } catch (err) {
      // 422 = Laravel validation error, one message array per field
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {})
      } else {
        setErrors({ general: err.response?.data?.message ?? 'Registration failed.' })
      }
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
          <p className="text-sm text-[#334155] mb-6">Join TCG Manager and start competing</p>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Name</label>
              <input type="text" name="name" value={form.name}
                onChange={handleChange} required placeholder="Your name" className={inputCls} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" name="email" value={form.email}
                onChange={handleChange} required placeholder="you@example.com" className={inputCls} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input type="password" name="password" value={form.password}
                onChange={handleChange} required placeholder="••••••••" className={inputCls} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
            </div>
            <div>
              <label className={labelCls}>Confirm Password</label>
              <input type="password" name="password_confirmation" value={form.password_confirmation}
                onChange={handleChange} required placeholder="••••••••" className={inputCls} />
              {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation[0]}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-50 text-white font-bold py-2.5 rounded-full text-sm transition-colors cursor-pointer shadow-sm">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#334155] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2563EB] hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </SkyPage>
  )
}
