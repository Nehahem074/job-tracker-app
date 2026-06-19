import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function OAuthCallback() {
  const [params] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    if (!token) { navigate('/login'); return }

    // Fetch user info using the token
    api.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        login({ token, user: res.data })
        navigate('/')
      })
      .catch(() => navigate('/login'))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Signing you in...</p>
    </div>
  )
}