import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import api from '../services/api'

const STORAGE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'https://repositorio-backend-production.up.railway.app'

function coverImageUrl(project) {
  const media = project.media ?? []
  const img = media.find(m => {
    if (m.type === 'image' || m.mime_type?.startsWith('image/')) return true
    const ext = (m.file_path || m.path || m.filename || '').split('.').pop().toLowerCase()
    return ['jpg','jpeg','png','gif','webp'].includes(ext)
  })
  if (!img) return null
  const path = img.file_path || img.path || img.filename
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${STORAGE_URL}/storage/${path}`
}

export default function HomePage() {
  const [projects, setProjects] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')

  useEffect(() => {
    api.get('/subjects').then(r => setSubjects(r.data))
    fetchProjects()
  }, [])

  const fetchProjects = async (params = {}) => {
    setLoading(true)
    try {
      const res = await api.get('/projects', { params })
      setProjects(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProjects({
      search: search || undefined,
      subject_id: selectedSubject || undefined,
    })
  }

 return (
  <div className="page">
    <header className="hero">
      <div className="hero__inner">
        <Navbar />

        <div className="hero__content">
          <h1 className="hero__title">Repositorio de Proyectos</h1>
          <p className="hero__subtitle">Explora los proyectos académicos de los estudiantes</p>

          <form onSubmit={handleSearch} className="hero__form">
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="field"
            />

            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="field"
            >
              <option value="">Todas las asignaturas</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <button type="submit" className="btn btn--primary">
              Buscar
            </button>
          </form>
        </div>
      </div>
    </header>

    <main className="content">
      {loading ? (
        <div className="empty">Cargando proyectos...</div>
      ) : projects.length === 0 ? (
        <div className="empty">No se encontraron proyectos</div>
      ) : (
        <div className="grid">
          {projects.map(project => {
            const cover = coverImageUrl(project)
            return (
              <Link key={project.id} to={`/projects/${project.id}`} className="cardLink">
                <article className="card">
                  <div className="thumb">
                    {cover ? (
                      <img
                        src={cover}
                        alt={project.title}
                        className="thumbImg"
                        onError={e => {
                          e.currentTarget.remove()
                        }}
                      />
                    ) : null}

                    {!cover && (
                      <div className="thumbFallback">
                      </div>
                    )}
                  </div>

                  <div className="cardBody">
                    <div className="cardTop">
                      <span className="badge">
                        {project.subject?.name}
                      </span>
                      {project.year && (
                        <span className="year">{project.year}</span>
                      )}
                    </div>

                    <h3 className="cardTitle">{project.title}</h3>
                    <p className="cardDesc">{project.description}</p>

                    <div className="tags">
                      {project.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>

                    <div className="authors">
                      Por {[
                        ...(project.users?.map(u => u.name || u.email) ?? []),
                        ...(project.collaborators_text ?? []),
                      ].join(', ')}
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  </div>
)
}