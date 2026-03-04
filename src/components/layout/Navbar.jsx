import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function Navbar({ onOpenMenu }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try { await api.post('/logout') } catch (e) {}
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  return (
    <>
      <header className="siteHeader">
        <div className="topBar">
          <div className="topBar__inner">

            {/* Izquierda: logo */}
            <div className="topBar__left">
              <Link to="/" className="topBar__brand">
                <img
                  src={`${import.meta.env.BASE_URL}icons/marca-UniversidadSalamanca-color.png`}
                  alt="Universidad de Salamanca"
                  className="topBar__logo"
                />
              </Link>
            </div>

            {/* Centro: nav links desktop */}
            <nav className="topBar__nav">
              {onOpenMenu && (
                <button type="button" className="hamburgerBtn" onClick={onOpenMenu}>
                  Asignaturas
                </button>
              )}
              <Link to="/" className="topBar__navLink">Proyectos</Link>
              <Link to="/about" className="topBar__navLink">¿Qué es esto?</Link>
            </nav>

            {/* Derecha: auth + botón móvil */}
            <div className="topBar__right">
              <div className="topBar__auth">
                {user ? (
                  <>
                    <Link to="/submit" className="topBar__navLink">+ Subir</Link>
                    <Link to="/profile" className="topBar__navLink">{user.name || user.email}</Link>
                    {user.is_admin && <Link to="/admin" className="topBar__adminLink">Admin</Link>}
                    <button onClick={handleLogout} className="topBar__logoutBtn">Salir</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="topBar__navLink">Iniciar sesión</Link>
                    <Link to="/register" className="btn btn--primary btn--sm">Registrarse</Link>
                  </>
                )}
              </div>

              {/* Solo visible en móvil */}
              <button type="button" className="mobileMenuBtn" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
                <span /><span /><span />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* MENÚ MÓVIL fullscreen */}
      <div className={`mobileMenu ${mobileOpen ? 'mobileMenu--open' : ''}`}>
        <button className="mobileMenu__close" onClick={() => setMobileOpen(false)}>✕</button>

        <nav className="mobileMenu__nav">
          {onOpenMenu && (
            <button className="mobileMenu__link" onClick={() => { onOpenMenu(); setMobileOpen(false); }}>
              Asignaturas
            </button>
          )}
          <Link to="/" className="mobileMenu__link" onClick={() => setMobileOpen(false)}>Proyectos</Link>
          <Link to="/about" className="mobileMenu__link" onClick={() => setMobileOpen(false)}>¿Qué es esto?</Link>

          {user ? (
            <>
              <Link to="/submit" className="mobileMenu__link" onClick={() => setMobileOpen(false)}>+ Subir Proyecto</Link>
              <Link to="/profile" className="mobileMenu__link" onClick={() => setMobileOpen(false)}>Mi perfil</Link>
              {user.is_admin && <Link to="/admin" className="mobileMenu__link" onClick={() => setMobileOpen(false)}>Admin</Link>}
              <button className="mobileMenu__link mobileMenu__logout" onClick={handleLogout}>Salir</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobileMenu__link" onClick={() => setMobileOpen(false)}>Iniciar sesión</Link>
              <div className="mobileMenu__cta">
                <Link to="/register" className="btn btn--primary" onClick={() => setMobileOpen(false)}>Registrarse</Link>
              </div>
            </>
          )}
        </nav>
      </div>
    </>
  )
}