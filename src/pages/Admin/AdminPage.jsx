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

// ── Preview del proyecto ─────────────────────────────────────────────────────
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '16px', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: '100%', maxWidth: '760px', margin: '32px 0', fontFamily: 'LatoCustom, system-ui, sans-serif' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 2px' }}>Vista previa de solicitud #{req.id}</p>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#111827', margin: 0 }}>{data.title || 'Sin título'}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>✕</button>
        </div>

        <div>
          {featured ? (
            <div style={{ padding: '16px 16px 8px' }}>
              <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', background: '#f3f4f6', border: '1px solid #e5e7eb', marginBottom: '8px' }}>
                {featured.type === 'video'
                  ? <video src={featured.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls muted playsInline />
                  : <img src={featured.src} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              {thumbnails.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {thumbnails.map(t => (
                    <div key={t.key} onClick={() => setFeatured(t)}
                      style={{ aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', background: '#f3f4f6', border: '1px solid #e5e7eb', cursor: 'pointer', position: 'relative', transition: 'opacity 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                      {t.type === 'video' ? (
                        <>
                          <video src={t.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted preload="metadata" />
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                            <span style={{ color: '#fff', fontSize: '18px' }}>▶</span>
                          </div>
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
            <div style={{ height: '160px', background: 'linear-gradient(135deg, #334155, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '48px', color: 'rgba(255,255,255,0.9)' }}>📁</span>
            </div>
          )}

          <div style={{ padding: '20px 24px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {data.subject_id && (
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#385e9d', background: 'rgba(56,94,157,0.1)', padding: '4px 10px', borderRadius: '999px' }}>
                  Asignatura ID: {data.subject_id}
                </span>
              )}
              {data.year && (
                <span style={{ fontSize: '12px', color: '#9ca3af', border: '1px solid #e5e7eb', padding: '4px 10px', borderRadius: '999px' }}>{data.year}</span>
              )}
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111827', margin: '0 0 6px' }}>{data.title}</h1>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '14px' }}>Por {allAuthors.join(', ')}</p>
            <p style={{ color: '#374151', lineHeight: '1.7', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f3f4f6' }}>{data.description}</p>
            {data.full_description && (
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f3f4f6' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#111827', margin: '0 0 8px' }}>Descripción</h2>
                <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.7', whiteSpace: 'pre-wrap', margin: 0 }}>{data.full_description}</p>
              </div>
            )}
            {data.game_url && (
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f3f4f6' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#111827', margin: '0 0 8px' }}>Demo / Juego</h2>
                <a href={data.game_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#385e9d', color: '#fff', padding: '10px 18px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '700' }}>
                  🎮 Ver demo
                </a>
              </div>
            )}
            {data.tags?.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Etiquetas</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {data.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '12px', background: 'rgba(56,94,157,0.08)', color: '#385e9d', border: '1px solid rgba(56,94,157,0.18)', padding: '4px 12px', borderRadius: '999px' }}>{tag}</span>
                  ))}
                </div>
              </div>
            )}
            {media.length > 0 && (
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                📎 {media.filter(isImage).length} imagen(es) · {media.filter(isVideo).length} vídeo(s)
              </p>
            )}
          </div>
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

  const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden' }

  return (
    <div style={card}>
      {/* Cabecera */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: '900', color: '#111827', margin: '0 0 2px' }}>Proyectos en el repositorio</h2>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
            {loading ? 'Cargando...' : `${projects.length} proyecto${projects.length !== 1 ? 's' : ''} publicado${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {selected.size > 0 && (
            <button onClick={openDeleteBulk}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#d22020', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
              🗑️ Eliminar seleccionados ({selected.size})
            </button>
          )}
          <button onClick={fetchProjects}
            style={{ fontSize: '13px', color: '#385e9d', border: '1px solid rgba(56,94,157,0.3)', background: 'transparent', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
            ↻ Actualizar
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
        <input
          type="text"
          placeholder="Filtrar por título, asignatura o autor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', width: '100%', maxWidth: '360px', boxSizing: 'border-box' }}
        />
      </div>

      {/* Contenido */}
      {error ? (
        <div style={{ padding: '24px', fontSize: '14px', color: '#d22020', background: '#fff1f1' }}>{error}</div>
      ) : loading ? (
        <div style={{ textAlign: 'center', color: '#9ca3af', padding: '64px 0', fontSize: '14px' }}>Cargando proyectos...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#9ca3af', padding: '64px 0', fontSize: '14px' }}>
          {search ? 'No hay proyectos que coincidan.' : 'No hay proyectos publicados.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa', textAlign: 'left' }}>
                <th style={{ padding: '10px 16px', width: '40px' }}>
                  <input type="checkbox" checked={allFilteredSelected} onChange={toggleAll} style={{ cursor: 'pointer', accentColor: '#385e9d' }} />
                </th>
                {['Título', 'Asignatura', 'Autores', 'Año', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(project => {
                const isChecked           = selected.has(project.id)
                const usersWithAccount    = project.users?.map(u => u.name || u.email) ?? []
                const usersWithoutAccount = project.collaborators_text ?? []
                return (
                  <tr key={project.id} style={{ borderBottom: '1px solid #f9fafb', background: isChecked ? '#fff5f5' : '#fff', transition: 'background 0.1s' }}
                    onMouseEnter={e => { if (!isChecked) e.currentTarget.style.background = '#fafafa' }}
                    onMouseLeave={e => { e.currentTarget.style.background = isChecked ? '#fff5f5' : '#fff' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <input type="checkbox" checked={isChecked} onChange={() => toggleSelect(project.id)} style={{ cursor: 'pointer', accentColor: '#d22020' }} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: '700', color: '#111827' }}>{project.title}</span>
                      {project.tags?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                          {project.tags.slice(0, 3).map(tag => (
                            <span key={tag} style={{ fontSize: '11px', background: 'rgba(56,94,157,0.08)', color: '#385e9d', padding: '2px 8px', borderRadius: '999px' }}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{project.subject?.name || '—'}</td>
                    <td style={{ padding: '12px 16px', maxWidth: '200px' }}>
                      {(usersWithAccount.length + usersWithoutAccount.length) === 0 ? (
                        <span style={{ color: '#9ca3af' }}>—</span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {usersWithAccount.map((name, i) => (
                            <span key={`u-${i}`} style={{ fontSize: '12px', background: 'rgba(56,94,157,0.08)', color: '#385e9d', border: '1px solid rgba(56,94,157,0.15)', padding: '2px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>{name}</span>
                          ))}
                          {usersWithoutAccount.map((name, i) => (
                            <span key={`t-${i}`} style={{ fontSize: '12px', background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>{name}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{project.year || '—'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button onClick={() => openDeleteSingle(project)}
                        style={{ fontSize: '12px', color: '#d22020', border: '1px solid #fecaca', background: 'transparent', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
                        🗑️ Eliminar
                      </button>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: '100%', maxWidth: '360px', padding: '28px', textAlign: 'center', fontFamily: 'LatoCustom, system-ui, sans-serif' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#111827', margin: '0 0 8px' }}>
              {targetProject ? '¿Eliminar este proyecto?' : `¿Eliminar ${selected.size} proyecto${selected.size !== 1 ? 's' : ''}?`}
            </h3>
            {targetProject ? (
              <>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px' }}>Vas a eliminar: <strong>"{targetProject.title}"</strong></p>
                {getAllAuthors(targetProject).length > 0 && (
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px' }}>Autores: {getAllAuthors(targetProject).join(', ')}</p>
                )}
              </>
            ) : (
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px' }}>
                Vas a eliminar {selected.size} proyecto{selected.size !== 1 ? 's' : ''} seleccionado{selected.size !== 1 ? 's' : ''}.
              </p>
            )}
            <p style={{ fontSize: '12px', color: '#d22020', margin: '0 0 24px' }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setDeleteModal(false); setTargetProject(null) }}
                style={{ flex: 1, border: '1px solid #e5e7eb', background: 'transparent', color: '#374151', padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                style={{ flex: 1, background: '#d22020', color: '#fff', border: 'none', padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: deleting ? 0.5 : 1 }}>
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
    create: { text: 'Crear proyecto',    color: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' } },
    update: { text: 'Editar proyecto',   color: { background: 'rgba(56,94,157,0.08)', color: '#385e9d', border: '1px solid rgba(56,94,157,0.2)' } },
    delete: { text: 'Eliminar proyecto', color: { background: '#fff1f1', color: '#d22020', border: '1px solid #fecaca' } },
  }[type] || { text: type, color: { background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' } })

  const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }

  return (
    <div className="page">
      <Navbar />

      {previewReq && <ProjectPreview req={previewReq} onClose={() => setPreviewReq(null)} />}

      {/* Modal de rechazo */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: '100%', maxWidth: '440px', padding: '28px', fontFamily: 'LatoCustom, system-ui, sans-serif' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#111827', margin: '0 0 4px' }}>Rechazar solicitud</h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px' }}>Indica el motivo del rechazo. El usuario lo recibirá como feedback.</p>
            <textarea
              value={rejectModal.message}
              onChange={e => setRejectModal(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              placeholder="Ej: Las imágenes no cumplen los requisitos mínimos de calidad..."
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectModal(null)}
                style={{ border: '1px solid #e5e7eb', background: 'transparent', color: '#374151', padding: '8px 18px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button onClick={handleReject} disabled={!rejectModal.message?.trim() || actionLoading !== null}
                style={{ background: '#d22020', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: (!rejectModal.message?.trim() || actionLoading !== null) ? 0.5 : 1 }}>
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

      <main className="content" style={{ maxWidth: '1100px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', padding: '4px', borderRadius: '12px', width: 'fit-content', marginBottom: '24px' }}>
          {[
            { key: 'requests', label: '📋 Solicitudes pendientes', badge: requests.length > 0 ? requests.length : null },
            { key: 'projects', label: '📁 Proyectos publicados', badge: null },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s',
                background: activeTab === tab.key ? '#fff' : 'transparent',
                color: activeTab === tab.key ? '#111827' : '#6b7280',
                boxShadow: activeTab === tab.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
              {tab.label}
              {tab.badge && (
                <span style={{ background: '#d22020', color: '#fff', fontSize: '11px', fontWeight: '900', padding: '1px 6px', borderRadius: '999px' }}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Solicitudes */}
        {activeTab === 'requests' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button onClick={fetchRequests}
                style={{ fontSize: '13px', color: '#385e9d', border: '1px solid rgba(56,94,157,0.3)', background: 'transparent', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                ↻ Actualizar
              </button>
            </div>

            {error && (
              <div style={{ background: '#fff1f1', border: '1px solid #fecaca', color: '#d22020', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '80px 0', fontSize: '14px' }}>Cargando solicitudes...</div>
            ) : requests.length === 0 ? (
              <div style={{ textAlign: 'center', ...card, padding: '80px 24px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
                <p style={{ fontWeight: '700', color: '#374151', fontSize: '16px', margin: '0 0 4px' }}>No hay solicitudes pendientes</p>
                <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>Todas las solicitudes han sido procesadas</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {requests.map(req => {
                  const { text, color } = typeLabel(req.type)
                  const data = req.data || {}
                  const mediaCount = data.media?.length || 0
                  const collaborators = data.collaborators || []
                  const allAuthors = [
                    req.user?.name || req.user?.email || `Usuario #${req.user_id}`,
                    ...collaborators.filter(c => c.type === 'user').map(c => c.name || c.value),
                    ...collaborators.filter(c => c.type === 'text').map(c => c.value),
                  ]

                  return (
                    <div key={req.id} style={{ ...card, transition: 'box-shadow 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}>

                      <div onClick={() => setPreviewReq(req)} style={{ padding: '20px 24px', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '999px', ...color }}>{text}</span>
                              <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                #{req.id} · {new Date(req.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {data.title && <h3 style={{ fontWeight: '900', color: '#111827', fontSize: '17px', margin: '0 0 4px' }}>{data.title}</h3>}
                            {data.description && <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{data.description}</p>}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#9ca3af' }}>
                              <span>👤 {allAuthors.join(', ')}</span>
                              {data.subject_id && <span>📚 Asignatura ID: {data.subject_id}</span>}
                              {data.year && <span>📅 {data.year}</span>}
                              {data.tags?.length > 0 && <span>🏷️ {data.tags.join(', ')}</span>}
                              {mediaCount > 0 && <span>📎 {mediaCount} archivo(s)</span>}
                              {data.game_url && <span>🎮 Demo incluida</span>}
                            </div>
                            <p style={{ fontSize: '12px', color: '#385e9d', marginTop: '8px', margin: '8px 0 0' }}>🔍 Haz clic para ver la vista previa completa</p>
                          </div>

                          {/* Botones — stopPropagation */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleApprove(req.id)} disabled={actionLoading !== null}
                              style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: actionLoading !== null ? 0.5 : 1 }}>
                              {actionLoading === req.id + 'approve' ? 'Aprobando...' : '✓ Aprobar'}
                            </button>
                            <button onClick={() => setRejectModal({ id: req.id, message: '' })} disabled={actionLoading !== null}
                              style={{ background: '#fff', color: '#d22020', border: '1px solid #fecaca', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: actionLoading !== null ? 0.5 : 1 }}>
                              ✕ Rechazar
                            </button>
                          </div>
                        </div>
                      </div>

                      {req.user_message && (
                        <div style={{ padding: '0 24px 16px' }}>
                          <p style={{ fontSize: '12px', color: '#6b7280', background: '#fafafa', borderRadius: '8px', padding: '10px 14px', border: '1px solid #f3f4f6', margin: 0 }}>
                            <strong style={{ color: '#374151' }}>Mensaje del usuario: </strong>{req.user_message}
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