import api, { unwrap } from './axios'

// Fetch the profile with an explicit token — used right after login/register,
// before the token has been stored (so the request interceptor can't attach it).
async function fetchMe(token) {
  const res = await api.get('/me', { headers: { Authorization: `Bearer ${token}` } })
  return unwrap(res)
}

export async function login(credentials) {
  const res = await api.post('/login', credentials)
  const token = res.data.token
  const user = await fetchMe(token)
  return { token, user }
}

export async function register(payload) {
  const res = await api.post('/register', payload)
  const token = res.data.token
  const user = await fetchMe(token)
  return { token, user }
}

export function logout() {
  return api.post('/logout')
}
