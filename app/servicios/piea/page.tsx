import Link from 'next/link'
import { FormResidencias, ConfiguradorTalleresPiea } from './PieaClient'

export const metadata = {
  title: 'PIEA — Programa de Integración y Envejecimiento Activo | Planeta Movimiento',
  description:
    'Programa de Integración y Envejecimiento Activo: actividad física y dinamización en residencias y talleres para mayores, ayuntamientos y centros. Movimiento, bienestar y participación.',
}

const ACTIVIDADES = [
  'Movimiento adaptado', 'Coordinación', 'Movilidad', 'Conexión grupal',
  'Juegos participativos', 'Bienestar emocional', 'Socialización', 'Estimulación física y cognitiva',
]

const VALORES = [
  { titulo: 'Vitalidad', desc: 'Actividades que activan el cuerpo y la mente, llenas de energía positiva.' },
  { titulo: 'Participación', desc: 'Todos forman parte: dinámicas pensadas para incluir a cada persona.' },
  { titulo: 'Comunidad', desc: 'Crear vínculos y momentos compartidos que mejoran el ánimo.' },
  { titulo: 'Calidad de vida', desc: 'Más bienestar físico y emocional para un envejecimiento pleno.' },
]

export default function PieaPage() {
  return (
    <main className="bg-pm-bg min-h-screen">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-pm-red transition-colors">Inicio</Link>
            <span>›</span>
            <Link href="/ocio" className="hover:text-pm-red transition-colors">Ocio</Link>
            <span>›</span>
            <span className="text-pm-navy font-semibold">PIEA</span>
          </nav>
        </div>
      </div>

      {/* HERO */}
      <section className="bg-pm-navy text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full mb-5">
                Envejecimiento activo · Bienestar
              </span>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
                Programa de Integración y<br /><span className="text-pm-red">Envejecimiento Activo</span>
              </h1>
              <p className="text-white/65 text-base leading-relaxed mb-6 max-w-lg">
                Movimiento, participación y bienestar para personas mayores. Llevamos energía, conexión y
                calidad de vida a residencias, centros de día, asociaciones y ayuntamientos.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Residencias', 'Centros de día', 'Asociaciones de mayores', 'Ayuntamientos'].map(b => (
                  <span key={b} className="bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{b}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {VALORES.map(v => (
                <div key={v.titulo} className="bg-white/5 border border-white/15 rounded-2xl p-5">
                  <div className="font-black text-white text-base mb-1">{v.titulo}</div>
                  <div className="text-white/55 text-xs leading-relaxed">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Selector de los 2 servicios */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href="#residencias" className="group bg-pm-bg border border-gray-200 rounded-2xl p-5 hover:border-pm-red/30 hover:shadow-sm transition-all">
            <div className="text-xs font-black text-pm-red uppercase tracking-wider mb-1">Servicio 1</div>
            <div className="font-black text-pm-navy text-lg">Programas en residencias</div>
            <div className="text-gray-500 text-sm mt-1">Actividad y dinamización en el propio centro</div>
          </a>
          <a href="#talleres" className="group bg-pm-bg border border-gray-200 rounded-2xl p-5 hover:border-pm-red/30 hover:shadow-sm transition-all">
            <div className="text-xs font-black text-pm-red uppercase tracking-wider mb-1">Servicio 2</div>
            <div className="font-black text-pm-navy text-lg">Talleres de envejecimiento activo</div>
            <div className="text-gray-500 text-sm mt-1">Para ayuntamientos, asociaciones y centros</div>
          </a>
        </div>
      </section>

      {/* ── SERVICIO 1: RESIDENCIAS ── */}
      <section className="bg-pm-bg py-16" id="residencias">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <div className="text-xs font-black text-pm-red uppercase tracking-widest mb-2">Servicio 1</div>
              <h2 className="text-3xl font-black text-pm-navy mb-4">Programas en residencias</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Desarrollamos programas de actividad física, movimiento y dinamización para personas mayores
                directamente en residencias y centros especializados. Nos desplazamos al centro con nuestro equipo.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Acudimos <strong className="text-pm-navy">3 días por semana</strong>, en sesiones de
                <strong className="text-pm-navy"> 1 hora</strong>, siempre adaptadas a las capacidades de cada grupo.
              </p>

              {/* Colaboración destacada */}
              <div className="bg-white border-2 border-emerald-200 rounded-2xl p-5 mb-6">
                <div className="text-xs font-black text-emerald-700 uppercase tracking-wider mb-1">Colaboración destacada</div>
                <div className="font-black text-pm-navy text-lg">Residencia Sagrado Corazón</div>
                <p className="text-gray-500 text-sm mt-1">Colaboración estable: llevamos el programa de movimiento y dinamización a sus residentes durante todo el año.</p>
              </div>

              <h3 className="font-black text-pm-navy text-sm mb-3">Qué trabajamos en cada sesión</h3>
              <div className="grid grid-cols-2 gap-2">
                {ACTIVIDADES.map(a => (
                  <div key={a} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-pm-red font-bold">✓</span>{a}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:self-start">
              <h3 className="font-black text-pm-navy text-lg mb-1">Consultar programa</h3>
              <p className="text-gray-500 text-sm mb-5">Cuéntanos sobre tu centro y te explicamos cómo llevamos el programa a vuestros residentes.</p>
              <FormResidencias />
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICIO 2: TALLERES ── */}
      <section className="bg-white py-16" id="talleres">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-xs font-black text-pm-red uppercase tracking-widest mb-2">Servicio 2</div>
            <h2 className="text-3xl font-black text-pm-navy mb-3">Talleres de envejecimiento activo</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Talleres participativos para ayuntamientos, asociaciones de mayores y centros de día.
              Elige el taller y solicita información o presupuesto.
            </p>
          </div>
          <ConfiguradorTalleresPiea />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-pm-navy py-14 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-black mb-3">Llevamos el bienestar a tu centro</h2>
          <p className="text-white/65 text-sm mb-8">Residencias, centros de día, asociaciones y ayuntamientos: cuéntanos qué necesitas.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#residencias" className="bg-pm-red hover:bg-pm-red-dark text-white font-black px-8 py-3.5 rounded-xl transition-colors">Programas en residencias</a>
            <a href="#talleres" className="border-2 border-white/30 text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-xl transition-colors">Talleres para entidades</a>
          </div>
        </div>
      </section>
    </main>
  )
}
