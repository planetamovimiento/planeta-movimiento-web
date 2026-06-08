import Link from 'next/link'
import { Galeria } from '@/components/ui/Galeria'
import FormExtraescolar from './FormExtraescolar'

export const metadata = {
  title: 'Actividades Extraescolares de Multideporte — Planeta Movimiento',
  description:
    'Actividad extraescolar de Multideporte directamente en tu colegio. Nos desplazamos con monitores y material. Para AMPAs, colegios y centros educativos de Cuenca.',
}

const CLIENTES = [
  { label: 'AMPAs',              icon: '👨‍👩‍👧' },
  { label: 'Colegios',           icon: '🏫' },
  { label: 'Centros educativos', icon: '🎓' },
  { label: 'Ayuntamientos',      icon: '🏛️' },
  { label: 'Asoc. de familias',  icon: '🤝' },
  { label: 'Entidades educativas', icon: '📚' },
]

const CAPACIDADES = [
  { icon: '⚖️', nombre: 'Equilibrio' },
  { icon: '🎯', nombre: 'Coordinación' },
  { icon: '💪', nombre: 'Fuerza' },
  { icon: '🤹', nombre: 'Destreza' },
  { icon: '⚡', nombre: 'Agilidad' },
  { icon: '🏃', nombre: 'Velocidad de reacción' },
  { icon: '🧭', nombre: 'Orientación espacial' },
  { icon: '🤝', nombre: 'Trabajo en equipo' },
  { icon: '🧩', nombre: 'Resolución de retos' },
  { icon: '🌱', nombre: 'Confianza y autonomía' },
]

const ACTIVIDADES = [
  'Juegos cooperativos', 'Circuitos de habilidades', 'Retos motores',
  'Deportes adaptados', 'Juegos tradicionales', 'Actividades de coordinación',
  'Dinámicas grupales', 'Juegos de estrategia', 'Psicomotricidad', 'Juegos de velocidad',
]

const BENEFICIOS_ALUMNOS = [
  {
    tipo: 'Físicos',
    color: 'bg-blue-50 border-blue-200',
    colorText: 'text-blue-700',
    icon: '💪',
    items: ['Mejora de la coordinación', 'Desarrollo de habilidades motrices', 'Mejora del equilibrio', 'Condición física básica', 'Hábitos de vida saludable'],
  },
  {
    tipo: 'Sociales',
    color: 'bg-green-50 border-green-200',
    colorText: 'text-green-700',
    icon: '🤝',
    items: ['Trabajo en equipo', 'Respeto por los compañeros', 'Cooperación', 'Comunicación', 'Integración'],
  },
  {
    tipo: 'Emocionales',
    color: 'bg-purple-50 border-purple-200',
    colorText: 'text-purple-700',
    icon: '💛',
    items: ['Confianza', 'Autonomía', 'Motivación', 'Superación personal', 'Gestión de emociones'],
  },
]

const BENEFICIOS_CENTRO = [
  { icon: '👨‍🏫', texto: 'Monitores cualificados y especializados' },
  { icon: '📋', texto: 'Programación estructurada y seguimiento' },
  { icon: '🎯', texto: 'Adaptación curricular a cada edad' },
  { icon: '⏰', texto: 'Flexibilidad horaria total' },
  { icon: '📦', texto: 'Material propio — el centro no necesita nada' },
  { icon: '✅', texto: 'Gestión sencilla para AMPA y secretaría' },
]

const FAQ = [
  { q: '¿Necesita el colegio disponer de material deportivo?', a: 'No. Nuestro equipo se desplaza con todo el material necesario. El centro únicamente necesita facilitar un espacio adecuado: gimnasio, patio cubierto o aula habilitada.' },
  { q: '¿Cuántos alumnos puede haber por grupo?', a: 'Trabajamos con grupos de entre 8 y 25 alumnos por sesión. Si el número es mayor, podemos organizar varios grupos en horarios distintos.' },
  { q: '¿Se puede iniciar en cualquier momento del curso?', a: 'Sí, aunque lo ideal es comenzar a principios de trimestre. Nos adaptamos a las necesidades del centro y del AMPA.' },
  { q: '¿Qué pasa si una sesión no puede celebrarse?', a: 'Planificamos recuperaciones o compensaciones para no perder sesiones. La coordinación con el centro es continua a lo largo de todo el curso.' },
  { q: '¿La actividad es apta para alumnos con necesidades especiales?', a: 'Sí. La metodología de Multideporte es inclusiva y se adapta a la diversidad del grupo. Indicadlo en las observaciones al solicitar información.' },
  { q: '¿Cómo se gestiona el pago con el AMPA?', a: 'La facturación se acuerda directamente con el AMPA o con el centro. Habitual: mensualidad fija o pago trimestral según el número de alumnos inscritos.' },
]

export default function ExtraescolaresPage() {
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
            <span className="text-pm-navy font-semibold">Extraescolares</span>
          </nav>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="bg-pm-navy text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-pm-red/20 border border-pm-red/30 text-pm-red text-xs font-bold px-4 py-1.5 rounded-full mb-5">
                🏫 Actividades extraescolares · En tu colegio
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-5">
                Llevamos el deporte<br/>
                <span className="text-pm-red">a tu colegio.</span>
              </h1>
              <p className="text-white/65 text-base leading-relaxed mb-8">
                Actividades extraescolares de <strong className="text-white">Multideporte</strong> impartidas directamente en el centro educativo.
                Monitores especializados, material propio y programación adaptada a cada edad.
                El AMPA no tiene que preocuparse de nada.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['Nos desplazamos al centro', 'Material incluido', '1 hora por sesión', 'Infantil y Primaria'].map(b => (
                  <span key={b} className="bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{b}</span>
                ))}
              </div>
              <a href="#solicitar" className="inline-block bg-pm-red hover:bg-pm-red-dark text-white font-black px-8 py-4 rounded-xl transition-colors shadow-lg">
                Solicitar información →
              </a>
            </div>

            {/* Visual propuesta */}
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/15 rounded-2xl p-6">
                <div className="font-black text-white text-lg mb-1">Multideporte</div>
                <div className="text-white/60 text-sm mb-4">La extraescolar más completa para el desarrollo integral</div>
                <div className="flex flex-wrap gap-2">
                  {['Infantil (3-5)', 'Primaria (6-12)', '1h/sesión', '1-2 días/semana'].map(b => (
                    <span key={b} className="bg-pm-red/20 border border-pm-red/30 text-pm-red text-xs font-bold px-2.5 py-1 rounded-full">{b}</span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/15 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">🚐</div>
                  <div className="text-white font-bold text-sm">Nos desplazamos</div>
                  <div className="text-white/50 text-xs mt-1">Venimos a vuestro centro</div>
                </div>
                <div className="bg-white/5 border border-white/15 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">📦</div>
                  <div className="text-white font-bold text-sm">Material propio</div>
                  <div className="text-white/50 text-xs mt-1">El centro no necesita nada</div>
                </div>
                <div className="bg-white/5 border border-white/15 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">👨‍🏫</div>
                  <div className="text-white font-bold text-sm">Monitor experto</div>
                  <div className="text-white/50 text-xs mt-1">Certificado y con experiencia</div>
                </div>
                <div className="bg-white/5 border border-white/15 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">📋</div>
                  <div className="text-white font-bold text-sm">Programación</div>
                  <div className="text-white/50 text-xs mt-1">Estructurada por curso</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLIENTES ── */}
      <section className="bg-pm-bg py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Dirigido a</p>
          <div className="flex flex-wrap justify-center gap-3">
            {CLIENTES.map(({ label, icon }) => (
              <div key={label} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-pm-navy font-semibold shadow-sm">
                <span>{icon}</span>{label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUÉ ES MULTIDEPORTE ── */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-pm-red/10 text-pm-red text-xs font-bold px-3 py-1 rounded-full mb-4">
                🏅 Nuestra propuesta
              </div>
              <h2 className="text-3xl font-black text-pm-navy mb-4">¿Qué es Multideporte?</h2>
              <p className="text-gray-600 text-base leading-relaxed mb-4">
                Multideporte es una actividad extraescolar que combina <strong className="text-pm-navy">diferentes disciplinas deportivas y propuestas lúdicas</strong> en un mismo programa semanal.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Cada mes trabajamos capacidades físicas y habilidades motrices distintas a través de dinámicas variadas y motivadoras. Los contenidos cambian periódicamente para que los alumnos siempre encuentren algo nuevo.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Nuestro objetivo <strong className="text-pm-navy">no es la competición temprana</strong>, sino fomentar hábitos saludables, el gusto por el deporte y el desarrollo integral de los niños a través del juego.
              </p>
            </div>
            <div className="bg-pm-bg rounded-2xl border border-gray-200 p-6">
              <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-4">Capacidades que trabajamos</div>
              <div className="grid grid-cols-2 gap-2">
                {CAPACIDADES.map(({ icon, nombre }) => (
                  <div key={nombre} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                    <span className="text-lg shrink-0">{icon}</span>
                    <span className="text-xs font-semibold text-pm-navy">{nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── METODOLOGÍA ── */}
      <section className="bg-pm-bg py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl font-black text-pm-navy mb-4">Aprender jugando</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                La metodología está basada en el <strong className="text-pm-navy">aprendizaje mediante el juego</strong>.
                Cada sesión es diferente: los alumnos no saben qué les espera, y eso genera motivación, expectativa y ganas de volver.
              </p>
              <div className="space-y-3">
                {[
                  { titulo: 'Progresión mensual', desc: 'Cada mes trabajamos una capacidad física de forma central, con propuestas variadas.' },
                  { titulo: 'Contenidos rotativos', desc: 'Los juegos y actividades cambian constantemente para mantener el interés.' },
                  { titulo: 'Adaptado a cada edad', desc: 'Infantil y Primaria tienen programaciones diferenciadas según su desarrollo motor.' },
                  { titulo: 'Siempre en positivo', desc: 'Refuerzo positivo, participación activa y asociar el deporte con experiencias buenas.' },
                ].map(({ titulo, desc }) => (
                  <div key={titulo} className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4">
                    <span className="text-pm-red font-black text-lg mt-0.5 shrink-0">✓</span>
                    <div>
                      <div className="font-black text-pm-navy text-sm">{titulo}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-4">Ejemplos de actividades a lo largo del curso</div>
              <div className="grid grid-cols-2 gap-2">
                {ACTIVIDADES.map(a => (
                  <div key={a} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 font-medium">
                    <span className="text-pm-red font-black">→</span>{a}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFICIOS ALUMNOS ── */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-3">Beneficios para los alumnos</h2>
          <p className="text-gray-500 text-sm text-center mb-10">Un programa que trabaja el desarrollo integral desde tres dimensiones</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BENEFICIOS_ALUMNOS.map(({ tipo, color, colorText, icon, items }) => (
              <div key={tipo} className={`border-2 rounded-2xl overflow-hidden ${color}`}>
                <div className="px-5 py-4 border-b border-current/10">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{icon}</span>
                    <h3 className={`font-black text-base ${colorText}`}>Beneficios {tipo}</h3>
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  {items.map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className={`font-black text-xs shrink-0 ${colorText}`}>✓</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFICIOS CENTRO ── */}
      <section className="bg-pm-navy py-14 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-center mb-3">Ventajas para el centro y el AMPA</h2>
          <p className="text-white/60 text-sm text-center mb-10">Gestionamos la actividad de principio a fin. Vuestra función es solo organizar la inscripción.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFICIOS_CENTRO.map(({ icon, texto }) => (
              <div key={texto} className="flex items-center gap-3 bg-white/5 border border-white/15 rounded-xl px-4 py-3.5">
                <span className="text-2xl shrink-0">{icon}</span>
                <span className="text-white/85 text-sm font-medium">{texto}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDADES Y GRUPOS ── */}
      <section className="bg-pm-bg py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-10">Grupos por edad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                nivel: 'Educación Infantil',
                rango: '3 a 5 años',
                icon: '🧒',
                color: 'from-amber-400 to-orange-500',
                colorLight: 'bg-amber-50 border-amber-200',
                colorText: 'text-amber-700',
                desc: 'Sesiones centradas en psicomotricidad, coordinación básica, juego simbólico y habilidades motrices fundamentales adaptadas a la etapa preescolar.',
                contenidos: ['Psicomotricidad global', 'Juegos sensoriales', 'Coordinación básica', 'Equilibrio inicial', 'Juego cooperativo simple'],
              },
              {
                nivel: 'Educación Primaria',
                rango: '6 a 12 años',
                icon: '🏃',
                color: 'from-blue-500 to-pm-navy',
                colorLight: 'bg-blue-50 border-blue-200',
                colorText: 'text-blue-700',
                desc: 'Programa más completo que trabaja todas las capacidades físicas a través de deportes adaptados, circuitos, retos y dinámicas grupales de mayor complejidad.',
                contenidos: ['Deportes adaptados', 'Circuitos de habilidades', 'Retos motores', 'Estrategia y táctica básica', 'Liderazgo y cooperación'],
              },
            ].map(({ nivel, rango, icon, color, colorLight, colorText, desc, contenidos }) => (
              <div key={nivel} className={`border-2 rounded-2xl overflow-hidden ${colorLight}`}>
                <div className={`bg-gradient-to-br ${color} text-white px-6 py-5 flex items-center gap-4`}>
                  <span className="text-4xl">{icon}</span>
                  <div>
                    <h3 className="text-xl font-black">{nivel}</h3>
                    <div className="text-white/70 text-sm">{rango}</div>
                  </div>
                </div>
                <div className="p-5">
                  <p className={`text-sm leading-relaxed mb-4 ${colorText}`}>{desc}</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {contenidos.map(c => (
                      <div key={c} className="flex items-center gap-2 text-xs text-gray-700 bg-white border border-gray-100 rounded-lg px-3 py-1.5">
                        <span className={`font-black text-xs ${colorText}`}>→</span>{c}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ORGANIZACIÓN Y HORARIOS ── */}
      <section className="bg-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-10">¿Cómo se organiza?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: '⏱', titulo: 'Duración de cada sesión', valor: '1 hora', desc: 'Sesiones dinámicas de 60 minutos con calentamiento, actividad principal y vuelta a la calma.' },
              { icon: '📅', titulo: 'Frecuencia semanal', valor: '1 ó 2 días', desc: 'Adaptable a las necesidades del centro. Lo más habitual es 2 días por semana.' },
              { icon: '🕐', titulo: 'Horario habitual', valor: 'Post lectivo', desc: 'Después del horario de clases o del comedor. Se acuerda con el centro y el AMPA.' },
            ].map(({ icon, titulo, valor, desc }) => (
              <div key={titulo} className="bg-pm-bg border border-gray-200 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">{icon}</div>
                <div className="font-black text-pm-navy text-2xl mb-1">{valor}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{titulo}</div>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Qué nos encargamos */}
          <div className="bg-pm-bg border border-gray-200 rounded-2xl p-6">
            <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-4">Nosotros nos encargamos de todo</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {['Planificación de sesiones', 'Material necesario', 'Desarrollo de la actividad', 'Monitores especializados', 'Seguimiento del grupo'].map(item => (
                <div key={item} className="bg-white border border-gray-200 rounded-xl p-3 text-center text-xs font-semibold text-pm-navy">
                  <span className="text-pm-red font-black block mb-1">✓</span>{item}
                </div>
              ))}
            </div>
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 text-center">
              📍 El colegio solo necesita facilitar el <strong>espacio</strong> (gimnasio, patio cubierto o aula habilitada)
            </div>
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

      {/* ── FORMULARIO ── */}
      <section className="bg-white py-16" id="solicitar">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-pm-red text-white text-xs font-black px-4 py-1.5 rounded-full mb-4">
              📋 Sin compromiso · Respuesta en 48 horas
            </span>
            <h2 className="text-3xl font-black text-pm-navy mb-3">Solicita información</h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Cuéntanos un poco sobre vuestro centro y os presentamos una propuesta personalizada sin ningún compromiso.
            </p>
          </div>
          <div className="bg-pm-bg rounded-2xl border border-gray-200 p-8 shadow-sm">
            <FormExtraescolar />
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-pm-red py-14 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-4xl mb-4">🏫</div>
          <h2 className="text-3xl font-black mb-3">¿Hablamos sin compromiso?</h2>
          <p className="text-red-100 text-sm mb-8">
            Si preferís conocernos antes, podemos organizarnos para presentaros personalmente la propuesta en vuestro centro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#solicitar" className="inline-block bg-white text-pm-red hover:bg-pm-red-light font-black px-8 py-3.5 rounded-xl transition-colors">
              Solicitar información
            </a>
            <a href="tel:+34657604665" className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-xl transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              Llamar ahora
            </a>
          </div>
        </div>
      </section>

      <Galeria slug="extraescolares" titulo="Galería" subtitulo="Multideporte y circo en el cole" fondo="bg-pm-bg" />
    </main>
  )
}
