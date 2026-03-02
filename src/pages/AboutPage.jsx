import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-14">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¿Qué es este repositorio?</h1>
          <div className="h-1 w-16 bg-blue-600 rounded"></div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Propósito</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Criterios de publicación</h2>
            <p className="mb-4">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis.</p>
            <ul className="space-y-2">
              {[
                'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
                'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet.',
                'Ut labore et dolore magnam aliquam quaerat voluptatem.',
                'Quis autem vel eum iure reprehenderit qui in ea voluptate velit.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center shrink-0 font-bold">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">¿Cómo funciona?</h2>
            <p className="mb-4">At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: '📤', title: 'Sube tu proyecto', desc: 'Rellena el formulario con los datos y archivos de tu proyecto.' },
                { icon: '🔍', title: 'Revisión', desc: 'Un administrador revisa que cumple los criterios del repositorio.' },
                { icon: '✅', title: 'Publicación', desc: 'Si es aprobado, tu proyecto queda visible para toda la comunidad.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">{icon}</div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Sobre los autores</h2>
            <p>Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.</p>
          </section>

        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-blue-600 hover:underline">← Volver al repositorio</Link>
        </div>
      </div>
    </div>
  )
}