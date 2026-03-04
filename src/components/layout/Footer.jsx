import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="siteFooter">
    <div className="siteFooter__inner">
        <img
        src={`${import.meta.env.BASE_URL}icons/marca-UniversidadSalamanca-color.png`}
        alt="Universidad de Salamanca"
        className="siteFooter__logo"
        />
        <p className="siteFooter__text">
        <strong>Repositorio de Proyectos Académicos</strong><br />
        Universidad de Salamanca · Todos los derechos reservados
        </p>
        <div className="siteFooter__links">
        <a href="/" className="siteFooter__link">Proyectos</a>
        <a href="/about" className="siteFooter__link">¿Qué es esto?</a>
        </div>
    </div>
    </footer>
  )
}