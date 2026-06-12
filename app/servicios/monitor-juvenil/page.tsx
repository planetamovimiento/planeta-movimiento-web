import Link from 'next/link'
import { Galeria } from '@/components/ui/Galeria'

export const metadata = {
  title: 'Curso Monitor de Actividades Juveniles 2026 — Planeta Movimiento × Actividades ARKHE',
  description:
    'Curso de Monitor de Actividades Juveniles en Cuenca, Tarancón y Motilla del Palancar. Del 6 al 31 de julio de 2026. Titulación homologada por la Junta de Castilla-La Mancha. Inscripción vía Actividades ARKHE.',
}

// ─── Configuración de sedes — actualizar URLs al activar inscripción ──────────
const SEDES = [
  {
    ciudad: 'Cuenca',
    color: 'from-pm-red to-pm-red-dark',
    colorLight: 'bg-pm-red-light border-pm-red/20',
    colorText: 'text-pm-red',
    fechas: '6 – 31 julio 2026',
    horario: 'Lunes a viernes · 10:00 – 14:00',
    plazas: 'Plazas limitadas',
    foto: '/fotos/monitor-juvenil/cuenca.webp',
    url: 'https://www.actividadesarkhe.com/actividad/preinscripcion-curso-monitores-cuenca/',
  },
  {
    ciudad: 'Tarancón',
    color: 'from-emerald-600 to-emerald-800',
    colorLight: 'bg-emerald-50 border-emerald-200',
    colorText: 'text-emerald-700',
    fechas: '6 – 31 julio 2026',
    horario: 'Lunes a viernes · 10:00 – 14:00',
    plazas: 'Plazas limitadas',
    foto: '/fotos/monitor-juvenil/tarancon.webp',
    url: 'https://www.actividadesarkhe.com/actividad/preinscripcion-curso-de-monitor-tarancon/',
  },
  {
    ciudad: 'Motilla del Palancar',
    color: 'from-indigo-600 to-indigo-800',
    colorLight: 'bg-indigo-50 border-indigo-200',
    colorText: 'text-indigo-700',
    fechas: '6 – 31 julio 2026',
    horario: 'Lunes a viernes · 10:00 – 14:00',
    plazas: 'Plazas limitadas',
    foto: '/fotos/monitor-juvenil/motilla.webp',
    url: 'https://www.actividadesarkhe.com/actividad/preinscripcion-curso-monitores-motilla-del-palancar/',
  },
]

const REQUISITOS = [
  { icon: '🎓', texto: 'Estudiantes de cualquier rama' },
  { icon: '⚽', texto: 'Monitores y deportistas' },
  { icon: '🏕️', texto: 'Futuros monitores de campamentos' },
  { icon: '👶', texto: 'Personas que quieran trabajar con infancia' },
  { icon: '🌱', texto: 'Jóvenes interesados en el ocio educativo' },
  { icon: '📈', texto: 'Personas que buscan ampliar su formación' },
]

const SALIDAS = [
  { icon: '🏕️', label: 'Campamentos de verano' },
  { icon: '🏙️', label: 'Campamentos urbanos' },
  { icon: '🎉', label: 'Actividades juveniles' },
  { icon: '📚', label: 'Programas educativos' },
  { icon: '☀️', label: 'Escuelas de verano' },
  { icon: '🤝', label: 'Asociaciones juveniles' },
  { icon: '⚽', label: 'Actividades deportivas' },
  { icon: '🎡', label: 'Empresas de ocio y tiempo libre' },
  { icon: '🏛️', label: 'Programas municipales' },
  { icon: '🎭', label: 'Animación sociocultural' },
]

const FAQ = [
  { q: '¿Necesito experiencia previa?', a: 'No. El curso está diseñado tanto para personas sin experiencia como para quienes ya tienen contacto con el sector. Se parte desde los fundamentos básicos de la intervención con grupos.' },
  { q: '¿Cuál es la edad mínima?', a: 'La edad mínima para realizar el curso es de 16 años. No hay edad máxima: la formación es válida para cualquier persona interesada en el sector del ocio educativo.' },
  { q: '¿La titulación es oficial?', a: 'Sí. La titulación está homologada y reconocida por la Junta de Castilla-La Mancha, lo que le da validez en todo el territorio nacional para trabajar como monitor en actividades juveniles.' },
  { q: '¿Cuántas horas de prácticas incluye?', a: 'El curso incluye 150 horas de prácticas en situaciones reales con grupos infantiles y juveniles, complementando así la formación teórica de julio.' },
  { q: '¿Dónde puedo trabajar después?', a: 'En campamentos de verano y urbanos, escuelas de verano, asociaciones juveniles, empresas de ocio, programas municipales, actividades deportivas y cualquier entidad que trabaje con infancia y juventud.' },
  { q: '¿Cómo me inscribo?', a: 'La inscripción se realiza directamente a través de la plataforma oficial de Actividades ARKHE. En esta página encontrarás los botones de inscripción para cada sede. Haz clic en tu localidad y completa el proceso en la web de Actividades ARKHE.' },
  { q: '¿En qué localidad puedo realizar el curso?', a: 'El curso se imparte en tres sedes: Cuenca, Tarancón y Motilla del Palancar. Puedes elegir la que mejor se adapte a tu ubicación y disponibilidad.' },
]

export default function MonitorJuvenilPage() {
  return (
    <main className="bg-white min-h-screen">

      {/* Breadcrumb */}
      <div className="bg-pm-bg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-pm-red transition-colors">Inicio</Link>
            <span>›</span>
            <Link href="/formacion" className="hover:text-pm-red transition-colors">Formación</Link>
            <span>›</span>
            <span className="text-pm-navy font-semibold">Monitor de Actividades Juveniles</span>
          </nav>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative bg-pm-navy overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-pm-red blur-3xl"/>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-emerald-500 blur-3xl"/>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Badge colaboración */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  🎓 Titulación oficial · Junta de Castilla-La Mancha
                </span>
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full">
                  En colaboración con Actividades ARKHE
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4 text-white">
                Curso de Monitor<br/>
                <span className="text-pm-red">de Actividades</span><br/>
                <span className="text-pm-red">Juveniles</span>
              </h1>

              <p className="text-white/65 text-base leading-relaxed mb-8">
                Fórmate para trabajar con infancia y juventud. Una titulación homologada que abre puertas
                a campamentos, escuelas de verano, programas municipales y mucho más.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {['6 – 31 julio 2026', '3 sedes disponibles', 'Desde 16 años', '150h de prácticas'].map(b => (
                  <span key={b} className="bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{b}</span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {SEDES.map(s => (
                  <a key={s.ciudad} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-pm-red hover:bg-pm-red-dark text-white font-black px-5 py-3 rounded-xl transition-colors shadow-lg text-sm">
                    Inscribirme en {s.ciudad}
                  </a>
                ))}
              </div>
            </div>

            {/* Tarjeta visual del curso (con foto de fondo) */}
            <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fotos/monitor-juvenil/hero.webp" alt="Curso de Monitor de Actividades Juveniles" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-pm-navy/75 to-pm-navy/90" />
              <div className="relative p-8">
                <div className="text-center mb-6">
                  <div className="text-white font-black text-2xl mb-1 [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]">Monitor Juvenil 2026</div>
                  <div className="text-white/70 text-sm">Planeta Movimiento × Actividades ARKHE</div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: '📅 Fechas', valor: '6 al 31 de julio 2026' },
                    { label: '⏰ Horario', valor: 'L-V · 10:00 – 14:00' },
                    { label: '📍 Sedes', valor: 'Cuenca · Tarancón · Motilla' },
                    { label: '📋 Prácticas', valor: '150 horas incluidas' },
                    { label: '✅ Titulación', valor: 'Homologada Junta CLM' },
                    { label: '👤 Edad mínima', valor: '16 años' },
                  ].map(({ label, valor }) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-white/15 text-sm">
                      <span className="text-white/70">{label}</span>
                      <span className="text-white font-semibold">{valor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRESENTACIÓN + ENTIDAD ── */}
      <section className="bg-pm-bg py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-black text-pm-navy mb-4">¿En qué te formarás?</h2>
              <p className="text-gray-600 text-base leading-relaxed mb-4">
                El Curso de Monitor de Actividades Juveniles te capacita para <strong className="text-pm-navy">diseñar, organizar y desarrollar actividades con grupos infantiles y juveniles</strong> en entornos educativos, deportivos, culturales y de ocio.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                La formación combina <strong className="text-pm-navy">contenidos teóricos y prácticos</strong>, preparando al alumnado para incorporarse de forma real y con garantías al sector del ocio educativo y el tiempo libre.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Al finalizar obtendrás una <strong className="text-pm-navy">titulación homologada reconocida por la Junta de Castilla-La Mancha</strong>, con plena validez para trabajar en todo el territorio nacional.
              </p>
            </div>

            {/* ARKHE card */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                <div className="w-14 h-14 bg-pm-navy rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0">
                  A
                </div>
                <div>
                  <div className="font-black text-pm-navy text-lg">Actividades ARKHE</div>
                  <div className="text-gray-500 text-sm">Entidad colaboradora en formación</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Actividades ARKHE es una empresa especializada en <strong className="text-pm-navy">formación educativa y juvenil</strong>.
                La inscripción y gestión del curso se realiza íntegramente a través de su plataforma oficial.
              </p>
              <div className="space-y-2">
                {[
                  '✅ Titulación homologada',
                  '✅ Reconocida por la Junta de Castilla-La Mancha',
                  '✅ Gestión oficial de inscripciones',
                  '✅ Formación avalada y certificada',
                ].map(item => (
                  <div key={item} className="text-sm text-gray-700">{item}</div>
                ))}
              </div>
              <a href="https://www.actividadesarkhe.com/categoria-actividad/cursos/" target="_blank" rel="noopener noreferrer"
                className="mt-4 flex items-center gap-2 text-pm-red hover:text-pm-red-dark font-bold text-sm transition-colors">
                Visitar actividadesarkhe.com
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── REQUISITOS ── */}
      <section className="bg-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-pm-navy mb-3">¿A quién va dirigido?</h2>
            <p className="text-gray-500 text-sm">Único requisito: tener <strong className="text-pm-navy">16 años o más</strong>. No se necesita experiencia previa.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {REQUISITOS.map(({ icon, texto }) => (
              <div key={texto} className="flex items-center gap-3 bg-pm-bg border border-gray-200 rounded-xl px-4 py-3.5">
                <span className="text-2xl shrink-0">{icon}</span>
                <span className="text-sm font-semibold text-pm-navy leading-tight">{texto}</span>
              </div>
            ))}
          </div>

          {/* Requisito edad destacado */}
          <div className="mt-6 bg-pm-navy text-white rounded-2xl p-5 flex items-center gap-5">
            <div className="text-5xl font-black text-pm-red shrink-0">16+</div>
            <div>
              <div className="font-black text-base mb-1">Único requisito: 16 años</div>
              <p className="text-white/65 text-sm">No se necesita ninguna titulación previa ni experiencia con grupos. El curso está diseñado para comenzar desde cero.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FECHAS Y HORARIO ── */}
      <section className="bg-pm-bg py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-10">Convocatoria 2026</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {[
              { icon: '📅', titulo: 'Fechas',   valor: '6 – 31 julio 2026',     desc: 'Formación teórica intensiva durante todo el mes de julio' },
              { icon: '⏰', titulo: 'Horario',  valor: '10:00 – 14:00',          desc: 'Lunes a viernes · 4 horas diarias de formación' },
              { icon: '📋', titulo: 'Prácticas', valor: '150 horas',             desc: 'Fase práctica posterior en entornos reales con grupos' },
            ].map(({ icon, titulo, valor, desc }) => (
              <div key={titulo} className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
                <div className="text-4xl mb-3">{icon}</div>
                <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">{titulo}</div>
                <div className="text-xl font-black text-pm-navy mb-2">{valor}</div>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Timeline del proceso */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-5">Proceso formativo completo</div>
            <div className="flex flex-col sm:flex-row items-stretch gap-0">
              {[
                { paso: '01', fase: 'Inscripción', desc: 'A través de la plataforma Actividades ARKHE', color: 'bg-pm-red text-white', icon: '✍️' },
                { paso: '02', fase: 'Formación teórica', desc: 'Julio 2026 · L-V · 10:00-14:00', color: 'bg-pm-navy text-white', icon: '📖' },
                { paso: '03', fase: 'Prácticas', desc: '150 horas en entornos reales', color: 'bg-emerald-600 text-white', icon: '🏕️' },
                { paso: '04', fase: 'Titulación', desc: 'Certificado homologado Junta CLM', color: 'bg-indigo-600 text-white', icon: '🎓' },
              ].map(({ paso, fase, desc, color, icon }, i) => (
                <div key={paso} className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 flex-1 relative">
                  {i < 3 && <div className="hidden sm:block absolute top-5 left-1/2 w-full h-0.5 bg-gray-200 z-0"/>}
                  <div className={`relative z-10 w-10 h-10 ${color} rounded-xl flex items-center justify-center text-lg shrink-0`}>{icon}</div>
                  <div className="sm:mt-1">
                    <div className="text-xs font-black text-gray-400">Paso {paso}</div>
                    <div className="font-black text-pm-navy text-sm">{fase}</div>
                    <div className="text-xs text-gray-500">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEDES ── */}
      <section className="bg-white py-16" id="sedes">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-pm-navy mb-3">Elige tu sede</h2>
            <p className="text-gray-500 text-sm">El curso se imparte simultáneamente en tres localidades de Castilla-La Mancha</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SEDES.map(s => (
              <div key={s.ciudad} className={`border-2 rounded-2xl overflow-hidden flex flex-col ${s.colorLight}`}>
                {/* Header con foto de fondo */}
                <div className="relative text-white px-6 py-10 text-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.foto} alt={s.ciudad} className="absolute inset-0 w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-85`} />
                  <div className="relative">
                    <h3 className="font-black text-2xl [text-shadow:0_2px_10px_rgba(0,0,0,0.4)]">{s.ciudad}</h3>
                    <div className="text-white/85 text-xs mt-1">Castilla-La Mancha</div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex-1 space-y-3">
                  <div className="text-sm">
                    <div className="font-semibold text-pm-navy">{s.fechas}</div>
                    <div className="text-xs text-gray-500">Formación teórica</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-pm-navy">{s.horario}</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-pm-navy">150 horas de prácticas</div>
                    <div className="text-xs text-gray-500">Incluidas en el curso</div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-bold ${s.colorText} bg-white border border-current/20 rounded-full px-3 py-1 self-start w-fit`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"/>
                    {s.plazas}
                  </div>
                </div>

                {/* CTA */}
                <div className="px-5 pb-5">
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                    className={`block w-full bg-gradient-to-br ${s.color} text-white font-black text-sm text-center py-3.5 rounded-xl transition-opacity hover:opacity-90 shadow-sm`}>
                    Inscribirme en {s.ciudad} →
                  </a>
                  <p className="text-center text-xs text-gray-400 mt-2">Inscripción vía plataforma Actividades ARKHE</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SALIDAS PROFESIONALES ── */}
      <section className="bg-pm-navy text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-3">¿Dónde podrás trabajar?</h2>
            <p className="text-white/60 text-sm max-w-lg mx-auto">
              Esta titulación te abre las puertas a un sector con una demanda creciente de profesionales cualificados
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {SALIDAS.map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-sm text-white font-semibold hover:bg-white/15 transition-colors">
                <span>{icon}</span>{label}
              </div>
            ))}
          </div>
          <div className="bg-white/5 border border-white/15 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">🚀</div>
            <p className="text-white/80 text-sm leading-relaxed max-w-xl mx-auto">
              Con este título podrás trabajar en cualquier entidad que desarrolle programas con menores en España.
              Es una de las formaciones con mayor inserción laboral en el sector del ocio educativo.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-pm-bg py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-10">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-bold text-pm-navy text-sm hover:bg-pm-bg transition-colors list-none">
                  <span>{q}</span>
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL — INSCRIPCIÓN ── */}
      <section className="bg-pm-red py-16 text-white" id="inscripcion">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h2 className="text-3xl font-black mb-3">¿Listo para dar el paso?</h2>
          <p className="text-red-100 text-sm mb-3">
            Elige tu sede e inscríbete directamente a través de la plataforma oficial de ARKHE.
          </p>
          <p className="text-red-200 text-xs mb-8">
            Plazas limitadas · Julio 2026 · Titulación homologada Junta de Castilla-La Mancha
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {SEDES.map(s => (
              <a key={s.ciudad} href={s.url} target="_blank" rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white text-pm-red hover:bg-pm-red-light font-black px-6 py-4 rounded-xl transition-colors shadow-lg text-sm">
                {s.ciudad}
              </a>
            ))}
          </div>

          <p className="mt-6 text-red-200 text-xs">
            La inscripción se gestiona íntegramente en la plataforma oficial de{' '}
            <a href="https://www.actividadesarkhe.com/categoria-actividad/cursos/" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-white transition-colors">
              actividadesarkhe.com
            </a>
          </p>
        </div>
      </section>

      <Galeria slug="monitor-juvenil" titulo="Galería" subtitulo="Formación de monitores de actividades juveniles" fondo="bg-pm-bg" />
    </main>
  )
}
