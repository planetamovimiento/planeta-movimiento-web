import Link from 'next/link'
import FormLicitaciones from './FormLicitaciones'

export const metadata = {
  title: 'Licitaciones y contratos públicos — Planeta Movimiento',
  description:
    'Diseñamos, gestionamos y ejecutamos programas deportivos, educativos y de envejecimiento activo para ayuntamientos, administraciones y entidades mediante contratos y licitaciones públicas.',
}

const AREAS = [
  {
    titulo: 'Programas para residencias y centros de mayores',
    desc: 'Envejecimiento activo, actividad física adaptada, bienestar, participación social, estimulación cognitiva y programas de movimiento.',
    items: ['Envejecimiento activo', 'Actividad física adaptada', 'Bienestar y participación', 'Estimulación cognitiva'],
  },
  {
    titulo: 'Programas municipales de ocio y tiempo libre',
    desc: 'Gestión y desarrollo de programas de ocio educativo para ayuntamientos y administraciones locales.',
    items: ['Escuelas de verano', 'Campamentos urbanos', 'Programas juveniles', 'Actividades familiares y deportivas'],
  },
  {
    titulo: 'Ludotecas y espacios educativos',
    desc: 'Gestión integral de espacios infantiles y programas de dinamización y conciliación.',
    items: ['Ludotecas', 'Espacios infantiles', 'Programas educativos', 'Actividades de conciliación'],
  },
  {
    titulo: 'Programas deportivos municipales',
    desc: 'Diseño y ejecución de programas de actividad física y promoción de la salud.',
    items: ['Escuelas deportivas', 'Actividades extraescolares', 'Eventos deportivos', 'Promoción de la salud'],
  },
]

const CONTRATACION = [
  'Contratos menores', 'Contratos de servicios', 'Programas anuales',
  'Proyectos plurianuales', 'Licitaciones públicas',
]

const OFRECEMOS = [
  'Diseño del proyecto', 'Organización', 'Coordinación', 'Gestión de personal',
  'Desarrollo de actividades', 'Seguimiento', 'Evaluación de resultados',
]

const VENTAJAS = [
  { titulo: 'Experiencia contrastada', desc: 'Más de 10 años desarrollando programas deportivos, educativos y sociales.' },
  { titulo: 'Equipo multidisciplinar', desc: 'Monitores, educadores y especialistas en actividad física, circo y dinamización.' },
  { titulo: 'Capacidad de adaptación', desc: 'Ajustamos cada programa a las necesidades, edades y recursos de la entidad.' },
  { titulo: 'Enfoque educativo y deportivo', desc: 'Metodología propia orientada al aprendizaje activo y los hábitos saludables.' },
  { titulo: 'Impacto social', desc: 'Programas inclusivos que mejoran la calidad de vida y la cohesión de la comunidad.' },
  { titulo: 'Solución integral', desc: 'Nos encargamos de todo: del diseño a la evaluación, con un único interlocutor.' },
]

const COLABORACIONES = [
  { nombre: 'Residencia Sagrado Corazón', tipo: 'Envejecimiento activo' },
  { nombre: 'CADIG Crisol', tipo: 'Circo inclusivo' },
  { nombre: 'ARKHE', tipo: 'Formación juvenil' },
]

export default function LicitacionesPage() {
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
            <span className="text-pm-navy font-semibold">Licitaciones</span>
          </nav>
        </div>
      </div>

      {/* HERO institucional */}
      <section className="relative bg-pm-navy text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <span className="inline-flex items-center gap-2 border border-white/15 bg-white/5 text-white/80 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
            Administraciones públicas · Entidades · Contratos y licitaciones
          </span>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-5 max-w-3xl">
            Diseñamos, gestionamos y ejecutamos<br /><span className="text-pm-red">programas y contratos públicos</span>
          </h1>
          <p className="text-white/65 text-lg max-w-2xl mb-8">
            Desarrollamos programas deportivos, educativos, sociales y de envejecimiento activo para
            ayuntamientos, diputaciones, residencias y entidades, mediante contratos y licitaciones públicas.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#contacto" className="bg-pm-red hover:bg-pm-red-dark text-white font-black px-8 py-4 rounded-xl transition-colors shadow-lg">
              Hablemos de tu proyecto
            </a>
            <a href="#areas" className="border-2 border-white/30 text-white hover:bg-white/10 font-bold px-8 py-4 rounded-xl transition-colors">
              Ver áreas de trabajo
            </a>
          </div>
        </div>
      </section>

      {/* PRESENTACIÓN */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-pm-navy mb-5">Un socio solvente para tus programas</h2>
          <p className="text-gray-600 text-base leading-relaxed mb-4">
            Contamos con experiencia en la <strong className="text-pm-navy">gestión, coordinación y ejecución</strong> de
            programas para diferentes administraciones y entidades. Convertimos los objetivos de cada pliego en
            actividades reales, medibles y de calidad.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            Aportamos estructura, equipo cualificado y metodología propia para garantizar el correcto desarrollo de
            proyectos de larga duración, con plena capacidad organizativa y de respuesta.
          </p>
        </div>
      </section>

      {/* ÁREAS DE TRABAJO */}
      <section className="bg-pm-bg py-16" id="areas">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-3">Áreas de trabajo</h2>
          <p className="text-gray-500 text-center text-sm mb-10 max-w-xl mx-auto">Líneas de actuación que desarrollamos mediante contratos y licitaciones</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {AREAS.map(a => (
              <div key={a.titulo} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-pm-navy text-lg mb-2">{a.titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{a.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {a.items.map(i => (
                    <span key={i} className="bg-pm-bg border border-gray-200 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">{i}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIPOS DE CONTRATACIÓN + QUÉ OFRECEMOS */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-black text-pm-navy mb-4">Modalidades de contratación</h2>
            <p className="text-gray-500 text-sm mb-5">Nos adaptamos a la fórmula que mejor encaje con tu entidad.</p>
            <div className="space-y-2">
              {CONTRATACION.map(c => (
                <div key={c} className="flex items-center gap-3 bg-pm-bg border border-gray-100 rounded-xl px-4 py-3">
                  <svg className="w-5 h-5 text-pm-red shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span className="font-semibold text-pm-navy text-sm">{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-pm-navy mb-4">Qué ofrecemos</h2>
            <p className="text-gray-500 text-sm mb-5">Una solución completa, de principio a fin, con un único interlocutor.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {OFRECEMOS.map((o, i) => (
                <div key={o} className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3">
                  <span className="w-6 h-6 bg-pm-navy text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">{i + 1}</span>
                  <span className="font-semibold text-pm-navy text-sm">{o}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* POR QUÉ TRABAJAR CON NOSOTROS */}
      <section className="bg-pm-navy py-16 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-center mb-3">Por qué trabajar con nosotros</h2>
          <p className="text-white/55 text-center text-sm mb-10">Seriedad, capacidad técnica y compromiso con el impacto social</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VENTAJAS.map(v => (
              <div key={v.titulo} className="bg-white/5 border border-white/15 rounded-2xl p-6">
                <h3 className="font-black text-white text-base mb-2">{v.titulo}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
          {/* Colaboraciones / casos */}
          <div className="mt-10 pt-8 border-t border-white/10">
            <p className="text-center text-xs font-bold text-white/40 uppercase tracking-widest mb-5">Entidades con las que ya colaboramos</p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {COLABORACIONES.map(c => (
                <div key={c.nombre} className="text-center">
                  <div className="font-black text-white">{c.nombre}</div>
                  <div className="text-white/40 text-xs">{c.tipo}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FORMULARIO */}
      <section className="bg-pm-bg py-16" id="contacto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-pm-navy mb-3">Hablemos de tu proyecto</h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Cuéntanos qué necesita tu entidad y estudiaremos juntos cómo desarrollarlo. Sin compromiso.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <FormLicitaciones />
          </div>
        </div>
      </section>
    </main>
  )
}
