import { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { AuthContext } from '../context/AuthContext'
import { inputCls, labelCls } from '../utils/formStyles'
import SkyPage from '../components/SkyPage'

export default function LoginPage() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  // ── STATE ──
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { document.title = 'Login — TCG Manager' }, [])

  // ── HANDLERS ──
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // logs in, then fetches the user profile to populate AuthContext before redirecting home
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/login', form)
      const token = res.data.token
      const meRes = await api.get('/me', { headers: { Authorization: `Bearer ${token}` } })
      login(token, meRes.data.data ?? meRes.data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Login failed. Check your credentials.')
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
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Welcome Back</h1>
        </div>

        <div className="bg-white/85 backdrop-blur-sm border border-white/60 rounded-2xl p-8 shadow-sm">
          <p className="text-sm text-[#334155] mb-6">Sign in to your TCG Manager account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" name="email" value={form.email}
                onChange={handleChange} required placeholder="you@example.com"
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input type="password" name="password" value={form.password}
                onChange={handleChange} required placeholder="••••••••"
                className={inputCls} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-50 text-white font-bold py-2.5 rounded-full text-sm transition-colors cursor-pointer shadow-sm">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-[#334155] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#2563EB] hover:underline font-medium">Register</Link>
          </p>
        </div>
      </div>
    </SkyPage>
  )
}
