import Link from 'next/link'

export const metadata = {
  title: 'Ocio y tiempo libre — Planeta Movimiento Cuenca',
  description:
    'Cumpleaños, campamentos, eventos y talleres de circo en Cuenca. Diversión para toda la familia con Planeta Movimiento.',
}

const SERVICIOS = [
  {
    nombre: 'Celebración de Cumpleaños',
    href: '/servicios/cumpleanos',
    desc: '2 horas de actividad guiada, juegos en grupo y merienda incluida en nuestras instalaciones.',
    precio: 'Desde 11 € / participante',
    detalle: 'Reserva online con fianza de 50 €',
    grad: 'from-pm-red to-pm-red-dark',
    badge: 'Reserva online',
  },
  {
    nombre: 'Campamentos',
    href: '/servicios/campamentos',
    desc: 'Escuela de Superhéroes en Navidad, Semana Santa y 8 semanas de verano. Días sueltos o semanas completas.',
    precio: '25 € / día · 95 € / semana',
    detalle: 'Descuento hermanos y horario ampliado',
    grad: 'from-pm-navy to-pm-navy-md',
    badge: 'Reserva online',
  },
  {
    nombre: 'Eventos y celebraciones',
    href: '/servicios/eventos',
    desc: 'Animación infantil para bodas, comuniones y fiestas. Y eventos en el centro: Días Sin Cole, Domingos en Familia y Halloween.',
    precio: 'Desde 150 € + IVA',
    detalle: 'A domicilio o en nuestras instalaciones',
    grad: 'from-purple-700 to-indigo-800',
    badge: 'Presupuesto',
  },
  {
    nombre: 'Talleres de Circo',
    href: '/servicios/talleres',
    desc: 'Talleres participativos a medida para ferias, fiestas y grandes grupos. Configura los módulos y obtén presupuesto al instante.',
    precio: 'Presupuesto a medida',
    detalle: 'Para ayuntamientos, empresas y AMPAs',
    grad: 'from-pm-red to-purple-700',
    badge: 'A medida',
  },
  {
    nombre: 'PIEA · Envejecimiento Activo',
    href: '/servicios/piea',
    desc: 'Programas de movimiento en residencias y talleres para mayores. Vitalidad, participación y bienestar para entidades y ayuntamientos.',
    precio: 'Talleres desde 200 €',
    detalle: 'Residencias, centros de día y ayuntamientos',
    grad: 'from-emerald-600 to-teal-700',
    badge: 'Mayores',
  },
]

const EN_INSTALACIONES = [
  { nombre: 'Días Sin Cole', desc: 'Festivos escolares de 9:00 a 14:00 con la Escuela de Superhéroes.', precio: '30 € + IVA / niño' },
  { nombre: 'Domingos en Familia', desc: 'Práctica libre en familia los domingos de 11:00 a 13:00.', precio: '15 € / niño · adultos gratis' },
  { nombre: 'Noche de Halloween', desc: 'Fiesta de pijamas temática anual para mayores de 10 años.', precio: 'Plazas limitadas' },
]

export default function OcioPage() {
  return (
    <main className="bg-pm-bg min-h-screen">
      {/* HERO */}
      <section className="bg-pm-navy text-white py-20 px-4 border-t-4 border-pm-red">
        <div className="max-w-5xl mx-auto">
          <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>›</span>
            <span className="text-white">Ocio</span>
          </nav>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
            Ocio y tiempo libre<br />para toda la familia
          </h1>
          <p className="text-white/65 text-xl max-w-2xl mb-8">
            Cumpleaños, campamentos, eventos y talleres de circo en nuestras instalaciones de Cuenca.
            Diversión activa para todas las edades.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="bg-white/10 text-white text-sm font-semibold px-4 py-2 rounded-full">Todas las edades</span>
            <span className="bg-white/10 text-white text-sm font-semibold px-4 py-2 rounded-full">Reserva online</span>
            <span className="bg-white/10 text-white text-sm font-semibold px-4 py-2 rounded-full">En Cuenca</span>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-pm-navy mb-3 text-center">Nuestros servicios de ocio</h2>
          <p className="text-gray-500 text-center mb-10">Elige tu plan y reserva o solicita presupuesto en minutos</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {SERVICIOS.map(s => (
              <Link key={s.nombre} href={s.href}
                className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className={`bg-gradient-to-br ${s.grad} px-6 py-5 text-white flex items-center justify-between`}>
                  <h3 className="text-xl font-black">{s.nombre}</h3>
                  <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">{s.badge}</span>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{s.desc}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-pm-navy font-black text-lg">{s.precio}</div>
                      <div className="text-xs text-gray-400">{s.detalle}</div>
                    </div>
                    <span className="text-sm font-black text-pm-red flex items-center gap-1">
                      Ver más
                      <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTOS EN EL CENTRO */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-pm-navy mb-3 text-center">Eventos en nuestro centro</h2>
          <p className="text-gray-500 text-center mb-10">Experiencias especiales organizadas en Planeta Movimiento</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {EN_INSTALACIONES.map(e => (
              <div key={e.nombre} className="bg-pm-bg rounded-2xl border border-gray-100 p-6">
                <h3 className="font-black text-pm-navy text-lg mb-2">{e.nombre}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{e.desc}</p>
                <div className="text-pm-red font-bold text-sm">{e.precio}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/servicios/eventos" className="inline-block bg-pm-navy hover:bg-pm-navy-md text-white font-bold px-8 py-3.5 rounded-xl transition-colors">
              Ver todos los eventos del centro
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-pm-red py-16 px-4 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-3">¿Listo para divertirte?</h2>
          <p className="text-red-100 mb-8">Reserva tu cumpleaños o campamento, o solicita presupuesto para tu evento.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/servicios/cumpleanos" className="bg-white text-pm-red hover:bg-pm-red-light font-black px-8 py-3.5 rounded-xl transition-colors">
              Reservar cumpleaños
            </Link>
            <Link href="/actividades" className="border-2 border-white/40 text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-xl transition-colors">
              Ver todas las actividades
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
