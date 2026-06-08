import Link from 'next/link'
import { Galeria } from '@/components/ui/Galeria'
import { BotonColaboracion } from './FormColaboracion'

export const metadata = {
  title: 'Circo Inclusivo — Psicomotricidad adaptada | Planeta Movimiento',
  description:
    'Programa de circo adaptado y psicomotricidad para personas adultas con discapacidad intelectual. En colaboración con la Asociación CADIG Crisol (Cuenca).',
}

const objetivosAreas = [
  {
    area: 'Área motriz y psicomotriz',
    color: 'bg-indigo-50 border-indigo-200',
    iconColor: 'text-indigo-600',
    icon: '🏃',
    items: [
      'Coordinación motriz general mediante circuitos adaptados',
      'Equilibrio estático y dinámico con diferentes materiales',
      'Control postural y conciencia corporal',
      'Habilidades motrices básicas adaptadas',
    ],
  },
  {
    area: 'Área de seguridad corporal',
    color: 'bg-sky-50 border-sky-200',
    iconColor: 'text-sky-600',
    icon: '🛡️',
    items: [
      'Respuestas de protección ante desequilibrio o caída',
      'Control corporal en distintos niveles de estabilidad',
      'Conductas seguras con materiales e interacción',
      'Reflejos básicos de apoyo y reacción',
    ],
  },
  {
    area: 'Área funcional y de autonomía',
    color: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-600',
    icon: '⭐',
    items: [
      'Seguimiento de rutinas básicas en las sesiones',
      'Comprensión de instrucciones sencillas adaptadas',
      'Participación autónoma en tareas funcionales',
      'Espera de turnos y respeto de normas de convivencia',
    ],
  },
  {
    area: 'Área social y emocional',
    color: 'bg-rose-50 border-rose-200',
    iconColor: 'text-rose-600',
    icon: '💛',
    items: [
      'Participación activa en actividades grupales',
      'Interacción positiva entre iguales y profesionales',
      'Confianza personal y seguridad en las propias capacidades',
      'Disfrute, motivación y bienestar mediante el juego',
    ],
  },
]

const actividades = [
  { nombre: 'Psicomotricidad y coordinación', icon: '🧠' },
  { nombre: 'Equilibrio y control corporal', icon: '⚖️' },
  { nombre: 'Reflejos y protección corporal', icon: '🛡️' },
  { nombre: 'Juegos cooperativos grupales', icon: '🤝' },
  { nombre: 'Circuitos motores adaptados', icon: '🔄' },
  { nombre: 'Circo adaptado y movimiento creativo', icon: '🎪' },
]

const materiales = [
  'Colchonetas blandas de diferentes texturas',
  'Airtracks y superficies de seguridad',
  'Camas elásticas',
  'Material de equilibrio y coordinación',
  'Elementos de circo adaptado',
  'Material psicomotriz y recreativo',
  'Recursos visuales y apoyos adaptados',
]

export default function CircoInclusivoPage() {
  return (
    <main className="bg-white min-h-screen">

      {/* Breadcrumb */}
      <div className="bg-pm-bg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-pm-red transition-colors">Inicio</Link>
            <span>›</span>
            <Link href="/club" className="hover:text-pm-red transition-colors">Club</Link>
            <span>›</span>
            <span className="text-pm-navy font-semibold">Circo inclusivo</span>
          </nav>
        </div>
      </div>

      {/* HERO — diseño diferente, más institucional */}
      <section className="bg-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Texto */}
            <div>
              {/* Badge colaboración */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-indigo-200 text-xs font-semibold px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                En colaboración con CADIG Crisol · Cuenca
              </div>

              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
                Circo inclusivo<br />
                <span className="text-indigo-300">y psicomotricidad</span>
              </h1>

              <p className="text-indigo-200 text-base leading-relaxed mb-6 max-w-lg">
                Un espacio <strong className="text-white">seguro, dinámico y motivador</strong> para personas adultas
                con discapacidad intelectual. Desarrollamos habilidades motrices, cognitivas y sociales
                a través del movimiento, el juego y las disciplinas circenses adaptadas.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { icon: '👥', texto: 'Máx. 7 participantes/grupo' },
                  { icon: '👩‍⚕️', texto: '5 profesionales por sesión' },
                  { icon: '📅', texto: 'Todos los miércoles' },
                  { icon: '📍', texto: 'Instalaciones Planeta Movimiento' },
                ].map(({ icon, texto }) => (
                  <span key={texto} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                    {icon} {texto}
                  </span>
                ))}
              </div>

              <BotonColaboracion />

              <p className="mt-4 text-indigo-400 text-xs">
                ¿Tu asociación quiere colaborar? Escríbenos y diseñamos un programa a medida.
              </p>
            </div>

            {/* Card visual — cartel inclusivo */}
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-2xl p-10 text-center shadow-2xl">
                <div className="text-6xl mb-4">♿🤸</div>
                <div className="text-white font-black text-2xl mb-2">Circo Adaptado</div>
                <div className="text-indigo-200 text-sm mb-6">Psicomotricidad · Equilibrio · Juego cooperativo</div>
                <div className="bg-white/10 rounded-xl p-4 text-left space-y-2">
                  <div className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-3">Programa CADIG Crisol</div>
                  <div className="flex items-center gap-2 text-sm text-white">
                    <span className="text-green-400">●</span> Sep 2026 – Jun 2027 activo
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white">
                    <span className="text-yellow-400">●</span> Verano Jun – Ago 2026 activo
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white">
                    <span className="text-indigo-300">●</span> 2 grupos · miércoles
                  </div>
                </div>
              </div>
              {/* Decoración */}
              <div className="absolute -top-3 -right-3 w-16 h-16 bg-indigo-400/20 rounded-full blur-xl" />
              <div className="absolute -bottom-3 -left-3 w-24 h-24 bg-purple-400/20 rounded-full blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* HORARIOS — 2 periodos */}
      <section className="bg-pm-bg py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-pm-navy mb-2 text-center">Organización de grupos y horarios</h2>
          <p className="text-gray-500 text-sm text-center mb-10">
            Grupos reducidos (máx. 7 personas) con 5 profesionales por sesión
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Periodo invierno */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="bg-indigo-800 text-white px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">🍂</div>
                <div>
                  <div className="font-black text-sm">Periodo escolar</div>
                  <div className="text-indigo-300 text-xs">Septiembre 2026 – Junio 2027</div>
                </div>
                <span className="ml-auto bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Activo</span>
              </div>
              <div className="p-6 space-y-3">
                <p className="text-xs text-gray-500 mb-4">Las sesiones se realizan los <strong className="text-pm-navy">miércoles por la mañana</strong></p>
                {[
                  { grupo: 'Grupo 1', horario: '11:00 – 12:00' },
                  { grupo: 'Grupo 2', horario: '12:00 – 13:00' },
                ].map(({ grupo, horario }) => (
                  <div key={grupo} className="flex items-center gap-4 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 bg-indigo-700 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                      {grupo.split(' ')[1]}
                    </div>
                    <div>
                      <div className="font-bold text-pm-navy text-sm">{grupo}</div>
                      <div className="text-indigo-600 font-black text-base">{horario}</div>
                    </div>
                    <div className="ml-auto text-xs text-gray-400">Miércoles</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Periodo verano */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="bg-orange-600 text-white px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">☀️</div>
                <div>
                  <div className="font-black text-sm">Periodo de verano</div>
                  <div className="text-orange-200 text-xs">Junio · Julio · Agosto 2026</div>
                </div>
                <span className="ml-auto bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">Próximo</span>
              </div>
              <div className="p-6 space-y-3">
                <p className="text-xs text-gray-500 mb-4">Las sesiones se realizan los <strong className="text-pm-navy">miércoles por la tarde</strong></p>
                {[
                  { grupo: 'Grupo 1', horario: '18:00 – 19:00' },
                  { grupo: 'Grupo 2', horario: '19:00 – 20:00' },
                ].map(({ grupo, horario }) => (
                  <div key={grupo} className="flex items-center gap-4 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                      {grupo.split(' ')[1]}
                    </div>
                    <div>
                      <div className="font-bold text-pm-navy text-sm">{grupo}</div>
                      <div className="text-orange-600 font-black text-base">{horario}</div>
                    </div>
                    <div className="ml-auto text-xs text-gray-400">Miércoles</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Equipo profesional */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-black text-pm-navy text-sm uppercase tracking-wider mb-5">Equipo profesional por sesión</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">Por parte de CADIG Crisol</div>
                <ul className="space-y-2">
                  {['Terapeuta del centro', 'Profesor/a de educación física'].map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"/>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-pm-bg rounded-xl p-4 border border-gray-200">
                <div className="text-xs font-bold text-pm-navy uppercase tracking-wider mb-3">Por parte de Planeta Movimiento</div>
                <ul className="space-y-2">
                  {['2 monitores especializados', '1 monitor de apoyo'].map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-pm-red rounded-full shrink-0"/>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500 text-center">
              <strong className="text-pm-navy">5 profesionales</strong> para un máximo de <strong className="text-pm-navy">7 participantes</strong> — atención cercana, estructurada y personalizada
            </p>
          </div>
        </div>
      </section>

      {/* OBJETIVOS */}
      <section className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-pm-navy mb-2 text-center">Objetivos del programa</h2>
          <p className="text-gray-500 text-sm text-center mb-10 max-w-2xl mx-auto">
            Trabajamos de forma lúdica, progresiva y adaptada cuatro áreas de desarrollo, respetando siempre los ritmos y capacidades individuales
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {objetivosAreas.map(({ area, color, iconColor, icon, items }) => (
              <div key={area} className={`rounded-2xl border p-6 ${color}`}>
                <div className={`flex items-center gap-2 mb-4 ${iconColor}`}>
                  <span className="text-xl">{icon}</span>
                  <h3 className="font-black text-pm-navy text-sm">{area}</h3>
                </div>
                <ul className="space-y-2">
                  {items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-gray-700 leading-relaxed">
                      <span className={`mt-0.5 font-black shrink-0 ${iconColor}`}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIVIDADES Y MATERIALES */}
      <section className="bg-pm-bg py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Actividades */}
            <div>
              <h2 className="text-xl font-black text-pm-navy mb-6">Contenido de las sesiones</h2>
              <div className="grid grid-cols-1 gap-3">
                {actividades.map(({ nombre, icon }) => (
                  <div key={nombre} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
                    <span className="text-xl shrink-0">{icon}</span>
                    <span className="text-sm font-semibold text-pm-navy">{nombre}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Materiales */}
            <div>
              <h2 className="text-xl font-black text-pm-navy mb-6">Material utilizado</h2>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3">
                {materiales.map(m => (
                  <div key={m} className="flex items-center gap-3 text-sm text-gray-700 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <span className="text-indigo-500 font-black shrink-0">→</span>
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METODOLOGÍA */}
      <section className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-pm-navy mb-2 text-center">Principios metodológicos</h2>
          <p className="text-gray-500 text-sm text-center mb-10">
            Intervención práctica, dinámica y siempre adaptada a cada persona
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { texto: 'Seguridad física y emocional', icon: '🛡️' },
              { texto: 'Adaptación individual', icon: '🎯' },
              { texto: 'Aprendizaje por el juego', icon: '🎮' },
              { texto: 'Acompañamiento constante', icon: '🤝' },
              { texto: 'Refuerzo positivo', icon: '⭐' },
              { texto: 'Rutinas estructuradas', icon: '📋' },
              { texto: 'Promoción de la autonomía', icon: '🌱' },
              { texto: 'Respeto a cada ritmo', icon: '🕐' },
            ].map(({ texto, icon }) => (
              <div key={texto} className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-xs font-semibold text-indigo-800 leading-tight">{texto}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEGUIMIENTO */}
      <section className="bg-pm-bg py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-pm-navy mb-10 text-center">Seguimiento y evaluación individualizada</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                tipo: 'Continuo', icono: '👁️', color: 'border-indigo-200 bg-indigo-50',
                desc: 'Observación directa en cada sesión, valorando participación, seguridad, motricidad y autonomía.',
              },
              {
                tipo: 'Mensual', icono: '📝', color: 'border-sky-200 bg-sky-50',
                desc: 'Informe individual con evolución motriz, nivel de autonomía, interacción social y seguimiento de rutinas.',
              },
              {
                tipo: 'Trimestral', icono: '📊', color: 'border-emerald-200 bg-emerald-50',
                desc: 'Valoración global de cada participante con análisis de avances y orientación de adaptaciones futuras.',
              },
            ].map(({ tipo, icono, color, desc }) => (
              <div key={tipo} className={`rounded-2xl border p-6 ${color}`}>
                <div className="text-3xl mb-3">{icono}</div>
                <div className="font-black text-pm-navy text-base mb-2">Evaluación {tipo}</div>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA COLABORACIÓN */}
      <section className="bg-indigo-900 py-16 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-4xl mb-4">🌍</div>
          <h2 className="text-3xl font-black mb-3">¿Tu entidad quiere colaborar?</h2>
          <p className="text-indigo-200 text-base leading-relaxed mb-3 max-w-xl mx-auto">
            Estamos abiertos a diseñar programas de circo adaptado y psicomotricidad para
            otras asociaciones, centros y entidades que trabajen con personas con discapacidad.
          </p>
          <p className="text-indigo-300 text-sm mb-8">
            Adaptamos el programa a vuestros participantes, horarios y objetivos específicos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <BotonColaboracion />
            <a href="mailto:info@planetamovimiento.com"
              className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors text-sm font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              info@planetamovimiento.com
            </a>
          </div>
        </div>
      </section>

      <Galeria slug="circo-inclusivo" titulo="Galería" subtitulo="Circo adaptado y psicomotricidad en acción" fondo="bg-pm-bg" />
    </main>
  )
}
