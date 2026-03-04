import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'

export default function AboutPage() {
  return (
    <div className="page">
      <header className="hero">
        <div className="hero__inner">
          <Navbar />
          <div className="hero__content">
            <h1 className="hero__title">¿Qué es este repositorio?</h1>
            <p className="hero__subtitle">Conoce el propósito y funcionamiento de esta plataforma</p>
          </div>
        </div>
      </header>

      <main className="content" style={{ maxWidth: '860px' }}>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#111827', marginBottom: '10px' }}>Propósito</h2>
          <p style={{ color: '#374151', lineHeight: '1.7' }}>Lorem ipsum dolor sit amet...</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#111827', marginBottom: '10px' }}>Criterios de publicación</h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: 0, listStyle: 'none' }}>
            {[
              'Nemo enim ipsam voluptatem quia voluptas sit aspernatur.',
              'Neque porro quisquam est qui dolorem ipsum.',
              'Ut labore et dolore magnam aliquam quaerat.',
              'Quis autem vel eum iure reprehenderit.',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '15px', color: '#374151' }}>
                <span style={{ background: '#d22020', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', flexShrink: 0 }}>{i + 1}</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#111827', marginBottom: '10px' }}>¿Cómo funciona?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
            {[
              { img: 'document.png', title: 'Sube tu proyecto', desc: 'Rellena el formulario con los datos y archivos de tu proyecto.' },
              { img: 'search.png',   title: 'Revisión',         desc: 'Un administrador revisa que cumple los criterios del repositorio.' },
              { img: 'check.png',    title: 'Publicación',      desc: 'Si es aprobado, tu proyecto queda visible para toda la comunidad.' },
            ].map(({ img, title, desc }) => (
              <div key={title} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                <img src={`${import.meta.env.BASE_URL}icons/${img}`} alt={title} className="aboutCard__icon" />
                <p style={{ fontWeight: '900', fontSize: '15px', marginBottom: '6px', color: '#111827' }}>{title}</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/" className="siteNav__link">← Volver al repositorio</Link>
        </div>
      </main>
    </div>
  )
}