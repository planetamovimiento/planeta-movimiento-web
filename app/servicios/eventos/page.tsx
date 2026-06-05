import Link from 'next/link'
import CalculadoraEventos from './CalculadoraEventos'

export const metadata = {
  title: 'Animación infantil para eventos — Bodas, Comuniones, Bautizos | Planeta Movimiento',
  description:
    'Animación infantil profesional para bodas, comuniones, bautizos y fiestas privadas. Nos desplazamos a tu evento con todo el material. Desde 150 € + IVA.',
}

const TIPOS_EVENTO = [
  { label: 'Bodas',                icon: '💍', color: 'bg-pink-50 border-pink-200 text-pink-700' },
  { label: 'Comuniones',           icon: '✝️', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { label: 'Bautizos',             icon: '👶', color: 'bg-sky-50 border-sky-200 text-sky-700' },
  { label: 'Fiestas privadas',     icon: '🎉', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { label: 'Eventos familiares',   icon: '👨‍👩‍👧‍👦', color: 'bg-green-50 border-green-200 text-green-700' },
  { label: 'Celebraciones esp.',   icon: '🎊', color: 'bg-orange-50 border-orange-200 text-orange-700' },
]

const INCLUYE_BASE = [
  'Taller de manualidades',
  'Taller de circo',
  'Juegos dinámicos',
  'Juegos tradicionales',
  'Balón de fútbol y baloncesto',
  'Raquetas de bádminton',
  'Juegos cooperativos y de habilidad',
  'Material completo para todas las actividades',
]

const FAQ = [
  {
    q: '¿Dónde se celebra la animación?',
    a: 'Nos desplazamos a tu lugar: finca, hotel, restaurante, casa privada o cualquier espacio contratado. Solo necesitamos una zona habilitada para las actividades.',
  },
  {
    q: '¿Qué necesitamos preparar nosotros?',
    a: 'Nada. Llevamos todo el material necesario para las actividades. Solo necesitamos que haya un espacio mínimo de unos 20–30 m² para desarrollar las dinámicas con comodidad.',
  },
  {
    q: '¿Cuál es la edad mínima recomendada?',
    a: 'El servicio está pensado para niños a partir de 3-4 años. Las actividades se adaptan al rango de edades del grupo.',
  },
  {
    q: '¿Qué pasa si al final hay más niños de los previstos?',
    a: 'No hay problema. Si superáis los 12 participantes se aplica automáticamente el Pack Grande (2 monitores), que garantiza una atención adecuada para todos.',
  },
  {
    q: '¿Cuánto tiempo de antelación hay que reservar?',
    a: 'Recomendamos reservar con al menos 2-3 semanas de antelación, especialmente en fechas de alta demanda como primavera y verano. Consulta disponibilidad sin compromiso.',
  },
  {
    q: '¿El precio incluye el desplazamiento?',
    a: 'El precio base incluye el desplazamiento dentro de la provincia de Cuenca. Para eventos fuera de la provincia, consúltanos y te indicamos el coste adicional.',
  },
]

export default function EventosPage() {
  return (
    <main className="bg-white min-h-screen">

      {/* Breadcrumb */}
      <div className="bg-pm-bg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-pm-red transition-colors">Inicio</Link>
            <span>›</span>
            <Link href="/ocio" className="hover:text-pm-red transition-colors">Ocio</Link>
            <span>›</span>
            <span className="text-pm-navy font-semibold">Eventos y celebraciones</span>
          </nav>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="bg-pm-navy text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-pm-red/20 border border-pm-red/30 text-pm-red text-xs font-bold px-4 py-1.5 rounded-full mb-5">
                🎪 Animación infantil profesional · A domicilio
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-5">
                Los niños, felices.<br/>
                <span className="text-pm-red">Tú, tranquilo/a.</span>
              </h1>
              <p className="text-white/65 text-base leading-relaxed mb-8 max-w-lg">
                Nos encargamos de toda la animación infantil en tu evento.
                Llegamos con los monitores y el material, y creamos una experiencia única para los niños
                mientras tú disfrutas de la celebración.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['Bodas · Comuniones · Bautizos', 'Nos desplazamos a tu espacio', 'Material incluido', 'Desde 150 € + IVA'].map(b => (
                  <span key={b} className="bg-white/10 border border-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{b}</span>
                ))}
              </div>
              <a href="#reservar" className="inline-block bg-pm-red hover:bg-pm-red-dark text-white font-black px-8 py-4 rounded-xl transition-colors shadow-lg">
                Solicitar presupuesto →
              </a>
            </div>

            {/* Cards packs en el hero */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/15 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
                <div className="text-4xl mb-3">👨‍🏫</div>
                <div className="font-black text-xl mb-1">Pack Básico</div>
                <div className="text-pm-red text-3xl font-black">150 €</div>
                <div className="text-white/50 text-xs">+ IVA · hasta 12 niños</div>
                <div className="mt-3 text-white/70 text-xs">1 monitor · 2 horas</div>
              </div>
              <div className="bg-pm-red/20 border border-pm-red/40 rounded-2xl p-6 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pm-red text-white text-xs font-black px-3 py-1 rounded-full whitespace-nowrap">
                  +12 niños
                </div>
                <div className="text-4xl mb-3">👨‍🏫👨‍🏫</div>
                <div className="font-black text-xl mb-1">Pack Grande</div>
                <div className="text-pm-red text-3xl font-black">250 €</div>
                <div className="text-white/50 text-xs">+ IVA · sin límite</div>
                <div className="mt-3 text-white/70 text-xs">2 monitores · 2 horas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIPOS DE EVENTO ── */}
      <section className="bg-pm-bg py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-3">¿Para qué tipo de evento?</h2>
          <p className="text-gray-500 text-center text-sm mb-10">Nos adaptamos a cualquier celebración, dentro o fuera de nuestra instalación</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {TIPOS_EVENTO.map(({ label, icon, color }) => (
              <div key={label} className={`border rounded-2xl p-4 text-center ${color}`}>
                <div className="text-3xl mb-2">{icon}</div>
                <div className="font-bold text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKS COMPARATIVA ── */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-3">Nuestros packs</h2>
          <p className="text-gray-500 text-center text-sm mb-10">El pack se asigna automáticamente según el número de participantes</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pack Básico */}
            <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
              <div className="bg-pm-bg px-6 py-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-black text-pm-navy">Pack Básico</h3>
                  <span className="bg-pm-navy text-white text-xs font-bold px-3 py-1 rounded-full">Hasta 12 niños</span>
                </div>
                <div className="text-4xl font-black text-pm-navy">150 <span className="text-xl font-semibold text-gray-400">€ + IVA</span></div>
              </div>
              <div className="p-6 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-pm-navy pb-2 border-b border-gray-100 mb-3">
                  <span className="text-2xl">👨‍🏫</span> 1 monitor especializado · 2 horas
                </div>
                {INCLUYE_BASE.map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-500 font-bold shrink-0">✓</span>{item}
                  </div>
                ))}
              </div>
            </div>

            {/* Pack Grande */}
            <div className="border-2 border-pm-red rounded-2xl overflow-hidden">
              <div className="bg-pm-red-light px-6 py-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-black text-pm-navy">Pack Grande</h3>
                  <span className="bg-pm-red text-white text-xs font-bold px-3 py-1 rounded-full">Obligatorio +12</span>
                </div>
                <div className="text-4xl font-black text-pm-red">250 <span className="text-xl font-semibold text-gray-400">€ + IVA</span></div>
              </div>
              <div className="p-6 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-pm-navy pb-2 border-b border-gray-100 mb-3">
                  <span className="text-2xl">👨‍🏫👨‍🏫</span> 2 monitores · 2 horas
                </div>
                {INCLUYE_BASE.map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-pm-red font-bold shrink-0">✓</span>{item}
                  </div>
                ))}
                <div className="flex items-center gap-2 text-sm text-pm-red font-semibold mt-2 pt-2 border-t border-gray-100">
                  <span className="font-bold">+</span>Monitor adicional para grupos grandes
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXTRAS ── */}
      <section className="bg-pm-bg py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-3">Extras disponibles</h2>
          <p className="text-gray-500 text-center text-sm mb-10">Personaliza tu evento con estos servicios adicionales</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🎨', nombre: 'Pintacaras + tatuajes', precio: 50, desc: 'Pintacaras artístico y tatuajes temporales infantiles. Un clásico que encanta a todos los niños.' },
              { icon: '🤸', nombre: 'AirTrack', precio: 250, desc: 'Colchoneta hinchable profesional para saltos, acrobacias y actividades dinámicas. Garantía de diversión.' },
              { icon: '🎪', nombre: 'Pórtico aéreo', precio: 300, desc: 'Estructura portátil con telas aéreas para circo aéreo adaptado. Una experiencia espectacular y segura.' },
            ].map(({ icon, nombre, precio, desc }) => (
              <div key={nombre} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="text-5xl mb-4">{icon}</div>
                <div className="text-3xl font-black text-pm-navy mb-1">+{precio} €</div>
                <div className="font-bold text-pm-navy mb-3">{nombre}</div>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Horas extra */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-black text-pm-navy text-base mb-2 text-center">⏱ Horas adicionales</h3>
            <p className="text-sm text-gray-600 text-center mb-5">Los packs incluyen 2 horas. Puedes ampliar la duración por 40 € / hora / monitor</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-pm-bg rounded-xl p-4 border border-gray-200">
                <div className="font-black text-pm-navy text-sm mb-2">Pack Básico (1 monitor)</div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between"><span>1h extra</span><strong>40 €</strong></div>
                  <div className="flex justify-between"><span>2h extra</span><strong>80 €</strong></div>
                </div>
              </div>
              <div className="bg-pm-red-light rounded-xl p-4 border border-pm-red/20">
                <div className="font-black text-pm-navy text-sm mb-2">Pack Grande (2 monitores)</div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between"><span>1h extra</span><strong>80 €</strong></div>
                  <div className="flex justify-between"><span>2h extra</span><strong>160 €</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CALCULADORA + FORMULARIO ── */}
      <section className="bg-pm-bg py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <CalculadoraEventos />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-10">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group border border-gray-200 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-bold text-pm-navy text-sm hover:bg-pm-bg transition-colors list-none">
                  <span>{q}</span>
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-pm-red py-16 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-4xl mb-4">🎪</div>
          <h2 className="text-3xl font-black mb-3">¿Listo para hacer tu evento inolvidable?</h2>
          <p className="text-red-100 mb-8">Solicita tu presupuesto sin compromiso. Respondemos en menos de 24 horas.</p>
          <a href="#reservar" className="inline-block bg-white text-pm-red hover:bg-pm-red-light font-black px-10 py-4 rounded-xl transition-colors">
            Solicitar presupuesto
          </a>
        </div>
      </section>

    </main>
  )
}
