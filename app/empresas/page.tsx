import Link from 'next/link'
import EmpresasForm from './EmpresasForm'

export const metadata = {
  title: 'Actividades para empresas — Planeta Movimiento Cuenca',
  description: 'Team building circense, eventos corporativos y formación en equipo en Cuenca. Experiencias únicas para empresas de 5 a 200 personas.',
}

const VENTAJAS = [
  { icon: '🌟', titulo: 'Experiencia única y memorable', desc: 'Nuestras actividades generan recuerdos duraderos y refuerzan el vínculo entre los participantes.' },
  { icon: '🎯', titulo: 'Adaptamos a tu equipo', desc: 'Diseñamos la actividad para grupos de 5 a 200 personas, con dificultad y ritmo ajustados.' },
  { icon: '🏢', titulo: 'Instalaciones propias en Cuenca', desc: 'Espacio propio con equipamiento de circo profesional, vestuarios y zona de descanso.' },
  { icon: '📜', titulo: 'Certificado de participación', desc: 'Entregamos un diploma personalizado a cada participante como recuerdo de la experiencia.' },
]

const ACTIVIDADES = [
  {
    icon: '🎪',
    nombre: 'Team Building Circense',
    duracion: '2h',
    precio: 'Desde 30€/persona',
    desc: 'Malabares en grupo, pirámides humanas y retos de coordinación que favorecen la comunicación y la confianza.',
  },
  {
    icon: '⚖️',
    nombre: 'Retos de equilibrio',
    duracion: '1.5h',
    precio: 'Desde 25€/persona',
    desc: 'Pruebas de equilibrio en pareja y grupo que exigen escucha activa, coordinación y apoyo mutuo.',
  },
  {
    icon: '🎭',
    nombre: 'Festival de circo',
    duracion: '3h',
    precio: 'Desde 45€/persona',
    desc: 'Taller intensivo que culmina con un show final protagonizado por los propios participantes. Alto impacto y diversión garantizados.',
  },
  {
    icon: '🌄',
    nombre: 'Retiro activo',
    duracion: 'Día completo',
    precio: 'Desde 85€/persona',
    desc: 'Combinación de varias actividades circenses a lo largo del día, con descansos y comida incluida. La experiencia más completa.',
  },
]

const CLIENTES = [
  'Empresa Soluciones A', 'Grupo Tecnológico B', 'Constructora Sur C',
  'Consultora Digital D', 'Farmacéutica Norte E', 'Logística Cuenca F',
]

export default function EmpresasPage() {
  return (
    <main>
      {/* HERO */}
      <section
        className="relative bg-pm-navy text-white py-24 px-4 border-t-4 border-pm-red overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: 'radial-gradient(ellipse at 70% 50%, #D42B2B 0%, transparent 60%)' }}
        />
        <div className="relative max-w-5xl mx-auto">
          <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>›</span>
            <span className="text-white">Empresas</span>
          </nav>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
            Activa a tu equipo,<br/>transforma tu empresa
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mb-8">
            Actividades de team building basadas en el circo y la acrobacia. Cohesión real, comunicación genuina y recuerdos que unen equipos.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#formulario" className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-8 py-3 rounded-xl transition-colors">
              Solicitar propuesta
            </a>
            <a href="#actividades" className="border-2 border-white text-white hover:bg-white hover:text-pm-navy font-bold px-8 py-3 rounded-xl transition-colors">
              Ver actividades
            </a>
          </div>
        </div>
      </section>

      {/* POR QUÉ */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-pm-navy mb-3 text-center">¿Por qué Planeta Movimiento?</h2>
          <p className="text-gray-500 text-center mb-12">Somos especialistas en experiencias de equipo a través del movimiento</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VENTAJAS.map((v) => (
              <div key={v.titulo} className="bg-pm-bg rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">{v.icon}</div>
                <h3 className="font-black text-pm-navy mb-2">{v.titulo}</h3>
                <p className="text-gray-500 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIVIDADES */}
      <section className="bg-pm-bg py-20 px-4" id="actividades">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-pm-navy mb-3 text-center">Actividades para empresas</h2>
          <p className="text-gray-500 text-center mb-10">Todas incluyen monitor especializado, materiales y seguro</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {ACTIVIDADES.map((act) => (
              <div key={act.nombre} className="bg-white rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl shrink-0">{act.icon}</div>
                  <div>
                    <h3 className="font-black text-pm-navy text-xl">{act.nombre}</h3>
                    <div className="text-sm text-gray-400 mt-1">⏱ {act.duracion} · {act.precio}</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm flex-1 mb-4">{act.desc}</p>
                <a href="#formulario" className="block text-center bg-pm-red hover:bg-pm-red-dark text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
                  Solicitar información
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENTES */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-pm-navy mb-3 text-center">Empresas que confían en nosotros</h2>
          <p className="text-gray-500 text-center mb-10">Más de 50 empresas han vivido la experiencia Planeta Movimiento</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {CLIENTES.map((c) => (
              <div key={c} className="bg-gray-100 rounded-xl h-16 flex items-center justify-center text-gray-400 font-semibold text-sm">
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULARIO */}
      <section className="bg-pm-navy py-20 px-4 text-white" id="formulario">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-2 text-center">Solicita tu propuesta</h2>
          <p className="text-gray-300 text-center mb-10">Cuéntanos qué necesitas y te preparamos una propuesta personalizada en 24h</p>
          <EmpresasForm />
        </div>
      </section>
    </main>
  )
}
