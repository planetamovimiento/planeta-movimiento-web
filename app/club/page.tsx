import Link from 'next/link'
import ClubCTA from './ClubCTA'

export const metadata = {
  title: 'Club Planeta Movimiento — Clases semanales de circo y acrobacia',
  description: 'Únete al Club Planeta Movimiento. Clases semanales de acrobacia, malabares, trapecio y equilibrio para todas las edades en Cuenca.',
}

const DISCIPLINAS = [
  {
    icon: '🤸',
    nombre: 'Acrobacia de suelo',
    edadMin: 4,
    duracion: '60 min/sesión',
    dias: 'Lunes y miércoles',
    precio: '45€/mes',
    color: 'bg-red-50 border-pm-red',
  },
  {
    icon: '🎪',
    nombre: 'Malabares',
    edadMin: 6,
    duracion: '60 min/sesión',
    dias: 'Martes y jueves',
    precio: '40€/mes',
    color: 'bg-blue-50 border-blue-300',
  },
  {
    icon: '🎡',
    nombre: 'Trapecio y aéreos',
    edadMin: 8,
    duracion: '75 min/sesión',
    dias: 'Viernes',
    precio: '55€/mes',
    color: 'bg-purple-50 border-purple-300',
  },
  {
    icon: '⚖️',
    nombre: 'Equilibrio y contorsión',
    edadMin: 6,
    duracion: '60 min/sesión',
    dias: 'Sábados',
    precio: '45€/mes',
    color: 'bg-green-50 border-green-300',
  },
]

const NIVELES = [
  { nombre: 'Iniciación', desc: 'Primeros pasos en la disciplina. Sin experiencia necesaria. Juego y descubrimiento.', color: 'bg-gray-200', textColor: 'text-gray-700' },
  { nombre: 'Intermedio', desc: 'Consolidación de habilidades básicas. Pequeñas rutinas y combinaciones.', color: 'bg-red-200', textColor: 'text-red-800' },
  { nombre: 'Avanzado', desc: 'Técnica depurada, combinaciones complejas y trabajo de coreografía.', color: 'bg-pm-red/70', textColor: 'text-white' },
  { nombre: 'Competición', desc: 'Preparación para exhibiciones y competiciones. Entrenamientos intensivos.', color: 'bg-pm-red', textColor: 'text-white' },
]

const HORARIOS = [
  { hora: '17:00 – 18:00', lun: 'Acrobacia', mar: '—', mie: 'Acrobacia', jue: '—', vie: '—', sab: '—' },
  { hora: '18:00 – 19:00', lun: '—', mar: 'Malabares', mie: '—', jue: 'Malabares', vie: '—', sab: '—' },
  { hora: '19:00 – 20:15', lun: '—', mar: '—', mie: '—', jue: '—', vie: 'Trapecio', sab: '—' },
  { hora: '10:00 – 11:00', lun: '—', mar: '—', mie: '—', jue: '—', vie: '—', sab: 'Equilibrio' },
]

const DIAS = ['hora', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab']
const DIAS_LABELS: Record<string, string> = { hora: 'Horario', lun: 'Lun', mar: 'Mar', mie: 'Mié', jue: 'Jue', vie: 'Vie', sab: 'Sáb' }

const CELL_COLOR: Record<string, string> = {
  Acrobacia: 'bg-red-100 text-pm-red font-medium',
  Malabares: 'bg-blue-100 text-blue-700 font-medium',
  Trapecio: 'bg-purple-100 text-purple-700 font-medium',
  Equilibrio: 'bg-green-100 text-green-700 font-medium',
}

export default function ClubPage() {
  return (
    <main>
      {/* HERO */}
      <section className="bg-pm-navy text-white py-20 px-4 border-t-4 border-pm-red">
        <div className="max-w-5xl mx-auto">
          <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>›</span>
            <span className="text-white">Club</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-pm-red text-white text-xs font-bold px-3 py-1 rounded-full">Temporada 2025-26 abierta</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
            Club Planeta<br/>Movimiento
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mb-8">
            Clases semanales de circo y acrobacia en Cuenca. Progresa a tu ritmo en un ambiente divertido, seguro y con monitores especializados.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#horarios" className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-8 py-3 rounded-xl transition-colors">
              Ver horarios
            </a>
            <Link href="/reservar" className="border-2 border-white text-white hover:bg-white hover:text-pm-navy font-bold px-8 py-3 rounded-xl transition-colors">
              Contactar
            </Link>
          </div>
        </div>
      </section>

      {/* QUÉ ES EL CLUB */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black text-pm-navy mb-4">¿Qué es el Club?</h2>
            <p className="text-gray-600 mb-4">
              El Club Planeta Movimiento es un programa de clases semanales diseñado para que niños, jóvenes y adultos aprendan y progresen en las artes del circo y la acrobacia a lo largo de la temporada.
            </p>
            <p className="text-gray-600">
              Con grupos reducidos y monitores titulados, cada alumno recibe una atención personalizada que le permite avanzar según su nivel y objetivos. Más que clases, es una comunidad.
            </p>
          </div>
          <div className="bg-pm-bg rounded-2xl p-8">
            <h3 className="text-lg font-bold text-pm-navy mb-4">Beneficios del Club</h3>
            <ul className="space-y-3">
              {[
                'Clases semanales en grupos reducidos',
                'Progresión por niveles certificada',
                'Monitores especializados y titulados',
                'Descuentos en eventos y talleres',
                'Comunidad activa de alumnos',
                'Seguro deportivo incluido',
              ].map((b) => (
                <li key={b} className="flex items-center gap-3 text-gray-700">
                  <span className="text-pm-red font-black text-lg">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* DISCIPLINAS */}
      <section className="bg-pm-bg py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-pm-navy mb-3 text-center">Disciplinas del Club</h2>
          <p className="text-gray-500 text-center mb-10">Elige tu disciplina favorita o combina varias</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {DISCIPLINAS.map((d) => (
              <div key={d.nombre} className={`bg-white rounded-2xl border-2 p-6 ${d.color}`}>
                <div className="text-4xl mb-3">{d.icon}</div>
                <h3 className="text-xl font-black text-pm-navy mb-2">{d.nombre}</h3>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>🧒 Desde {d.edadMin} años</li>
                  <li>⏱ {d.duracion}</li>
                  <li>📅 {d.dias}</li>
                  <li className="font-bold text-pm-navy">💰 {d.precio}</li>
                </ul>
                <Link href="/reservar" className="inline-block bg-pm-red hover:bg-pm-red-dark text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
                  Apuntarse
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NIVELES */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-pm-navy mb-3 text-center">Sistema de niveles</h2>
          <p className="text-gray-500 text-center mb-12">Progresa de forma estructurada con objetivos claros</p>
          <div className="grid sm:grid-cols-4 gap-4">
            {NIVELES.map((nivel, i) => (
              <div key={nivel.nombre} className="relative">
                {i < NIVELES.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-full w-full h-0.5 bg-gray-200 z-0" style={{ width: '100%' }} />
                )}
                <div className={`relative z-10 ${nivel.color} rounded-2xl p-6 h-full`}>
                  <div className={`text-xs font-black uppercase tracking-wider mb-1 ${nivel.textColor} opacity-60`}>Nivel {i + 1}</div>
                  <div className={`font-black text-lg mb-2 ${nivel.textColor}`}>{nivel.nombre}</div>
                  <p className={`text-sm ${nivel.textColor} opacity-80`}>{nivel.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HORARIOS */}
      <section className="bg-pm-bg py-20 px-4" id="horarios">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-pm-navy mb-3 text-center">Horarios</h2>
          <p className="text-gray-500 text-center mb-10">Temporada 2025-2026</p>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-pm-navy text-white">
                  {DIAS.map((d) => (
                    <th key={d} className="py-3 px-4 text-sm font-bold text-center">{DIAS_LABELS[d]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HORARIOS.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-3 px-4 text-sm font-bold text-pm-navy whitespace-nowrap">{row.hora}</td>
                    {(['lun', 'mar', 'mie', 'jue', 'vie', 'sab'] as const).map((d) => {
                      const val = row[d]
                      return (
                        <td key={d} className="py-3 px-4 text-center text-sm">
                          {val !== '—' ? (
                            <span className={`inline-block px-2 py-1 rounded-lg text-xs ${CELL_COLOR[val] ?? ''}`}>{val}</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA FORMULARIO */}
      <section className="bg-pm-red py-20 px-4 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-3">Reserva tu plaza para la próxima temporada</h2>
          <p className="text-red-100 mb-10">Las plazas son limitadas. Apúntate y te avisamos cuando se abra la inscripción.</p>
          <ClubCTA />
        </div>
      </section>
    </main>
  )
}
