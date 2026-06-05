import Link from 'next/link'
import EducacionForm from './EducacionForm'

export const metadata = {
  title: 'Educación a través del movimiento — Planeta Movimiento',
  description: 'Programas educativos de circo y acrobacia para colegios, extraescolares y campamentos escolares en Cuenca.',
}

const PILARES = [
  {
    icon: '🧠',
    titulo: 'Psicomotricidad',
    desc: 'Trabajamos el esquema corporal, la coordinación y el equilibrio a través del movimiento y el juego. Impacto directo en el rendimiento académico y la concentración.',
  },
  {
    icon: '🤝',
    titulo: 'Trabajo en equipo',
    desc: 'Las actividades circenses requieren confianza y cooperación. Los alumnos aprenden a comunicarse, liderar y apoyarse mutuamente de forma natural.',
  },
  {
    icon: '🎭',
    titulo: 'Expresión corporal',
    desc: 'El circo es arte en movimiento. Fomentamos la creatividad, la autoexpresión y la confianza en uno mismo a través de la danza, el equilibrio y las artes escénicas.',
  },
]

const PROGRAMAS = [
  {
    icon: '🏫',
    nombre: 'Visita de un día',
    desc: 'Una jornada completa en nuestras instalaciones. Talleres de circo adaptados al nivel educativo del grupo.',
    grupos: 'Grupos de 20-30 alumnos',
    precio: 'Desde 8€/alumno',
    edades: '5-16 años',
    incluye: ['Actividades de circo', 'Monitor especializado', 'Materiales', 'Seguro de accidentes'],
  },
  {
    icon: '📚',
    nombre: 'Programa trimestral',
    desc: 'Diez sesiones a lo largo del trimestre que complementan el currículo de educación física con artes circenses.',
    grupos: 'Grupos de 20-25 alumnos',
    precio: 'Desde 6€/alumno/sesión',
    edades: '6-14 años',
    incluye: ['10 sesiones de 60 min', 'Progresión pedagógica', 'Informe de seguimiento', 'Materiales incluidos'],
  },
  {
    icon: '🏕️',
    nombre: 'Campamento escolar',
    desc: 'Experiencia de convivencia de 3 a 5 días con actividades circenses, juegos cooperativos y talleres creativos.',
    grupos: 'Grupos de 15-35 alumnos',
    precio: 'Desde 120€/alumno',
    edades: '8-16 años',
    incluye: ['Alojamiento y manutención', 'Actividades todo el día', 'Monitores 24h', 'Seguro completo'],
  },
]

const ACTIVIDADES_EXTRAESCOLARES = [
  'Malabares y circo básico',
  'Acrobacia y voltereta',
  'Equilibrio y contorsión',
  'Trapecio (instalación propia)',
  'Psicomotricidad circense',
  'Expresión corporal',
]

const TESTIMONIOS = [
  {
    nombre: 'María González',
    cargo: 'Profesora de Ed. Física — CEIP Cervantes, Cuenca',
    texto: 'La visita a Planeta Movimiento fue una de las mejores experiencias del año para nuestros alumnos. Volvieron entusiasmados y mucho más motivados para las clases de educación física.',
  },
  {
    nombre: 'Carlos Moreno',
    cargo: 'Director — Colegio San Isidro, Cuenca',
    texto: 'El programa trimestral de extraescolares ha tenido una acogida fantástica. Los monitores son muy profesionales y los niños progresan de manera visible cada semana.',
  },
]

const PASOS = [
  { num: '1', titulo: 'Contacto', desc: 'Rellena el formulario o llámanos. Te respondemos en 24h.' },
  { num: '2', titulo: 'Reunión', desc: 'Nos reunimos (presencial o por videollamada) para entender vuestras necesidades.' },
  { num: '3', titulo: 'Propuesta', desc: 'Elaboramos una propuesta pedagógica y económica a medida.' },
  { num: '4', titulo: '¡Empezamos!', desc: 'Confirmamos fechas y ponemos en marcha el programa.' },
]

export default function EducacionPage() {
  return (
    <main>
      {/* HERO */}
      <section className="bg-pm-navy text-white py-20 px-4 border-t-4 border-pm-red">
        <div className="max-w-5xl mx-auto">
          <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>›</span>
            <span className="text-white">Educación</span>
          </nav>
          <div className="mb-4">
            <span className="bg-pm-red text-white text-xs font-bold px-3 py-1 rounded-full">Concertado con colegios</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
            Educación a través<br/>del movimiento
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl">
            Programas pedagógicos de circo y acrobacia que complementan la educación formal. Visitas, extraescolares y campamentos para colegios de Cuenca y alrededores.
          </p>
        </div>
      </section>

      {/* PROPUESTA PEDAGÓGICA */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-pm-navy mb-3 text-center">Nuestra propuesta pedagógica</h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-12">
            El circo y las artes del movimiento desarrollan habilidades esenciales que la educación tradicional no siempre cubre. Trabajamos tres ejes fundamentales:
          </p>
          <div className="grid sm:grid-cols-3 gap-8">
            {PILARES.map((p) => (
              <div key={p.titulo} className="text-center">
                <div className="text-5xl mb-4">{p.icon}</div>
                <h3 className="font-black text-pm-navy text-xl mb-3">{p.titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMAS */}
      <section className="bg-pm-bg py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-pm-navy mb-3 text-center">Programas para colegios</h2>
          <p className="text-gray-500 text-center mb-10">Adaptamos cada programa al ciclo educativo y a los objetivos del centro</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {PROGRAMAS.map((prog) => (
              <div key={prog.nombre} className="bg-white rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="text-4xl mb-3">{prog.icon}</div>
                <h3 className="font-black text-pm-navy text-xl mb-2">{prog.nombre}</h3>
                <p className="text-gray-500 text-sm mb-4 flex-1">{prog.desc}</p>
                <ul className="space-y-1.5 mb-4">
                  {prog.incluye.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-pm-red font-bold">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <div className="text-xs text-gray-400 mb-1">👶 {prog.edades} · 👥 {prog.grupos}</div>
                <div className="text-pm-red font-black text-lg mb-4">{prog.precio}</div>
                <a href="#formulario" className="block text-center bg-pm-navy hover:bg-pm-navy-md text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
                  Solicitar presupuesto
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXTRAESCOLARES */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-black text-pm-navy mb-4">🏃 Actividades extraescolares</h2>
              <p className="text-gray-600 mb-4">
                Impartimos actividades extraescolares directamente en tu colegio. Nuestros monitores se desplazan con el material necesario para llevar el circo al patio o al gimnasio.
              </p>
              <p className="text-gray-600 mb-6">
                Con un mínimo de 8 alumnos, podemos organizar sesiones semanales de 60 minutos durante todo el curso escolar. El precio incluye monitor, materiales y seguro.
              </p>
              <h3 className="font-bold text-pm-navy mb-3">Actividades disponibles:</h3>
              <div className="grid grid-cols-2 gap-2">
                {ACTIVIDADES_EXTRAESCOLARES.map((act) => (
                  <div key={act} className="bg-pm-bg rounded-xl px-3 py-2 text-sm text-gray-700 font-medium">
                    {act}
                  </div>
                ))}
              </div>
            </div>
            <div id="formulario">
              <h3 className="font-black text-pm-navy text-xl mb-4">Solicita información</h3>
              <EducacionForm />
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="bg-pm-bg py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-pm-navy mb-8 text-center">Lo que dicen los profesores</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {TESTIMONIOS.map((t) => (
              <div key={t.nombre} className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-gray-600 italic mb-4">"{t.texto}"</p>
                <div className="font-bold text-pm-navy text-sm">{t.nombre}</div>
                <div className="text-gray-400 text-xs">{t.cargo}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESO */}
      <section className="bg-pm-bg pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-pm-navy mb-3 text-center">Proceso de solicitud</h2>
          <p className="text-gray-500 text-center mb-10">Simple, rápido y sin compromiso</p>
          <div className="grid sm:grid-cols-4 gap-6">
            {PASOS.map((paso) => (
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
    </main>
  )
}
