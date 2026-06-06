import Link from 'next/link'
import ColchonetasCatalog from './ColchonetasCatalog'

export const metadata = {
  title: 'Colchonetas profesionales — Nube Portátil, Dual Impact y Quitamiedos | Planeta Movimiento',
  description:
    'Colchonetas deportivas profesionales fabricadas en Cuenca. Nube Portátil (349€), Dual Impact (559€) y Quitamiedos (desde 699€). Absorción de impacto, fabricación a medida y envío.',
}

const VENTAJAS = [
  { icon: '🛡️', titulo: 'Absorción profesional', desc: 'Espumas técnicas de alta densidad para proteger en cada recepción.' },
  { icon: '🏭', titulo: 'Fabricación propia', desc: 'Las fabricamos nosotros. Calidad controlada y posibilidad de medidas a medida.' },
  { icon: '💪', titulo: 'Uso intensivo', desc: 'Polipiel náutica y costuras reforzadas pensadas para durar años.' },
  { icon: '🚚', titulo: 'Envío incluido', desc: 'Algunos modelos incluyen transporte. Te lo llevamos donde lo necesites.' },
]

export default function ColchonetasPage() {
  return (
    <main className="bg-pm-bg min-h-screen">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-pm-red transition-colors">Inicio</Link>
            <span>›</span>
            <span className="text-pm-navy font-semibold">Colchonetas</span>
          </nav>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative bg-pm-navy text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-pm-red/15 rounded-full blur-[110px] animate-glow-pulse" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-flex items-center gap-2 border border-white/15 bg-white/5 text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            🏭 Fabricación profesional · Cuenca
          </span>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Colchonetas <span className="text-pm-red">profesionales</span>
          </h1>
          <p className="text-white/60 text-base max-w-2xl mx-auto mb-8">
            Seguridad, calidad y fabricación a medida. Colchonetas deportivas para clubes, gimnasios,
            colegios y centros de entrenamiento. Elige tu modelo, personaliza el color y recíbelo en casa.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['Nube Portátil', 'Dual Impact', 'Quitamiedos'].map(n => (
              <a key={n} href="#catalogo" className="bg-white/10 border border-white/20 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">{n}</a>
            ))}
          </div>
        </div>
      </section>

      {/* ── VENTAJAS ── */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {VENTAJAS.map(v => (
              <div key={v.titulo} className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{v.icon}</span>
                <div>
                  <div className="font-black text-pm-navy text-sm">{v.titulo}</div>
                  <div className="text-gray-500 text-xs leading-relaxed">{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATÁLOGO ── */}
      <section className="py-14" id="catalogo">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-pm-navy mb-3">Nuestros modelos</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Tres colchonetas para distintas necesidades. Elige color, consulta los detalles y añádela al carrito,
              o solicita una fabricación a medida.
            </p>
          </div>

          <ColchonetasCatalog />
        </div>
      </section>

      {/* ── PERSONALIZACIÓN / CTA ── */}
      <section className="bg-pm-navy py-14 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-4xl mb-4">📐</div>
          <h2 className="text-2xl sm:text-3xl font-black mb-3">¿Necesitas otras medidas o colores?</h2>
          <p className="text-white/60 text-sm mb-8 max-w-xl mx-auto">
            Fabricamos colchonetas a medida según las necesidades de tu club, gimnasio o centro educativo.
            Cuéntanos qué necesitas y te preparamos un presupuesto sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#catalogo" className="bg-pm-red hover:bg-pm-red-dark text-white font-black px-8 py-3.5 rounded-xl transition-colors">
              Ver modelos
            </a>
            <a href="https://wa.me/34657604665" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-xl transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Consultar a medida
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
