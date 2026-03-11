import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/layout/Navbar'

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/forgot-password', { email })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar el correo. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow border border-gray-200">

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Recuperar contraseña</h2>
        <p className="text-sm text-gray-500 mb-6">
          Introduce tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {success ? (
          <div className="space-y-4">
            <div className="text-5xl text-center">📬</div>
            <p className="bg-green-50 border border-green-200 text-green-700 p-3 rounded text-sm">
              Si existe una cuenta con ese correo, recibirás un enlace en breve. Revisa también tu carpeta de spam.
            </p>
            <p className="text-sm text-gray-500 text-center">
              <Link to="/login" className="text-blue-600 hover:underline">← Volver al inicio de sesión</Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="tucorreo@ejemplo.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>

            <p className="text-sm text-gray-500 mt-4 text-center">
              ¿Recuerdas tu contraseña?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">Inicia sesión</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}