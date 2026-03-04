import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', password_confirmation: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password_confirmation) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    try {
      const res = await api.post('/register', form)
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      const errors = err.response?.data?.errors
      setError(errors ? Object.values(errors).flat().join(' ') : (err.response?.data?.message || 'Error al registrarse'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">

      <Navbar />

      <header className="hero">
        <div className="hero__inner">
          <div className="hero__content">
            <h1 className="hero__title">Crear Cuenta</h1>
            <p className="hero__subtitle">Únete y comparte tus proyectos con la comunidad</p>
          </div>
        </div>
      </header>

      <main className="authWrap">
        <div className="authCard">
          {error && <div className="authCard__error">{error}</div>}
          <form onSubmit={handleSubmit} className="authCard__fields">
            <div>
              <label className="authCard__label">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" className="authCard__input" required />
            </div>
            <div>
              <label className="authCard__label">Contraseña</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" className="authCard__input" required />
              <p className="authCard__hint">Mínimo 8 caracteres, mayúscula, minúscula y número</p>
            </div>
            <div>
              <label className="authCard__label">Confirmar Contraseña</label>
              <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange} placeholder="••••••••" className="authCard__input" required />
            </div>
            <button type="submit" disabled={loading} className="btn btn--primary authCard__submit">
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>
          <p className="authCard__footer">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="authCard__footerLink">Inicia sesión</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}