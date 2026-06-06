import Link from 'next/link'
import FormExcursion from './FormExcursion'

export const metadata = {
  title: 'Excursiones Escolares — Planeta Movimiento Cuenca',
  description:
    'Excursión escolar educativa y deportiva en Cuenca. 4 horas de circo, acrobacia, aéreos y expresión corporal por rotaciones. Solicita presupuesto sin compromiso.',
}

const CLIENTES = [
  { label: 'Colegios',             icon: '🏫' },
  { label: 'Institutos',           icon: '🎓' },
  { label: 'AMPAs',                icon: '👨‍👩‍👧' },
  { label: 'Asociaciones juveniles', icon: '🤝' },
  { label: 'Fin de curso',         icon: '🎉' },
  { label: 'Jornadas convivencia', icon: '💚' },
]

const BENEFICIOS = [
  { icon: '🏃', titulo: 'Actividad física real', desc: 'Los alumnos están en movimiento constante durante 4 horas. No hay tiempos muertos.' },
  { icon: '🤝', titulo: 'Trabajo en equipo',     desc: 'Todas las dinámicas fomentan la cooperación, el respeto y la comunicación entre iguales.' },
  { icon: '🎯', titulo: 'Aprendizaje activo',    desc: 'Aprenden disciplinas nuevas de forma experiencial, superando retos y descubriendo sus capacidades.' },
  { icon: '💪', titulo: 'Confianza personal',    desc: 'Las actividades están diseñadas para que cada alumno alcance sus propios logros a su ritmo.' },
  { icon: '🎨', titulo: 'Creatividad y expresión', desc: 'A través del circo y la expresión corporal desarrollan su dimensión artística y comunicativa.' },
  { icon: '🛡', titulo: 'Entorno seguro',        desc: 'Instalaciones homologadas, monitores certificados y materiales de seguridad profesionales.' },
]

const ESTACIONES = [
  {
    numero: '01',
    nombre: 'Acrobacia y Parkour',
    icon: '🤸',
    color: 'from-pm-red to-pm-red-dark',
    colorLight: 'bg-pm-red-light border-pm-red/20',
    colorText: 'text-pm-red',
    actividades: ['Circuitos de parkour', 'Saltos y desplazamientos', 'Retos de coordinación', 'Acrobacias adaptadas'],
    objetivos: ['Agilidad', 'Coordinación', 'Confianza', 'Control corporal'],
  },
  {
    numero: '02',
    nombre: 'Aéreos',
    icon: '🎪',
    color: 'from-purple-600 to-purple-800',
    colorLight: 'bg-purple-50 border-purple-200',
    colorText: 'text-purple-700',
    actividades: ['Telas aéreas', 'Aro aéreo', 'Iniciación a técnicas aéreas'],
    objetivos: ['Fuerza', 'Coordinación', 'Superación personal', 'Conciencia corporal'],
  },
  {
    numero: '03',
    nombre: 'Circo',
    icon: '🎭',
    color: 'from-amber-500 to-orange-600',
    colorLight: 'bg-amber-50 border-amber-200',
    colorText: 'text-amber-700',
    actividades: ['Equilibrios', 'Malabares', 'Juegos circenses'],
    objetivos: ['Concentración', 'Destreza', 'Coordinación óculo-manual', 'Creatividad'],
  },
  {
    numero: '04',
    nombre: 'Baile y Expresión',
    icon: '💃',
    color: 'from-emerald-500 to-emerald-700',
    colorLight: 'bg-emerald-50 border-emerald-200',
    colorText: 'text-emerald-700',
    actividades: ['Juegos rítmicos', 'Coreografías sencillas', 'Dinámicas grupales', 'Expresión corporal'],
    objetivos: ['Expresión artística', 'Ritmo', 'Trabajo en equipo', 'Comunicación'],
  },
]

const CRONOGRAMA = [
  { hora: '09:00', evento: 'Llegada y bienvenida', desc: 'Recibimos al grupo, explicamos la dinámica del día y formamos los 4 equipos.', tipo: 'inicio' },
  { hora: '09:15', evento: 'Calentamiento grupal', desc: 'Activación física y juegos de presentación para entrar en calor juntos.', tipo: 'actividad' },
  { hora: '09:30', evento: 'Rotación 1', desc: 'Cada grupo en su primera estación con monitor especializado.', tipo: 'rotacion' },
  { hora: '10:15', evento: 'Rotación 2', desc: 'Cambio de estación. Todos los grupos avanzan.', tipo: 'rotacion' },
  { hora: '11:00', evento: '☀️ Pausa de almuerzo', desc: 'Descanso activo. Los alumnos almuerzan, se hidratan y descansan.', tipo: 'descanso' },
  { hora: '11:20', evento: 'Rotación 3', desc: 'Vuelta a la actividad. Tercera estación del día.', tipo: 'rotacion' },
  { hora: '12:05', evento: 'Rotación 4', desc: 'Última estación. Todos habrán completado el circuito completo.', tipo: 'rotacion' },
  { hora: '12:50', evento: '🎉 Actividad final conjunta', desc: 'Los 4 grupos se juntan para una dinámica de cierre grupal y muestra de lo aprendido.', tipo: 'final' },
  { hora: '13:00', evento: 'Despedida y recogida', desc: 'Cierre de la jornada y despedida del grupo.', tipo: 'fin' },
]

const FAQ = [
  { q: '¿Cuántos alumnos pueden venir?', a: 'Trabajamos con grupos desde 20 hasta 200 alumnos. El sistema de rotaciones se adapta al tamaño del grupo, dividiendo en subgrupos de entre 12 y 25 alumnos por estación.' },
  { q: '¿Qué edades son adecuadas?', a: 'Desde Educación Infantil hasta Bachillerato. Las actividades de cada estación se adaptan al nivel y edad del grupo. Siempre indicad el curso al solicitar.' },
  { q: '¿Necesitan ropa especial?', a: 'Ropa cómoda y deportiva, y calzado deportivo sin taco. No se necesita ningún material especial por parte del alumnado.' },
  { q: '¿Los profesores acompañantes participan?', a: 'Pueden participar si lo desean. Normalmente los docentes acompañan al grupo y colaboran con los monitores, pero no es obligatorio que realicen las actividades.' },
  { q: '¿Qué pasa si un alumno tiene alguna limitación física?', a: 'Todas las actividades tienen adaptaciones. Indicadlo en las observaciones y nuestros monitores prepararán alternativas inclusivas para cada caso.' },
  { q: '¿Cómo se gestiona el precio?', a: 'El precio depende del número de alumnos y las necesidades del grupo. Al recibir vuestra solicitud, os enviamos una propuesta detallada sin compromiso en menos de 48 horas.' },
]

export default function ExcursionesPage() {
  return (
    <main className="bg-white min-h-screen">

      {/* Breadcrumb */}
      <div className="bg-pm-bg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-pm-red transition-colors">Inicio</Link>
            <span>›</span>
            <Link href="/educacion" className="hover:text-pm-red transition-colors">Educación</Link>
            <span>›</span>
            <span className="text-pm-navy font-semibold">Excursiones escolares</span>
          </nav>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="bg-pm-navy text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-pm-red/20 border border-pm-red/30 text-pm-red text-xs font-bold px-4 py-1.5 rounded-full mb-5">
                🏫 Excursiones escolares · Cuenca
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-5">
                La excursión que<br/>
                <span className="text-pm-red">nunca olvidarán.</span>
              </h1>
              <p className="text-white/65 text-base leading-relaxed mb-8">
                Una mañana completa de circo, acrobacia, aéreos y expresión corporal.
                4 horas de aprendizaje activo por rotaciones donde todos los alumnos participan constantemente.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['09:00 – 13:00', '4 horas de actividad', '4 estaciones por rotación', 'Todas las edades'].map(b => (
                  <span key={b} className="bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{b}</span>
                ))}
              </div>
              <a href="#solicitar" className="inline-block bg-pm-red hover:bg-pm-red-dark text-white font-black px-8 py-4 rounded-xl transition-colors shadow-lg">
                Solicitar presupuesto →
              </a>
            </div>

            {/* Visual de las 4 estaciones en el hero */}
            <div className="grid grid-cols-2 gap-3">
              {ESTACIONES.map(e => (
                <div key={e.numero} className={`bg-gradient-to-br ${e.color} rounded-2xl p-5 text-white`}>
                  <div className="text-3xl mb-2">{e.icon}</div>
                  <div className="text-white/60 text-xs font-black uppercase tracking-wider">Estación {e.numero}</div>
                  <div className="font-black text-sm mt-0.5">{e.nombre}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CLIENTES ── */}
      <section className="bg-pm-bg py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">
            Pensado para
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

      {/* ── BENEFICIOS EDUCATIVOS ── */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-pm-navy mb-3">¿Qué aporta a tus alumnos?</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Una experiencia diseñada para desarrollar competencias clave a través del movimiento y el juego cooperativo.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFICIOS.map(({ icon, titulo, desc }) => (
              <div key={titulo} className="bg-pm-bg border border-gray-200 rounded-2xl p-6 hover:shadow-sm transition-shadow">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-black text-pm-navy text-base mb-2">{titulo}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="bg-pm-bg py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-pm-navy mb-3">¿Cómo funciona la jornada?</h2>
            <p className="text-gray-500 text-sm">Al llegar, el grupo se divide en 4 equipos que rotan por todas las estaciones</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-pm-navy text-white px-6 py-4 flex items-center gap-3">
              <div className="text-2xl">🔄</div>
              <div>
                <div className="font-black text-base">Sistema de rotaciones</div>
                <div className="text-white/60 text-xs">4 grupos · 4 estaciones · Todos experimentan todo</div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {ESTACIONES.map((e, i) => (
                  <div key={e.numero} className={`${e.colorLight} border rounded-xl p-4 text-center`}>
                    <div className="text-3xl mb-2">{e.icon}</div>
                    <div className={`font-black text-sm ${e.colorText}`}>Estación {e.numero}</div>
                    <div className="font-semibold text-pm-navy text-xs mt-1">{e.nombre}</div>
                    <div className={`text-xs mt-2 font-bold ${e.colorText}`}>~45 min</div>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 mt-4">
                ↩ Cada grupo rota por las 4 estaciones · Todos los alumnos completan el circuito completo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ESTACIONES DETALLE ── */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-12">Las 4 estaciones de actividad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ESTACIONES.map(e => (
              <div key={e.numero} className={`border-2 rounded-2xl overflow-hidden ${e.colorLight}`}>
                <div className={`bg-gradient-to-r ${e.color} text-white px-6 py-5 flex items-center gap-4`}>
                  <div className="text-4xl">{e.icon}</div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider opacity-70">Estación {e.numero}</div>
                    <h3 className="text-xl font-black">{e.nombre}</h3>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-2 gap-4">
                  <div>
                    <div className={`text-xs font-black ${e.colorText} uppercase tracking-wider mb-2`}>Actividades</div>
                    <ul className="space-y-1.5">
                      {e.actividades.map(a => (
                        <li key={a} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className={`text-xs font-black ${e.colorText}`}>→</span>{a}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className={`text-xs font-black ${e.colorText} uppercase tracking-wider mb-2`}>Desarrollan</div>
                    <div className="flex flex-wrap gap-1.5">
                      {e.objetivos.map(o => (
                        <span key={o} className={`text-xs font-semibold px-2 py-1 rounded-full border ${e.colorLight} ${e.colorText}`}>{o}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CRONOGRAMA ── */}
      <section className="bg-pm-bg py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-10">Horario completo de la jornada</h2>
          <div className="relative">
            {/* Línea vertical */}
            <div className="absolute left-[72px] top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-4">
              {CRONOGRAMA.map(({ hora, evento, desc, tipo }) => {
                const colorMap: Record<string, string> = {
                  inicio:   'bg-pm-navy text-white',
                  actividad:'bg-blue-100 text-blue-700',
                  rotacion: 'bg-pm-red text-white',
                  descanso: 'bg-amber-100 text-amber-700',
                  final:    'bg-green-100 text-green-700',
                  fin:      'bg-gray-100 text-gray-600',
                }
                const dotColor: Record<string, string> = {
                  inicio: 'bg-pm-navy', actividad: 'bg-blue-500',
                  rotacion: 'bg-pm-red', descanso: 'bg-amber-500',
                  final: 'bg-green-500', fin: 'bg-gray-400',
                }
                return (
                  <div key={hora} className="flex items-start gap-4 pl-2">
                    {/* Hora */}
                    <div className="w-16 shrink-0 text-right">
                      <span className="text-xs font-black text-pm-navy">{hora}</span>
                    </div>
                    {/* Punto en línea */}
                    <div className={`w-4 h-4 rounded-full ${dotColor[tipo]} shrink-0 mt-0.5 border-2 border-white shadow-sm z-10`}/>
                    {/* Contenido */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-pm-navy text-sm">{evento}</span>
                        {tipo === 'rotacion' && <span className="text-xs bg-pm-red text-white px-2 py-0.5 rounded-full font-bold">45 min</span>}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-10">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group border border-gray-200 rounded-2xl overflow-hidden">
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

      {/* ── FORMULARIO SOLICITUD ── */}
      <section className="bg-pm-bg py-16" id="solicitar">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-pm-red text-white text-xs font-black px-4 py-1.5 rounded-full mb-4">
              📋 Sin compromiso · Respuesta en 48 horas
            </span>
            <h2 className="text-3xl font-black text-pm-navy mb-3">Solicita tu presupuesto</h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Rellena el formulario y nuestro equipo preparará una propuesta personalizada adaptada al tamaño y necesidades de tu grupo.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <FormExcursion />
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-pm-navy py-14 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-4xl mb-4">🎓</div>
          <h2 className="text-3xl font-black mb-3">¿Hablamos?</h2>
          <p className="text-white/65 mb-8 text-sm">
            Si prefieres contactarnos directamente para resolver dudas antes de solicitar presupuesto, estamos disponibles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#solicitar" className="inline-block bg-pm-red hover:bg-pm-red-dark text-white font-black px-8 py-3.5 rounded-xl transition-colors">
              Solicitar presupuesto
            </a>
            <a href="https://wa.me/34657604665" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-xl transition-colors">
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
