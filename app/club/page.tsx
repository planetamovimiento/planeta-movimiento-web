import Link from 'next/link'

export const metadata = {
  title: 'Club Deportivo Origen — Planeta Movimiento Cuenca',
  description:
    'El Club Deportivo Origen gestiona Planeta Movimiento en Cuenca. Circo, acrobacia, campamentos, extraescolares, eventos y mucho más para todas las edades.',
}

// ─── Todos los servicios activos ─────────────────────────────────────────────

type Servicio = {
  nombre: string
  desc: string
  edad: string
  icon: string
  href: string
  grad: string
  nuevo?: boolean
}

const CLUB_CLASES: Servicio[] = [
  {
    nombre: 'Escuela de Bienestar',
    desc: 'Pilates, Yoga y Baile para adultos. Lunes, miércoles y viernes de 09:30 a 10:30.',
    edad: 'Adultos',
    icon: '🧘',
    href: '/servicios/escuela-bienestar',
    grad: 'from-teal-600 to-cyan-700',
  },
  {
    nombre: 'Jiu-Jitsu Brasileño',
    desc: 'Arte marcial de suelo con instructores de Academia Adamas (Madrid). Sábados 11:30-13:30.',
    edad: '+16 años · 60 €/mes',
    icon: '🥋',
    href: '/servicios/jiu-jitsu',
    grad: 'from-slate-800 to-pm-navy',
  },
  {
    nombre: 'Circo Inclusivo',
    desc: 'Circo adaptado y psicomotricidad para personas con discapacidad intelectual. Con CADIG Crisol.',
    edad: 'Adultos con DI',
    icon: '♿',
    href: '/servicios/circo-inclusivo',
    grad: 'from-indigo-700 to-purple-800',
  },
]

const OCIO: Servicio[] = [
  {
    nombre: 'Celebración de Cumpleaños',
    desc: '2 horas de actividad guiada, juegos y merienda. Desde 11 € por participante.',
    edad: 'Todas las edades',
    icon: '🎂',
    href: '/servicios/cumpleanos',
    grad: 'from-pm-red to-pm-red-dark',
    nuevo: true,
  },
  {
    nombre: 'Campamentos',
    desc: 'Escuela de Superhéroes en Navidad, Semana Santa y 8 semanas de verano.',
    edad: 'Desde 4 años',
    icon: '🏕️',
    href: '/servicios/campamentos',
    grad: 'from-pm-navy to-pm-navy-md',
    nuevo: true,
  },
  {
    nombre: 'Días Sin Cole',
    desc: 'Festivos escolares de 9:00 a 14:00. Escuela de Superhéroes. 30 € + IVA.',
    edad: 'Desde 4 años',
    icon: '⚡',
    href: '/servicios/eventos',
    grad: 'from-amber-500 to-orange-600',
  },
  {
    nombre: 'Domingos en Familia',
    desc: 'Práctica libre todos los domingos de 11:00 a 13:00. 15 € / niño. Adultos gratis.',
    edad: 'Desde 2 años',
    icon: '👨‍👩‍👧‍👦',
    href: '/servicios/eventos',
    grad: 'from-emerald-600 to-emerald-800',
  },
  {
    nombre: 'Noche de Halloween',
    desc: 'Fiesta de pijamas temática anual. Gymkana, actividades nocturnas y churros al amanecer.',
    edad: '+10 años',
    icon: '🧟',
    href: '/servicios/eventos',
    grad: 'from-gray-900 to-orange-950',
    nuevo: true,
  },
]

const EDUCATIVO: Servicio[] = [
  {
    nombre: 'Excursiones Escolares',
    desc: '4 horas de acrobacia, aéreos, circo y expresión corporal por rotaciones. 09:00-13:00.',
    edad: 'Infantil · Primaria · Secundaria',
    icon: '🎒',
    href: '/servicios/excursiones',
    grad: 'from-pm-red to-orange-600',
    nuevo: true,
  },
  {
    nombre: 'Multideporte Extraescolar',
    desc: 'Nos desplazamos al colegio. 1 hora/sesión, 1-2 días/semana. Para AMPAs y colegios.',
    edad: 'Infantil (3-5) · Primaria (6-12)',
    icon: '🏃',
    href: '/servicios/extraescolares',
    grad: 'from-blue-600 to-pm-navy',
    nuevo: true,
  },
  {
    nombre: 'Curso Monitor Juvenil',
    desc: 'Titulación homologada Junta CLM. Julio 2026. Cuenca · Tarancón · Motilla. Con ARKHE.',
    edad: '+16 años',
    icon: '🎓',
    href: '/servicios/monitor-juvenil',
    grad: 'from-emerald-700 to-pm-navy',
    nuevo: true,
  },
]

const EVENTOS_EXT: Servicio[] = [
  {
    nombre: 'Animación en tu Evento',
    desc: 'Bodas, comuniones, bautizos y fiestas. Pack Básico 150 € / Pack Grande 250 €. + IVA.',
    edad: 'Todas las edades',
    icon: '🎉',
    href: '/servicios/eventos',
    grad: 'from-purple-700 to-pm-navy',
    nuevo: true,
  },
  {
    nombre: 'Talleres de Circo',
    desc: 'AirTrack, pórtico aéreo, malabares, pintacaras… Configurador con presupuesto en tiempo real.',
    edad: 'Ayuntamientos · Empresas · AMPAs',
    icon: '🎪',
    href: '/servicios/talleres',
    grad: 'from-pm-red to-pm-navy',
    nuevo: true,
  },
]

// ─── Componente tarjeta ──────────────────────────────────────────────────────
function TarjetaServicio({ s }: { s: Servicio }) {
  return (
    <Link href={s.href}
      className="group flex flex-col bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-200 hover:-translate-y-0.5">
      <div className={`relative bg-gradient-to-br ${s.grad} h-24 flex items-center justify-center shrink-0`}>
        <span className="text-4xl">{s.icon}</span>
        {s.nuevo && (
          <span className="absolute top-2.5 right-2.5 bg-pm-red text-white text-xs font-black px-2 py-0.5 rounded-full">
            Nuevo
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-black text-pm-navy text-sm leading-tight group-hover:text-pm-red transition-colors">
          {s.nombre}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed flex-1">{s.desc}</p>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs bg-pm-bg border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">{s.edad}</span>
          <span className="text-xs font-black text-pm-red flex items-center gap-1">
            Ver más
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Sección con título ──────────────────────────────────────────────────────
function SeccionServicios({ titulo, subtitulo, servicios, colorIcon }: {
  titulo: string; subtitulo: string; servicios: Servicio[]; colorIcon: string
}) {
  return (
    <section className="py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-2xl`}>{colorIcon}</span>
          <h2 className="text-2xl font-black text-pm-navy">{titulo}</h2>
        </div>
        <p className="text-gray-500 text-sm mb-8 pl-10">{subtitulo}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {servicios.map(s => <TarjetaServicio key={s.href + s.nombre} s={s} />)}
        </div>
      </div>
    </section>
  )
}

// ─── Página ──────────────────────────────────────────────────────────────────
export default function ClubPage() {
  const totalServicios = CLUB_CLASES.length + OCIO.length + EDUCATIVO.length + EVENTOS_EXT.length

  return (
    <main className="bg-pm-bg min-h-screen">

      {/* ── HERO ── */}
      <section className="bg-pm-navy text-white py-20 border-t-4 border-pm-red">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <nav className="text-sm text-gray-400 mb-8 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>›</span>
            <span className="text-white">Club</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Nombre del club */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="bg-pm-red text-white text-xs font-black px-3 py-1 rounded-full">
                  Temporada 2025-26 abierta
                </span>
                <span className="bg-white/10 text-white/70 text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
                  {totalServicios} actividades disponibles
                </span>
              </div>

              <div className="mb-2">
                <div className="text-pm-red text-sm font-black uppercase tracking-widest mb-1">Club Deportivo Origen</div>
                <h1 className="text-4xl sm:text-5xl font-black leading-tight">
                  Planeta<br/>Movimiento
                </h1>
              </div>

              <p className="text-white/65 text-base leading-relaxed mt-4 mb-8 max-w-lg">
                Circo, acrobacia, bienestar, campamentos, extraescolares, eventos y formación.
                Todo en un mismo espacio en Cuenca, gestionado por el <strong className="text-white">Club Deportivo Origen</strong>.
              </p>

              <div className="flex flex-wrap gap-3">
                <a href="#actividades" className="bg-pm-red hover:bg-pm-red-dark text-white font-black px-8 py-3.5 rounded-xl transition-colors">
                  Ver todas las actividades
                </a>
                <Link href="/actividades" className="border-2 border-white/30 text-white hover:bg-white/10 font-bold px-6 py-3.5 rounded-xl transition-colors text-sm">
                  🔍 Buscar por perfil
                </Link>
              </div>
            </div>

            {/* Stats del club */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { valor: totalServicios + '+', label: 'Actividades', icon: '🏅' },
                { valor: '3',  label: 'Sedes del curso monitor', icon: '📍' },
                { valor: '8',  label: 'Semanas de verano', icon: '☀️' },
                { valor: '5',  label: 'Perfiles de usuario', icon: '🎯' },
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

      {/* ── ABOUT CLUB DEPORTIVO ORIGEN ── */}
      <section className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-xs font-black text-pm-red uppercase tracking-widest mb-3">Quiénes somos</div>
              <h2 className="text-3xl font-black text-pm-navy mb-4">Club Deportivo Origen</h2>
              <p className="text-gray-600 text-base leading-relaxed mb-4">
                Somos el <strong className="text-pm-navy">Club Deportivo Origen</strong>, entidad gestora de las instalaciones de <strong className="text-pm-navy">Planeta Movimiento</strong> en Cuenca.
                Nuestro objetivo es acercar el deporte, el circo y el movimiento a todas las edades y perfiles.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Desde clases semanales para adultos hasta campamentos de verano, excursiones escolares, eventos privados y programas de formación. Creemos que el movimiento es la mejor herramienta para el desarrollo integral de las personas.
              </p>
            </div>
            <div className="bg-pm-bg rounded-2xl border border-gray-200 p-6">
              <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-4">El Club en cifras</div>
              <div className="space-y-3">
                {[
                  { icon: '🎓', texto: 'Monitores cualificados y especializados' },
                  { icon: '🛡️', texto: 'Instalaciones seguras y homologadas' },
                  { icon: '📅', texto: 'Actividades durante todo el año' },
                  { icon: '👶', texto: 'Para todas las edades, desde 2 años' },
                  { icon: '🤝', texto: 'Colaboraciones con CADIG, ARKHE y Academia Adamas' },
                  { icon: '🏛️', texto: 'Servicios para particulares, empresas y entidades' },
                ].map(({ icon, texto }) => (
                  <div key={texto} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="text-xl shrink-0">{icon}</span>{texto}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <div id="actividades" className="divide-y divide-gray-200">

        <div className="bg-pm-bg">
          <SeccionServicios
            titulo="Clases del Club"
            subtitulo="Actividades regulares semanales en nuestras instalaciones"
            servicios={CLUB_CLASES}
            colorIcon="🏅"
          />
        </div>

        <div className="bg-white">
          <SeccionServicios
            titulo="Ocio y tiempo libre"
            subtitulo="Campamentos, cumpleaños, eventos especiales y actividades en familia"
            servicios={OCIO}
            colorIcon="🎉"
          />
        </div>

        <div className="bg-pm-bg">
          <SeccionServicios
            titulo="Programas educativos"
            subtitulo="Excursiones escolares, extraescolares y formación para monitores"
            servicios={EDUCATIVO}
            colorIcon="📚"
          />
        </div>

        <div className="bg-white">
          <SeccionServicios
            titulo="Eventos y talleres externos"
            subtitulo="Nos desplazamos a tu evento con todo el material y los monitores"
            servicios={EVENTOS_EXT}
            colorIcon="🚐"
          />
        </div>
      </div>

      {/* ── BUSCADOR POR PERFIL ── */}
      <section className="bg-pm-navy py-14 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-2xl font-black mb-3">¿No sabes qué actividad elegir?</h2>
          <p className="text-white/60 text-sm mb-6">
            Usa nuestro buscador por perfil: selecciona tu edad o tipo de entidad y te mostramos todas las actividades pensadas para ti.
          </p>
          <Link href="/actividades"
            className="inline-block bg-pm-red hover:bg-pm-red-dark text-white font-black px-8 py-4 rounded-xl transition-colors shadow-lg">
            Buscar por perfil →
          </Link>
        </div>
      </section>

      {/* ── CTA CONTACTO ── */}
      <section className="bg-pm-red py-14 text-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-black mb-3">¿Tienes alguna pregunta?</h2>
          <p className="text-red-100 text-sm mb-8">
            Contáctanos y te ayudamos a encontrar la actividad perfecta para ti o para tu entidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+34969000000"
              className="inline-flex items-center justify-center gap-2 bg-white text-pm-red font-black px-8 py-3.5 rounded-xl transition-colors hover:bg-pm-red-light text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              969 000 000
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
