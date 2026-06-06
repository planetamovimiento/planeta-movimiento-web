import Link from 'next/link'

export const metadata = {
  title: 'Club Deportivo Origen — Circo y Acrobacia en Cuenca',
  description:
    'El Club Deportivo Origen es una asociación sin ánimo de lucro que ofrece clases semanales de circo, acrobacia, aéreos, malabares y equilibrios en Cuenca, en colaboración con Planeta Movimiento.',
}

// ─── Disciplinas del Club ─────────────────────────────────────────────────────
// Estas son las actividades propias del Club Deportivo Origen (sin ánimo de lucro)
const DISCIPLINAS = [
  {
    nombre: 'Gimnasia Acrobática',
    desc: 'Técnica de suelo, volteos, figuras y composición corporal en grupo. Disciplina reglada con progresión por niveles.',
    icon: '🤸',
    edad: 'Desde 4 años',
    grad: 'from-pm-red to-pm-red-dark',
    href: '/servicios/gimnasia-acrobatica',
  },
  {
    nombre: 'Parkour',
    desc: 'Desplazamiento urbano y acrobático. Saltos, equilibrios y control del cuerpo en el espacio.',
    icon: '🏃',
    grad: 'from-slate-700 to-pm-navy',
    edad: 'Desde 6 años',
    href: '/servicios/parkour',
  },
  {
    nombre: 'Telas Aéreas',
    desc: 'Técnica aérea en tela. Figuras, envolturas y trabajo de altura con progresión adaptada.',
    icon: '🎪',
    grad: 'from-purple-700 to-indigo-800',
    edad: 'Desde 6 años',
    href: '/servicios/telas-aereas',
  },
  {
    nombre: 'Malabares',
    desc: 'Coordinación, ritmo y destreza a través de pelotas, clavas, aros y otros elementos de circo.',
    icon: '🤹',
    grad: 'from-amber-500 to-orange-600',
    edad: 'Desde 5 años',
    href: '/servicios/malabares',
  },
  {
    nombre: 'Equilibrios',
    desc: 'Control postural, equilibrio estático y dinámico. Trabajo con objetos y compañero.',
    icon: '⚖️',
    grad: 'from-emerald-600 to-teal-700',
    edad: 'Desde 6 años',
    href: '/servicios/equilibrios',
  },
  {
    nombre: 'Escuela de Bienestar',
    desc: 'Pilates, Yoga y Baile para adultos. Lunes, miércoles y viernes de 09:30 a 10:30.',
    icon: '🧘',
    grad: 'from-teal-600 to-cyan-700',
    edad: 'Adultos',
    href: '/servicios/escuela-bienestar',
  },
  {
    nombre: 'Jiu-Jitsu Brasileño',
    desc: 'Arte marcial de suelo en colaboración con Academia Adamas (Madrid). Sábados 11:30-13:30.',
    icon: '🥋',
    grad: 'from-slate-800 to-pm-navy',
    edad: '+16 años · 60 €/mes',
    href: '/servicios/jiu-jitsu',
  },
  {
    nombre: 'Circo Inclusivo',
    desc: 'Circo adaptado y psicomotricidad para personas con discapacidad intelectual. Con CADIG Crisol.',
    icon: '♿',
    grad: 'from-indigo-700 to-purple-800',
    edad: 'Adultos con DI',
    href: '/servicios/circo-inclusivo',
  },
]

const NIVELES = [
  { nombre: 'Iniciación',  desc: 'Primeros pasos. Sin experiencia necesaria. Juego y descubrimiento.', color: 'bg-gray-100 border-gray-300',  text: 'text-gray-700' },
  { nombre: 'Intermedio',  desc: 'Consolidación de habilidades básicas. Pequeñas rutinas y combinaciones.', color: 'bg-pm-red-light border-pm-red/30', text: 'text-pm-red' },
  { nombre: 'Avanzado',    desc: 'Técnica depurada, combinaciones complejas y trabajo coreográfico.', color: 'bg-pm-red/80 border-pm-red', text: 'text-white' },
  { nombre: 'Competición', desc: 'Preparación para exhibiciones y competiciones. Entrenamientos intensivos.', color: 'bg-pm-red border-pm-red-dark', text: 'text-white' },
]

// ─── Tarjeta disciplina ───────────────────────────────────────────────────────
function TarjetaDisciplina({ d }: { d: typeof DISCIPLINAS[0] }) {
  return (
    <div className="group flex flex-col bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-200 transition-all">
      <div className={`bg-gradient-to-br ${d.grad} h-24 flex items-center justify-center`}>
        <span className="text-5xl">{d.icon}</span>
      </div>
      <div className="p-5 flex flex-col flex-1 gap-2">
        <h3 className="font-black text-pm-navy text-base">{d.nombre}</h3>
        <p className="text-xs text-gray-500 leading-relaxed flex-1">{d.desc}</p>
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs bg-pm-bg border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{d.edad}</span>
          <Link href={d.href}
            className="text-xs font-black text-pm-red flex items-center gap-1 hover:gap-2 transition-all">
            Apuntarse →
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function ClubPage() {
  return (
    <main className="bg-pm-bg min-h-screen">

      {/* ── HERO ── */}
      <section className="bg-pm-navy text-white py-20 border-t-4 border-pm-red">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <nav className="text-sm text-gray-400 mb-8 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>›</span>
            <span className="text-white">Club</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-pm-red text-white text-xs font-black px-3 py-1 rounded-full mb-5">
                Temporada 2025-26 abierta
              </span>
              <div className="text-pm-red text-sm font-black uppercase tracking-widest mb-2">Asociación sin ánimo de lucro</div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
                Club Deportivo<br/>Origen
              </h1>
              <p className="text-white/65 text-base leading-relaxed mb-8 max-w-lg">
                Somos un club deportivo fundado con el objetivo de acercar el circo y la acrobacia a todas las edades.
                Sin ánimo de lucro, con pasión por el movimiento y por crear comunidad.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#disciplinas" className="bg-pm-red hover:bg-pm-red-dark text-white font-black px-8 py-3.5 rounded-xl transition-colors">
                  Ver disciplinas
                </a>
                <a href="#inscripcion"
                  className="border-2 border-white/30 text-white hover:bg-white/10 font-bold px-6 py-3.5 rounded-xl transition-colors text-sm">
                  Apuntarse al club
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { valor: '8',    label: 'Disciplinas',           icon: '🏅' },
                { valor: '4',    label: 'Niveles de progresión', icon: '📈' },
                { valor: '↑',    label: 'Sin ánimo de lucro',    icon: '🤝' },
                { valor: '2025', label: 'Temporada activa',      icon: '📅' },
              ].map(({ valor, label, icon }) => (
                <div key={label} className="bg-white/5 border border-white/15 rounded-2xl p-5 text-center">
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="text-3xl font-black text-white">{valor}</div>
                  <div className="text-white/50 text-xs mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── QUÉ ES EL CLUB ── */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-xs font-black text-pm-red uppercase tracking-widest mb-3">Nuestra historia</div>
              <h2 className="text-3xl font-black text-pm-navy mb-4">¿Qué es el Club Deportivo Origen?</h2>
              <p className="text-gray-600 text-base leading-relaxed mb-4">
                El Club Deportivo Origen nació como una asociación deportiva <strong className="text-pm-navy">sin ánimo de lucro</strong> con el objetivo de fomentar el circo, la acrobacia y el movimiento como herramientas de desarrollo personal y social.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                El Club es el <strong className="text-pm-navy">origen de todo</strong>. Empezamos aquí, con vocación deportiva y educativa, y con el tiempo fuimos creciendo hasta poder crear una empresa independiente.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Hoy, el Club sigue activo con sus propias disciplinas y gestión, y desarrolla su actividad gracias al <strong className="text-pm-navy">acuerdo de colaboración con Planeta Movimiento S.L.</strong>, que nos cede el espacio y el material.
              </p>
            </div>

            {/* Relación Club – Planeta Movimiento */}
            <div className="space-y-4">
              <div className="bg-pm-bg border-2 border-gray-200 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-pm-navy rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">CDO</div>
                  <div>
                    <div className="font-black text-pm-navy text-sm">Club Deportivo Origen</div>
                    <div className="text-xs text-gray-500">Asociación sin ánimo de lucro · Entidad deportiva</div>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {['Gestión propia e independiente', 'Disciplinas deportivas de circo y acrobacia', 'Sin ánimo de lucro', 'Cuotas asequibles para sus socios'].map(i => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                      <span className="text-pm-red font-bold">✓</span>{i}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Flecha de colaboración */}
              <div className="flex items-center justify-center gap-3 text-xs text-gray-400 font-semibold">
                <div className="flex-1 h-px bg-gray-200"/>
                <span className="bg-pm-bg border border-gray-200 px-3 py-1 rounded-full whitespace-nowrap">
                  🤝 Acuerdo de colaboración · Cesión de espacio y material
                </span>
                <div className="flex-1 h-px bg-gray-200"/>
              </div>

              <div className="bg-pm-red-light border-2 border-pm-red/20 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-pm-red rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0">PM</div>
                  <div>
                    <div className="font-black text-pm-navy text-sm">Planeta Movimiento S.L.</div>
                    <div className="text-xs text-gray-500">Empresa comercial · Instalaciones y servicios</div>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {['Empresa independiente fundada después', 'Gestiona las instalaciones y el espacio', 'Campamentos, eventos, talleres y más', 'Cede espacio y material al Club'].map(i => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                      <span className="text-pm-red font-bold">✓</span>{i}
                    </li>
                  ))}
                </ul>
                <Link href="/" className="mt-3 inline-flex items-center gap-1 text-xs text-pm-red font-bold hover:underline">
                  Ver servicios de Planeta Movimiento →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DISCIPLINAS ── */}
      <section className="bg-pm-bg py-16" id="disciplinas">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-pm-navy mb-3">Disciplinas del Club</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Clases semanales impartidas por monitores especializados. Elige tu disciplina o combina varias.
              Grupos reducidos y progresión personalizada.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DISCIPLINAS.map(d => <TarjetaDisciplina key={d.nombre} d={d} />)}
          </div>
        </div>
      </section>

      {/* ── NIVELES ── */}
      <section className="bg-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-3">Sistema de niveles</h2>
          <p className="text-gray-500 text-sm text-center mb-10">Progresa de forma estructurada con objetivos claros en cada etapa</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {NIVELES.map((nivel, i) => (
              <div key={nivel.nombre} className="relative">
                {i < NIVELES.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-[55%] w-full h-0.5 bg-gray-200 z-0"/>
                )}
                <div className={`relative z-10 border-2 rounded-2xl p-6 h-full ${nivel.color}`}>
                  <div className={`text-xs font-black uppercase tracking-wider mb-1 opacity-60 ${nivel.text}`}>Nivel {i + 1}</div>
                  <div className={`font-black text-lg mb-2 ${nivel.text}`}>{nivel.nombre}</div>
                  <p className={`text-sm opacity-80 ${nivel.text}`}>{nivel.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFICIOS ── */}
      <section className="bg-pm-bg py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-10">¿Por qué apuntarte al Club?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '👥', titulo: 'Grupos reducidos',          desc: 'Atención personalizada en grupos pequeños para que progreses a tu ritmo.' },
              { icon: '📈', titulo: 'Progresión por niveles',    desc: 'Sistema de niveles claro con objetivos definidos en cada disciplina.' },
              { icon: '👨‍🏫', titulo: 'Monitores especializados', desc: 'Instructores titulados con experiencia en circo y artes acrobáticas.' },
              { icon: '💰', titulo: 'Sin ánimo de lucro',        desc: 'Las cuotas se establecen pensando en la accesibilidad, no en el beneficio.' },
              { icon: '🏟️', titulo: 'Instalaciones completas',   desc: 'Acceso a todo el espacio y material de Planeta Movimiento gracias al acuerdo de colaboración.' },
              { icon: '🤝', titulo: 'Comunidad activa',          desc: 'Más que clases: una comunidad de personas que comparten la pasión por el movimiento.' },
            ].map(({ icon, titulo, desc }) => (
              <div key={titulo} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-black text-pm-navy text-sm mb-2">{titulo}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA INSCRIPCIÓN ── */}
      <section className="bg-pm-red py-16 text-white text-center" id="inscripcion">
        <div className="max-w-xl mx-auto px-4">
          <div className="text-4xl mb-4">🏅</div>
          <h2 className="text-2xl font-black mb-3">Únete al Club Deportivo Origen</h2>
          <p className="text-red-100 text-sm mb-8">
            Las plazas son limitadas. Ponte en contacto con nosotros y te informamos de disponibilidad, horarios y cuotas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+34969000000"
              className="inline-flex items-center justify-center gap-2 bg-white text-pm-red font-black px-8 py-3.5 rounded-xl transition-colors hover:bg-pm-red-light text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              Llamar ahora
            </a>
            <a href="https://wa.me/34969000000" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-xl transition-colors text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
