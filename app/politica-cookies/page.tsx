import Link from 'next/link'

export const metadata = {
  title: 'Política de Cookies — Planeta Movimiento',
  description: 'Información sobre el uso de cookies en el sitio web de Planeta Movimiento (Planeta Carlos S.L.).',
}

const T = { marca: 'Planeta Movimiento', email: 'info@planetamovimiento.com' }
const ACTUALIZACION = '6 de junio de 2026'

const COOKIES = [
  { nombre: 'sb-* (sesión)', tipo: 'Técnica / necesaria', finalidad: 'Mantener la sesión iniciada en el panel de administración y procesos seguros.', duracion: 'Sesión / hasta cierre', titular: 'Propia' },
  { nombre: 'Preferencias locales', tipo: 'Técnica / funcional', finalidad: 'Recordar selecciones del usuario (p. ej. el carrito de colchonetas) en el navegador.', duracion: 'Persistente (local)', titular: 'Propia' },
]

function Section({ n, titulo, children }: { n: string; titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-black text-pm-navy mb-2">{n}. {titulo}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

export default function PoliticaCookiesPage() {
  return (
    <main className="bg-pm-bg min-h-screen">
      <section className="bg-pm-navy text-white py-14 border-t-4 border-pm-red">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-5 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>›</span>
            <span className="text-white">Política de Cookies</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-black mb-2">Política de Cookies</h1>
          <p className="text-white/60 text-sm">Última actualización: {ACTUALIZACION}</p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-10 space-y-8 text-[15px] leading-relaxed text-gray-700">

          <Section n="1" titulo="¿Qué son las cookies?">
            <p>Las cookies son pequeños archivos que se descargan en tu dispositivo al navegar por determinadas páginas web. Permiten, entre otras cosas, que el sitio funcione correctamente, recordar tus preferencias y obtener información sobre el uso del sitio.</p>
          </Section>

          <Section n="2" titulo="Cookies que utiliza este sitio">
            <p>Actualmente {T.marca} utiliza únicamente cookies <strong>técnicas y funcionales</strong>, necesarias para el funcionamiento del sitio y de su sistema de gestión. No utilizamos cookies de publicidad ni elaboramos perfiles con fines comerciales.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-pm-bg text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-2.5 font-semibold">Cookie</th>
                    <th className="px-4 py-2.5 font-semibold">Tipo</th>
                    <th className="px-4 py-2.5 font-semibold">Finalidad</th>
                    <th className="px-4 py-2.5 font-semibold">Duración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {COOKIES.map(c => (
                    <tr key={c.nombre}>
                      <td className="px-4 py-2.5 font-semibold text-pm-navy">{c.nombre}</td>
                      <td className="px-4 py-2.5 text-gray-600">{c.tipo}</td>
                      <td className="px-4 py-2.5 text-gray-600">{c.finalidad}</td>
                      <td className="px-4 py-2.5 text-gray-600">{c.duracion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-gray-500">Si en el futuro se incorporan cookies de análisis o de terceros, se actualizará esta política y se solicitará tu consentimiento previo cuando la normativa lo exija.</p>
          </Section>

          <Section n="3" titulo="Base legal">
            <p>Las cookies técnicas y funcionales están exentas del deber de consentimiento conforme al artículo 22.2 de la LSSI-CE (Ley 34/2002), por ser necesarias para la prestación del servicio expresamente solicitado por el usuario.</p>
          </Section>

          <Section n="4" titulo="Cómo gestionar o desactivar las cookies">
            <p>Puedes permitir, bloquear o eliminar las cookies instaladas en tu dispositivo a través de la configuración de tu navegador. Ten en cuenta que desactivar las cookies técnicas puede impedir el correcto funcionamiento de algunas partes del sitio.</p>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-pm-red underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/es/kb/Borrar%20cookies" target="_blank" rel="noopener noreferrer" className="text-pm-red underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-pm-red underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/es-es/microsoft-edge" target="_blank" rel="noopener noreferrer" className="text-pm-red underline">Microsoft Edge</a></li>
            </ul>
          </Section>

          <Section n="5" titulo="Más información">
            <p>Para más detalle sobre el tratamiento de tus datos, consulta nuestra <Link href="/politica-privacidad" className="text-pm-red underline">Política de Privacidad</Link>. Si tienes dudas, escríbenos a <a href={`mailto:${T.email}`} className="text-pm-red underline">{T.email}</a>.</p>
          </Section>
        </div>
      </article>
    </main>
  )
}
