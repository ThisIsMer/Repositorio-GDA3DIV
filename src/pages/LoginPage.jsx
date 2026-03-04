import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Navbar from '../components/layout/Navbar'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/login', { email, password })
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__inner">
          <Navbar />
          <div className="hero__content">
            <h1 className="hero__title">Iniciar Sesión</h1>
            <p className="hero__subtitle">Accede a tu cuenta para gestionar tus proyectos</p>
          </div>
        </div>
      </header>

      <main className="authWrap">
        <div className="authCard">

          {error && <div className="authCard__error">{error}</div>}

          <form onSubmit={handleSubmit} className="authCard__fields">
            <div>
              <label className="authCard__label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="authCard__input"
                required
              />
            </div>

            <div>
              <label className="authCard__label">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="authCard__input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn--primary authCard__submit"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="authCard__footer">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="authCard__footerLink">Regístrate</Link>
          </p>

        </div>
      </main>
    </div>
  )
}