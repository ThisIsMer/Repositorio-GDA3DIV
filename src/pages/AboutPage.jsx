import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function AboutPage() {
  return (
    <div className="page">
      <Navbar />

      <header className="hero">
        <div className="hero__inner">
          <div className="hero__content">
            <h1 className="hero__title">¿Qué es este repositorio?</h1>
            <p className="hero__subtitle">Conoce el propósito y funcionamiento de esta plataforma</p>
          </div>
        </div>
      </header>

      <main className="content">

        {/* Propósito + Criterios */}
        <div className="about__section">

          <section>
            <h2 className="about__h2">Propósito</h2>
            <p className="about__sectionText">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          </section>

          <section>
            <h2 className="about__h2">Criterios de publicación</h2>
            <p className="about__sectionText">
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <ul className="about__criteriaList">
              {[
                'Nemo enim ipsam voluptatem quia voluptas sit aspernatur.',
                'Neque porro quisquam est qui dolorem ipsum.',
                'Ut labore et dolore magnam aliquam quaerat.',
                'Quis autem vel eum iure reprehenderit.',
              ].map((item, i) => (
                <li key={i} className="about__criteriaItem">
                  <span className="about__criteriaNum">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

        </div>

        <hr className="about__divider" />

        {/* ¿Cómo funciona? */}
        <section className="about__sectionBlock">
          <h2 className="about__h2">¿Cómo funciona?</h2>
          <p className="about__sectionText">
            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.
          </p>
          <div className="about__steps">
            {[
              { img: 'document.png', title: 'Sube tu proyecto', desc: 'Rellena el formulario con los datos y archivos de tu proyecto.' },
              { img: 'search.png',   title: 'Revisión',         desc: 'Un administrador revisa que cumple los criterios del repositorio.' },
              { img: 'check.png',    title: 'Publicación',      desc: 'Si es aprobado, tu proyecto queda visible para toda la comunidad.' },
            ].map(({ img, title, desc }) => (
              <div key={title} className="about__stepCard">
                <img src={`${import.meta.env.BASE_URL}icons/${img}`} alt={title} className="aboutCard__icon" />
                <p className="about__stepTitle">{title}</p>
                <p className="about__stepDesc">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="about__divider" />

        {/* Sobre los autores */}
        <section className="about__sectionBlock">
          <h2 className="about__h2">Sobre los autores</h2>
          <p className="about__authorsText">
            Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.
          </p>
        </section>

        <div className="about__backWrap">
          <Link to="/" className="about__backLink">← Volver al repositorio</Link>
        </div>

      </main>

      <Footer />
    </div>
  )
}