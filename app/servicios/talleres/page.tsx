import Link from 'next/link'
import ConfiguradorTalleres from './ConfiguradorTalleres'

export const metadata = {
  title: 'Talleres de Circo para Eventos — Ayuntamientos, Empresas, AMPAs | Planeta Movimiento',
  description:
    'Talleres participativos de circo a medida para ayuntamientos, empresas, AMPAs y festivales. Configurador de presupuesto en tiempo real. Nos desplazamos a tu evento.',
}

const CLIENTES = [
  { label: 'Ayuntamientos',    icon: '🏛️' },
  { label: 'Diputaciones',     icon: '🏢' },
  { label: 'Empresas',         icon: '💼' },
  { label: 'Asociaciones',     icon: '🤝' },
  { label: 'Centros educativos', icon: '🏫' },
  { label: 'AMPAs',            icon: '👨‍👩‍👧' },
  { label: 'Ferias y festivales', icon: '🎪' },
  { label: 'Entidades públicas',  icon: '📋' },
]

const COMO_FUNCIONA = [
  { paso: '01', titulo: 'Nos desplazamos', desc: 'Llevamos todo el material, monitores y equipamiento de seguridad a tu ubicación.', icon: '🚐' },
  { paso: '02', titulo: 'Montaje completo', desc: 'Nuestro equipo monta todas las instalaciones antes del inicio del evento.', icon: '🔧' },
  { paso: '03', titulo: 'Actividad guiada', desc: 'Entre 3 y 4 horas de talleres participativos con monitores especializados.', icon: '🎭' },
  { paso: '04', titulo: 'Desmontaje y recogida', desc: 'Al finalizar recogemos todo sin que tengas que preocuparte de nada.', icon: '✅' },
]

export default function TalleresPage() {
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
            <span className="text-pm-navy font-semibold">Talleres participativos</span>
          </nav>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="bg-pm-navy text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-pm-red/20 border border-pm-red/30 text-pm-red text-xs font-bold px-4 py-1.5 rounded-full mb-5">
                🎪 Talleres de circo · Para grandes grupos
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-5">
                Tu evento,<br/>
                <span className="text-pm-red">a medida.</span>
              </h1>
              <p className="text-white/65 text-base leading-relaxed mb-8">
                Talleres participativos de circo para ayuntamientos, empresas, AMPAs y festivales.
                Configura tu propio taller, selecciona actividades y obtén un presupuesto automático en segundos.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['Nos desplazamos a tu ubicación', 'Material y montaje incluido', '3 – 4 horas de actividad', 'Desde 12 participantes'].map(b => (
                  <span key={b} className="bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{b}</span>
                ))}
              </div>
              <a href="#configurador" className="inline-block bg-pm-red hover:bg-pm-red-dark text-white font-black px-8 py-4 rounded-xl transition-colors shadow-lg">
                Configurar mi taller →
              </a>
            </div>

            {/* Tarjetas de módulos preview */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🤸', nombre: 'AirTrack',        precio: 250 },
                { icon: '🎪', nombre: 'Pórtico Aéreo',   precio: 300 },
                { icon: '🎭', nombre: 'Taller de Circo',  precio: 200 },
                { icon: '💧', nombre: 'Taller del Agua',  precio: 100 },
                { icon: '💄', nombre: 'Pintacaras',       precio: 100 },
                { icon: '🎨', nombre: 'Manualidades',     precio: 50  },
              ].map(({ icon, nombre, precio }) => (
                <div key={nombre} className="bg-white/5 border border-white/15 rounded-xl p-3 flex items-center gap-2 hover:bg-white/10 transition-colors">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <div className="text-white text-xs font-bold">{nombre}</div>
                    <div className="text-pm-red font-black text-sm">{precio} €</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CLIENTES ── */}
      <section className="bg-pm-bg py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
            Trabajamos con todo tipo de entidades
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {CLIENTES.map(({ label, icon }) => (
              <div key={label} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-pm-navy font-semibold shadow-sm">
                <span>{icon}</span>{label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="bg-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-pm-navy text-center mb-10">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {COMO_FUNCIONA.map(({ paso, titulo, desc, icon }, i) => (
              <div key={paso} className="text-center relative">
                {i < COMO_FUNCIONA.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-[60%] w-full h-0.5 bg-gray-200 z-0"/>
                )}
                <div className="relative z-10 w-16 h-16 bg-pm-navy rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
                  {icon}
                </div>
                <div className="text-xs font-black text-pm-red mb-1">{paso}</div>
                <div className="font-black text-pm-navy text-sm mb-2">{titulo}</div>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MONITORES INFO ── */}
      <section className="bg-pm-bg py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-pm-navy text-white rounded-2xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <div className="sm:col-span-2">
                <h3 className="font-black text-xl mb-2">👨‍🏫 Sistema de monitores</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Los monitores son <strong className="text-white">obligatorios</strong> y se calculan automáticamente.
                  Mínimo 2 monitores. 1 monitor por cada 12 participantes. Precio: <strong className="text-white">100 € / monitor</strong>.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { part: '≤24', mon: 2 }, { part: '25–36', mon: 3 },
                  { part: '37–48', mon: 4 }, { part: '49–60', mon: 5 },
                ].map(({ part, mon }) => (
                  <div key={part} className="bg-white/10 border border-white/15 rounded-xl p-3 text-center">
                    <div className="text-white font-black text-sm">{mon} monitores</div>
                    <div className="text-white/50 text-xs">{part} participantes</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONFIGURADOR ── */}
      <section className="bg-pm-bg py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-pm-red text-white text-xs font-black px-4 py-1.5 rounded-full mb-4">
              🎛️ Configurador de talleres
            </span>
            <h2 className="text-3xl font-black text-pm-navy mb-3">Diseña tu taller a medida</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Selecciona las actividades que quieres incluir y obtén un presupuesto automático en tiempo real.
              Ajusta el número de participantes y el sistema calcula los monitores necesarios.
            </p>
          </div>
          <ConfiguradorTalleres />
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-pm-red py-14 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-4xl mb-4">🎪</div>
          <h2 className="text-3xl font-black mb-3">¿Tienes un proyecto en mente?</h2>
          <p className="text-red-100 mb-6 text-sm">
            Si tienes dudas o necesitas una propuesta personalizada, contáctanos directamente. Nos adaptamos a cualquier necesidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#configurador" className="inline-block bg-white text-pm-red hover:bg-pm-red-light font-black px-8 py-3.5 rounded-xl transition-colors">
              Configurar taller →
            </a>
            <a href="tel:+34969000000" className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-xl transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              Llamar ahora
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
