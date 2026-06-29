import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { AuthContext } from '../context/AuthContext'

export default function RegisterPage() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

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
      const meRes = await api.get('/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      login(token, meRes.data.data ?? meRes.data)
      navigate('/events')
    } catch (err) {
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow border border-gray-200 w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create an account</h1>
        <p className="text-gray-500 text-sm mb-6">Join TCG Manager and start competing</p>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3 mb-5">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your name"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation[0]}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded text-sm transition-colors cursor-pointer"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
