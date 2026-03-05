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
                        <div className="adminPreview__playOverlay"><span>▶</span></div>
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
          <div className="adminPreview__noMedia">📁</div>
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
              <a href={data.game_url} target="_blank" rel="noopener noreferrer" className="adminPreview__demoBtn">🎮 Ver demo</a>
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
            <p className="adminPreview__mediaCount">📎 {media.filter(isImage).length} imagen(es) · {media.filter(isVideo).length} vídeo(s)</p>
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
              🗑️ Eliminar seleccionados ({selected.size})
            </button>
          )}
          <button onClick={fetchProjects} className="adminRefreshBtn">↻ Actualizar</button>
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
        <div className="adminEmpty"><div className="adminEmpty__icon">⏳</div><p className="adminEmpty__text">Cargando proyectos...</p></div>
      ) : filtered.length === 0 ? (
        <div className="adminEmpty">
          <div className="adminEmpty__icon">📭</div>
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
                      <button onClick={() => openDeleteSingle(project)} className="adminProjects__deleteBtn">🗑️ Eliminar</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal confirmación */}
      {deleteModal && (
        <div className="modal__overlay">
          <div className="modal__box modal__box--sm">
            <div className="modal__icon">⚠️</div>
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

      {/* Modal de rechazo */}
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

        {/* Tabs */}
        <div className="adminTabs">
          {[
            { key: 'requests', label: '📋 Solicitudes pendientes', badge: requests.length > 0 ? requests.length : null },
            { key: 'projects', label: '📁 Proyectos publicados', badge: null },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`adminTab${activeTab === tab.key ? ' adminTab--active' : ''}`}>
              {tab.label}
              {tab.badge && <span className="adminTab__badge">{tab.badge}</span>}
            </button>
          ))}
        </div>

        {/* Tab: Solicitudes */}
        {activeTab === 'requests' && (
          <>
            <div className="adminTopBar">
              <button onClick={fetchRequests} className="adminRefreshBtn">↻ Actualizar</button>
            </div>

            {error && <div className="adminError">{error}</div>}

            {loading ? (
              <div className="adminEmpty">
                <div className="adminEmpty__icon">⏳</div>
                <p className="adminEmpty__text">Cargando solicitudes...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="adminEmpty">
                <div className="adminEmpty__icon">✅</div>
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
                              <span>👤 {allAuthors.join(', ')}</span>
                              {data.subject_id && <span>📚 Asignatura ID: {data.subject_id}</span>}
                              {data.year && <span>📅 {data.year}</span>}
                              {data.tags?.length > 0 && <span>🏷️ {data.tags.join(', ')}</span>}
                              {mediaCount > 0 && <span>📎 {mediaCount} archivo(s)</span>}
                              {data.game_url && <span>🎮 Demo incluida</span>}
                            </div>
                            <p className="adminRequest__previewHint">🔍 Haz clic para ver la vista previa completa</p>
                          </div>

                          <div className="adminRequest__actions" onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleApprove(req.id)} disabled={actionLoading !== null} className="adminRequest__approveBtn">
                              {actionLoading === req.id + 'approve' ? 'Aprobando...' : '✓ Aprobar'}
                            </button>
                            <button onClick={() => setRejectModal({ id: req.id, message: '' })} disabled={actionLoading !== null} className="adminRequest__rejectBtn">
                              ✕ Rechazar
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

        {/* Tab: Proyectos publicados */}
        {activeTab === 'projects' && <PublishedProjectsSection />}

      </main>

      <Footer />
    </div>
  )
}