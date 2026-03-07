import { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import api from '../../services/api'

const STORAGE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'https://repositorio-backend-production.up.railway.app'

function mediaUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${STORAGE_URL}/storage/${path}`
}

function isImage(item) {
  if (item.type === 'image' || item.mime_type?.startsWith('image/')) return true
  const ext = (item.file_path || '').split('.').pop().toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
}

function isVideo(item) {
  if (item.type === 'video' || item.mime_type?.startsWith('video/')) return true
  const ext = (item.file_path || '').split('.').pop().toLowerCase()
  return ['mp4', 'avi', 'mov'].includes(ext)
}

function getAllAuthors(project) {
  return [
    ...(project.users?.map(u => u.name || u.email) ?? []),
    ...(project.collaborators_text ?? []),
  ]
}

// ── Iconos SVG inline ─────────────────────────────────────────────────────────
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconTrash = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)
const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)
const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconFolder = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconList = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)
const IconWarning = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const IconPlay = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)
const IconClip = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
)
const IconUser = () => (
  <img src={`${import.meta.env.BASE_URL}icons/user.png`} alt="" width="12" height="12" style={{ opacity: 0.6, verticalAlign: 'middle' }} />
)
const IconCalendar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconTag = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)
const IconBook = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
)
const IconGamepad = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/>
    <circle cx="15" cy="11" r="1"/><circle cx="17" cy="13" r="1"/>
    <path d="M6 2h12l4 8-4 8H6L2 10z"/>
  </svg>
)
const IconNoMedia = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const IconCheckBig = () => (
  <img src={`${import.meta.env.BASE_URL}icons/check.png`} alt="" width="36" height="36" style={{ opacity: 0.85 }} />
)
const IconInbox = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
)
const IconClock = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

// ── Preview del proyecto ──────────────────────────────────────────────────────
function ProjectPreview({ req, onClose }) {
  const data   = req.data || {}
  const media  = data.media || []
  const images = media.filter(isImage)
  const videos = media.filter(isVideo)
  const [featured, setFeatured] = useState(
    videos.length > 0
      ? { type: 'video', src: mediaUrl(videos[0].file_path) }
      : images.length > 0
        ? { type: 'image', src: mediaUrl(images[0].file_path) }
        : null
  )

  const thumbnails = [
    ...videos.map((v, i) => ({ type: 'video', src: mediaUrl(v.file_path), key: `v${i}` })),
    ...images.map((img, i) => ({ type: 'image', src: mediaUrl(img.file_path), key: `i${i}` })),
  ].filter(t => t.src !== featured?.src)

  const collaborators = data.collaborators || []
  const allAuthors = [
    req.user?.name || req.user?.email || `Usuario #${req.user_id}`,
    ...collaborators.filter(c => c.type === 'user').map(c => c.name || c.value),
    ...collaborators.filter(c => c.type === 'text').map(c => c.value),
  ]

  return (
    <div className="adminPreview">
      <div className="adminPreview__box">
        <div className="adminPreview__header">
          <div>
            <p className="adminPreview__id">Vista previa de solicitud #{req.id}</p>
            <h2 className="adminPreview__title">{data.title || 'Sin título'}</h2>
          </div>
          <button onClick={onClose} className="adminPreview__closeBtn">✕</button>
        </div>

        {featured ? (
          <div className="adminPreview__media">
            <div className="adminPreview__featured">
              {featured.type === 'video'
                ? <video src={featured.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls muted playsInline />
                : <img src={featured.src} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              }
            </div>
            {thumbnails.length > 0 && (
              <div className="adminPreview__thumbGrid">
                {thumbnails.map(t => (
                  <div key={t.key} onClick={() => setFeatured(t)} className="adminPreview__thumb"
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    {t.type === 'video' ? (
                      <>
                        <video src={t.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted preload="metadata" />
                        <div className="adminPreview__playOverlay"><IconPlay /></div>
                      </>
                    ) : (
                      <img src={t.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="adminPreview__noMedia"><IconNoMedia /></div>
        )}

        <div className="adminPreview__body">
          <div className="adminPreview__badges">
            {data.subject_id && <span className="adminPreview__subjectBadge">Asignatura ID: {data.subject_id}</span>}
            {data.year && <span className="adminPreview__yearBadge">{data.year}</span>}
          </div>
          <h1 className="adminPreview__projectTitle">{data.title}</h1>
          <p className="adminPreview__authors">Por {allAuthors.join(', ')}</p>
          <p className="adminPreview__desc">{data.description}</p>

          {data.full_description && (
            <div className="adminPreview__section">
              <h2 className="adminPreview__sectionTitle">Descripción</h2>
              <p className="adminPreview__sectionText">{data.full_description}</p>
            </div>
          )}
          {data.game_url && (
            <div className="adminPreview__section">
              <h2 className="adminPreview__sectionTitle">Demo / Juego</h2>
              <a href={data.game_url} target="_blank" rel="noopener noreferrer" className="adminPreview__demoBtn">
                Ver demo
              </a>
            </div>
          )}
          {data.tags?.length > 0 && (
            <div>
              <p className="adminPreview__tagsLabel">Etiquetas</p>
              <div className="adminPreview__tagsList">
                {data.tags.map(tag => <span key={tag} className="adminPreview__tagChip">{tag}</span>)}
              </div>
            </div>
          )}
          {media.length > 0 && (
            <p className="adminPreview__mediaCount" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
              <IconClip />
              {media.filter(isImage).length} imagen(es) · {media.filter(isVideo).length} vídeo(s)
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sección: Proyectos publicados ─────────────────────────────────────────────
function PublishedProjectsSection() {
  const [projects, setProjects]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [search, setSearch]               = useState('')
  const [selected, setSelected]           = useState(new Set())
  const [deleteModal, setDeleteModal]     = useState(false)
  const [targetProject, setTargetProject] = useState(null)
  const [deleting, setDeleting]           = useState(false)

  const fetchProjects = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get('/projects', { params: { per_page: 200 } })
      setProjects(res.data.data ?? res.data)
    } catch {
      setError('Error al cargar los proyectos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  const filtered = projects.filter(p => {
    const q = search.toLowerCase()
    return (
      p.title?.toLowerCase().includes(q) ||
      p.subject?.name?.toLowerCase().includes(q) ||
      p.users?.some(u => (u.name || u.email)?.toLowerCase().includes(q)) ||
      p.collaborators_text?.some(name => name?.toLowerCase().includes(q))
    )
  })

  const allFilteredSelected = filtered.length > 0 && filtered.every(p => selected.has(p.id))

  const toggleSelect = (id) => {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }
  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelected(prev => { const next = new Set(prev); filtered.forEach(p => next.delete(p.id)); return next })
    } else {
      setSelected(prev => { const next = new Set(prev); filtered.forEach(p => next.add(p.id)); return next })
    }
  }

  const openDeleteSingle = (project) => { setTargetProject(project); setDeleteModal(true) }
  const openDeleteBulk   = ()         => { setTargetProject(null);    setDeleteModal(true) }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      const ids = targetProject ? [targetProject.id] : [...selected]
      await Promise.all(ids.map(id => api.delete(`/admin/projects/${id}`)))
      setProjects(prev => prev.filter(p => !ids.includes(p.id)))
      setSelected(prev => { const next = new Set(prev); ids.forEach(id => next.delete(id)); return next })
      setDeleteModal(false); setTargetProject(null)
    } catch {
      alert('Error al eliminar.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="adminProjectsCard">
      <div className="adminProjectsCard__header">
        <div>
          <h2 className="adminProjectsCard__title">Proyectos en el repositorio</h2>
          <p className="adminProjectsCard__count">
            {loading ? 'Cargando...' : `${projects.length} proyecto${projects.length !== 1 ? 's' : ''} publicado${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="adminProjectsCard__actions">
          {selected.size > 0 && (
            <button onClick={openDeleteBulk} className="adminProjectsCard__deleteBtn">
              <IconTrash size={13} /> Eliminar seleccionados ({selected.size})
            </button>
          )}
          <button onClick={fetchProjects} className="adminRefreshBtn">
            <IconRefresh /> Actualizar
          </button>
        </div>
      </div>

      <div className="adminProjectsCard__searchBar">
        <input
          type="text"
          placeholder="Filtrar por título, asignatura o autor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="adminProjectsCard__searchInput"
        />
      </div>

      {error ? (
        <div className="adminError">{error}</div>
      ) : loading ? (
        <div className="adminEmpty"><div className="adminEmpty__icon"><IconClock /></div><p className="adminEmpty__text">Cargando proyectos...</p></div>
      ) : filtered.length === 0 ? (
        <div className="adminEmpty">
          <div className="adminEmpty__icon"><IconInbox /></div>
          <p className="adminEmpty__text">{search ? 'No hay proyectos que coincidan.' : 'No hay proyectos publicados.'}</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="adminProjectsTable">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input type="checkbox" checked={allFilteredSelected} onChange={toggleAll} style={{ cursor: 'pointer', accentColor: '#385e9d' }} />
                </th>
                {['Título', 'Asignatura', 'Autores', 'Año', ''].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(project => {
                const isChecked           = selected.has(project.id)
                const usersWithAccount    = project.users?.map(u => u.name || u.email) ?? []
                const usersWithoutAccount = project.collaborators_text ?? []
                return (
                  <tr key={project.id} className={isChecked ? 'is-checked' : ''}
                    onMouseEnter={e => { if (!isChecked) e.currentTarget.style.background = '#fafafa' }}
                    onMouseLeave={e => { e.currentTarget.style.background = isChecked ? '#fff5f5' : '#fff' }}>
                    <td>
                      <input type="checkbox" checked={isChecked} onChange={() => toggleSelect(project.id)} style={{ cursor: 'pointer', accentColor: '#d22020' }} />
                    </td>
                    <td>
                      <span className="adminProjects__projectTitle">{project.title}</span>
                      {project.tags?.length > 0 && (
                        <div className="adminProjects__chips">
                          {project.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="adminProjects__tagChip">{tag}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>{project.subject?.name || '—'}</td>
                    <td>
                      {(usersWithAccount.length + usersWithoutAccount.length) === 0 ? (
                        <span style={{ color: '#9ca3af' }}>—</span>
                      ) : (
                        <div className="adminProjects__chips">
                          {usersWithAccount.map((name, i) => (
                            <span key={`u-${i}`} className="adminProjects__authorChip--user">{name}</span>
                          ))}
                          {usersWithoutAccount.map((name, i) => (
                            <span key={`t-${i}`} className="adminProjects__authorChip--text">{name}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ color: '#9ca3af' }}>{project.year || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => openDeleteSingle(project)} className="adminProjects__deleteBtn">
                        <IconTrash size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> Eliminar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {deleteModal && (
        <div className="modal__overlay">
          <div className="modal__box modal__box--sm">
            <div className="modal__icon"><IconWarning /></div>
            <h3 className="modal__deleteTitle">
              {targetProject ? '¿Eliminar este proyecto?' : `¿Eliminar ${selected.size} proyecto${selected.size !== 1 ? 's' : ''}?`}
            </h3>
            {targetProject ? (
              <>
                <p className="modal__deleteDesc">Vas a eliminar: <strong>"{targetProject.title}"</strong></p>
                {getAllAuthors(targetProject).length > 0 && (
                  <p className="modal__deleteNote">Autores: {getAllAuthors(targetProject).join(', ')}</p>
                )}
              </>
            ) : (
              <p className="modal__deleteDesc">
                Vas a eliminar {selected.size} proyecto{selected.size !== 1 ? 's' : ''} seleccionado{selected.size !== 1 ? 's' : ''}.
              </p>
            )}
            <p style={{ fontSize: '12px', color: '#d22020', margin: '0 0 24px' }}>Esta acción no se puede deshacer.</p>
            <div className="modal__deleteActions">
              <button onClick={() => { setDeleteModal(false); setTargetProject(null) }} className="modal__cancelBtnAlt">Cancelar</button>
              <button onClick={confirmDelete} disabled={deleting} className="modal__confirmBtn">
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [requests, setRequests]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [rejectModal, setRejectModal]     = useState(null)
  const [previewReq, setPreviewReq]       = useState(null)
  const [activeTab, setActiveTab]         = useState('requests')

  const fetchRequests = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get('/admin/requests/pending')
      setRequests(res.data)
    } catch (err) {
      setError(err.response?.status === 403
        ? 'No tienes permisos de administrador.'
        : 'Error al cargar las solicitudes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [])

  const handleApprove = async (id) => {
    setActionLoading(id + 'approve')
    try {
      await api.post(`/admin/requests/${id}/approve`)
      setRequests(prev => prev.filter(r => r.id !== id))
      if (previewReq?.id === id) setPreviewReq(null)
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Error al aprobar.')
    } finally { setActionLoading(null) }
  }

  const handleReject = async () => {
    if (!rejectModal?.message?.trim()) return
    setActionLoading(rejectModal.id + 'reject')
    try {
      await api.post(`/admin/requests/${rejectModal.id}/reject`, { admin_message: rejectModal.message })
      setRequests(prev => prev.filter(r => r.id !== rejectModal.id))
      if (previewReq?.id === rejectModal.id) setPreviewReq(null)
      setRejectModal(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Error al rechazar.')
    } finally { setActionLoading(null) }
  }

  const typeLabel = (type) => ({
    create: { text: 'Crear proyecto',    cls: 'adminRequest__typeBadge adminRequest__typeBadge--create' },
    update: { text: 'Editar proyecto',   cls: 'adminRequest__typeBadge adminRequest__typeBadge--update' },
    delete: { text: 'Eliminar proyecto', cls: 'adminRequest__typeBadge adminRequest__typeBadge--delete' },
  }[type] || { text: type, cls: 'adminRequest__typeBadge' })

  return (
    <div className="page">
      <Navbar />

      {previewReq && <ProjectPreview req={previewReq} onClose={() => setPreviewReq(null)} />}

      {rejectModal && (
        <div className="modal__overlay">
          <div className="adminRejectModal">
            <h2 className="adminRejectModal__title">Rechazar solicitud</h2>
            <p className="adminRejectModal__sub">Indica el motivo del rechazo. El usuario lo recibirá como feedback.</p>
            <textarea
              value={rejectModal.message}
              onChange={e => setRejectModal(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              placeholder="Ej: Las imágenes no cumplen los requisitos mínimos de calidad..."
              className="adminRejectModal__textarea"
            />
            <div className="adminRejectModal__actions">
              <button onClick={() => setRejectModal(null)} className="adminRejectModal__cancelBtn">Cancelar</button>
              <button onClick={handleReject} disabled={!rejectModal.message?.trim() || actionLoading !== null} className="adminRejectModal__confirmBtn">
                {actionLoading ? 'Rechazando...' : 'Confirmar rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="hero">
        <div className="hero__inner">
          <div className="hero__content">
            <h1 className="hero__title">Panel de Administración</h1>
            <p className="hero__subtitle">Gestión del repositorio de proyectos</p>
          </div>
        </div>
      </header>

      <main className="content adminPage">

        <div className="adminTabs">
          {[
            { key: 'requests', label: 'Solicitudes pendientes', icon: <IconList />, badge: requests.length > 0 ? requests.length : null },
            { key: 'projects', label: 'Proyectos publicados',   icon: <IconFolder />, badge: null },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`adminTab${activeTab === tab.key ? ' adminTab--active' : ''}`}>
              {tab.icon} {tab.label}
              {tab.badge && <span className="adminTab__badge">{tab.badge}</span>}
            </button>
          ))}
        </div>

        {activeTab === 'requests' && (
          <>
            <div className="adminTopBar">
              <button onClick={fetchRequests} className="adminRefreshBtn"><IconRefresh /> Actualizar</button>
            </div>

            {error && <div className="adminError">{error}</div>}

            {loading ? (
              <div className="adminEmpty">
                <div className="adminEmpty__icon"><IconClock /></div>
                <p className="adminEmpty__text">Cargando solicitudes...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="adminEmpty">
                <div className="adminEmpty__icon"><IconCheckBig /></div>
                <p className="adminEmpty__title">No hay solicitudes pendientes</p>
                <p className="adminEmpty__text">Todas las solicitudes han sido procesadas</p>
              </div>
            ) : (
              <div className="adminRequests">
                {requests.map(req => {
                  const { text, cls } = typeLabel(req.type)
                  const data = req.data || {}
                  const mediaCount = data.media?.length || 0
                  const collaborators = data.collaborators || []
                  const allAuthors = [
                    req.user?.name || req.user?.email || `Usuario #${req.user_id}`,
                    ...collaborators.filter(c => c.type === 'user').map(c => c.name || c.value),
                    ...collaborators.filter(c => c.type === 'text').map(c => c.value),
                  ]

                  return (
                    <div key={req.id} className="adminRequest">
                      <div onClick={() => setPreviewReq(req)} className="adminRequest__body">
                        <div className="adminRequest__top">
                          <div className="adminRequest__meta">
                            <div className="adminRequest__badges">
                              <span className={cls}>{text}</span>
                              <span className="adminRequest__id">
                                #{req.id} · {new Date(req.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {data.title && <h3 className="adminRequest__title">{data.title}</h3>}
                            {data.description && <p className="adminRequest__desc">{data.description}</p>}
                            <div className="adminRequest__info">
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconUser /> {allAuthors.join(', ')}</span>
                              {data.subject_id && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconBook /> Asignatura ID: {data.subject_id}</span>}
                              {data.year && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconCalendar /> {data.year}</span>}
                              {data.tags?.length > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconTag /> {data.tags.join(', ')}</span>}
                              {mediaCount > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconClip /> {mediaCount} archivo(s)</span>}
                              {data.game_url && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconGamepad /> Demo incluida</span>}
                            </div>
                            <p className="adminRequest__previewHint" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <IconSearch /> Haz clic para ver la vista previa completa
                            </p>
                          </div>

                          <div className="adminRequest__actions" onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleApprove(req.id)} disabled={actionLoading !== null} className="adminRequest__approveBtn">
                              <IconCheck /> {actionLoading === req.id + 'approve' ? 'Aprobando...' : 'Aprobar'}
                            </button>
                            <button onClick={() => setRejectModal({ id: req.id, message: '' })} disabled={actionLoading !== null} className="adminRequest__rejectBtn">
                              <IconX /> Rechazar
                            </button>
                          </div>
                        </div>
                      </div>

                      {req.user_message && (
                        <div className="adminRequest__userMsg">
                          <p className="adminRequest__userMsgBox">
                            <strong>Mensaje del usuario: </strong>{req.user_message}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'projects' && <PublishedProjectsSection />}

      </main>

      <Footer />
    </div>
  )
}