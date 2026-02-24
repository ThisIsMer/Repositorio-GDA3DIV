import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import api from '../services/api'

const STORAGE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'https://repositorio-backend-production.up.railway.app'

function avatarUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${STORAGE_URL}/storage/${path}`
}

export default function UserProfilePage() {
  const { id } = useParams()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    api.get(`/users/${id}/projects`)
      .then(r => setData(r.data))
      .catch(err => setError(err.response?.status === 404 ? 'Usuario no encontrado.' : 'Error al cargar el perfil.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center py-32 text-gray-400">Cargando perfil...</div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link to="/" className="text-blue-600 hover:underline text-sm">← Volver al inicio</Link>
      </div>
    </div>
  )

  const user     = data.user     ?? {}
  const projects = data.projects ?? (Array.isArray(data) ? data : [])
  const avatar   = avatarUrl(user.profile_picture)
  const initials = (user.name || user.email || '?').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">

        <Link to="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">← Volver al inicio</Link>

        {/* Cabecera del usuario */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 border-2 border-gray-200 shrink-0">
            {avatar ? (
              <img src={avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                {initials}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name || 'Usuario'}</h1>
            {user.bio && <p className="text-sm text-gray-500 mt-1">{user.bio}</p>}
            <p className="text-xs text-gray-400 mt-1">{projects.length} proyecto{projects.length !== 1 ? 's' : ''} publicado{projects.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Proyectos */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Proyectos</h2>

        {projects.length === 0 ? (
          <div className="text-center bg-white border border-gray-200 rounded-xl py-16 text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p>Este usuario no tiene proyectos publicados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(project => {
              const media = project.media ?? []
              const coverItem = media.find(m => m.type === 'image' || m.mime_type?.startsWith('image/'))
              const coverPath = coverItem?.file_path || coverItem?.path
              const cover = coverPath ? (coverPath.startsWith('http') ? coverPath : `${STORAGE_URL}/storage/${coverPath}`) : null

              return (
                <Link key={project.id} to={`/projects/${project.id}`}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden h-full flex flex-col">
                    <div className="h-40 overflow-hidden shrink-0">
                      {cover ? (
                        <img src={cover} alt={project.title} className="w-full h-full object-cover"
                          onError={e => { e.target.parentNode.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-slate-700 to-blue-800 flex items-center justify-center"><span class="text-white text-3xl">📁</span></div>' }} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-blue-800 flex items-center justify-center">
                          <span className="text-white text-3xl">📁</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full truncate max-w-[70%]">
                          {project.subject?.name}
                        </span>
                        {project.year && <span className="text-xs text-gray-400">{project.year}</span>}
                      </div>
                      <h3 className="font-semibold text-gray-900 mt-2 mb-1 line-clamp-2">{project.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 flex-1">{project.description}</p>
                      {project.tags?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {project.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}