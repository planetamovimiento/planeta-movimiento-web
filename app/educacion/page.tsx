import Link from 'next/link'

export const metadata = {
  title: 'Educación a través del movimiento — Planeta Movimiento',
  description:
    'Programas educativos para colegios, institutos y AMPAs: excursiones escolares, multideporte extraescolar y formación de monitores. En Cuenca.',
}

const PILARES = [
  {
    titulo: 'Psicomotricidad',
    desc: 'Trabajamos el esquema corporal, la coordinación y el equilibrio a través del movimiento y el juego, con impacto directo en la concentración.',
  },
  {
    titulo: 'Trabajo en equipo',
    desc: 'Las actividades circenses y deportivas requieren confianza y cooperación. Los alumnos aprenden a comunicarse y apoyarse de forma natural.',
  },
  {
    titulo: 'Expresión y confianza',
    desc: 'El movimiento es también arte. Fomentamos la creatividad, la autoexpresión y la seguridad en uno mismo superando pequeños retos.',
  },
]

const PROGRAMAS = [
  {
    nombre: 'Excursiones Escolares',
    href: '/servicios/excursiones',
    desc: 'Una jornada de 4 horas por estaciones (acrobacia, aéreos, circo y expresión) en nuestras instalaciones. El grupo rota por todas las disciplinas.',
    datos: ['09:00 – 13:00', 'Infantil · Primaria · Secundaria', 'Grupos escolares'],
    grad: 'from-pm-red to-orange-600',
    cta: 'Solicitar presupuesto',
  },
  {
    nombre: 'Multideporte Extraescolar',
    href: '/servicios/extraescolares',
    desc: 'Nos desplazamos a tu colegio para impartir la extraescolar. Sesiones de 1 hora, 1-2 días por semana, con material y monitores incluidos.',
    datos: ['1 hora / sesión', 'Infantil (3-5) · Primaria (6-12)', 'Para AMPAs y centros'],
    grad: 'from-blue-600 to-pm-navy',
    cta: 'Solicitar información',
  },
  {
    nombre: 'Curso Monitor de Actividades Juveniles',
    href: '/servicios/monitor-juvenil',
    desc: 'Titulación homologada por la Junta de Castilla-La Mancha. Julio 2026 en Cuenca, Tarancón y Motilla. En colaboración con ARKHE.',
    datos: ['Julio 2026', 'Desde 16 años', 'Titulación oficial'],
    grad: 'from-emerald-700 to-pm-navy',
    cta: 'Descubre el curso',
  },
]

const PASOS = [
  { num: '1', titulo: 'Contacto', desc: 'Rellena el formulario del servicio que te interese. Te respondemos en 48 h.' },
  { num: '2', titulo: 'Propuesta', desc: 'Elaboramos una propuesta a medida según el tamaño y las necesidades del grupo.' },
  { num: '3', titulo: 'Coordinación', desc: 'Acordamos fechas, horarios y logística con el centro o el AMPA.' },
  { num: '4', titulo: 'En marcha', desc: 'Ponemos en marcha la actividad con nuestro equipo de monitores.' },
]

export default function EducacionPage() {
  return (
    <main className="bg-pm-bg min-h-screen">
      {/* HERO */}
      <section className="bg-pm-navy text-white py-20 px-4 border-t-4 border-pm-red">
        <div className="max-w-5xl mx-auto">
          <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>›</span>
            <span className="text-white">Educación</span>
          </nav>
          <div className="mb-4">
            <span className="bg-pm-red text-white text-xs font-bold px-3 py-1 rounded-full">Para colegios, institutos y AMPAs</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
            Educación a través<br />del movimiento
          </h1>
          <p className="text-white/65 text-xl max-w-2xl">
            Programas para centros educativos: excursiones, extraescolares y formación de monitores.
            Aprendizaje activo a través del circo y el deporte en Cuenca.
          </p>
        </div>
      </section>

      {/* PROPUESTA PEDAGÓGICA */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-pm-navy mb-3 text-center">Nuestra propuesta pedagógica</h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-12">
            El circo y las artes del movimiento desarrollan competencias que la educación tradicional no siempre cubre.
            Trabajamos tres ejes fundamentales:
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {PILARES.map(p => (
              <div key={p.titulo} className="bg-pm-bg rounded-2xl border border-gray-100 p-6">
                <h3 className="font-black text-pm-navy text-lg mb-2">{p.titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMAS REALES */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-pm-navy mb-3 text-center">Programas para centros educativos</h2>
          <p className="text-gray-500 text-center mb-10">Cada programa se adapta al ciclo educativo y a los objetivos del centro</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PROGRAMAS.map(prog => (
              <Link key={prog.nombre} href={prog.href}
                className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className={`bg-gradient-to-br ${prog.grad} px-5 py-5 text-white`}>
                  <h3 className="text-lg font-black leading-tight">{prog.nombre}</h3>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">{prog.desc}</p>
                  <ul className="space-y-1.5 mb-4">
                    {prog.datos.map(d => (
                      <li key={d} className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="text-pm-red font-bold">✓</span>{d}
                      </li>
                    ))}
                  </ul>
                  <span className="text-sm font-black text-pm-red flex items-center gap-1">
                    {prog.cta}
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESO */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-pm-navy mb-3 text-center">¿Cómo trabajamos con tu centro?</h2>
          <p className="text-gray-500 text-center mb-10">Sencillo, rápido y sin compromiso</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {PASOS.map(paso => (
              <div key={paso.num} className="text-center">
                <div className="w-14 h-14 bg-pm-red text-white font-black text-2xl rounded-full flex items-center justify-center mx-auto mb-3">
                  {paso.num}
                </div>
                <h3 className="font-black text-pm-navy mb-2">{paso.titulo}</h3>
                <p className="text-gray-500 text-sm">{paso.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-pm-navy py-16 px-4 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-3">¿Hablamos sobre tu centro?</h2>
          <p className="text-white/65 mb-8">Elige el programa que encaja con tu colegio, instituto o AMPA y solicita información sin compromiso.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/servicios/excursiones" className="bg-pm-red hover:bg-pm-red-dark text-white font-black px-8 py-3.5 rounded-xl transition-colors">
              Excursiones escolares
            </Link>
            <Link href="/servicios/extraescolares" className="border-2 border-white/40 text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-xl transition-colors">
              Extraescolares
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
