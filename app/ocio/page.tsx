import Link from 'next/link'

export const metadata = {
  title: 'Ocio y diversión — Planeta Movimiento Cuenca',
  description: 'Cumpleaños, talleres, eventos y campamentos de circo en Cuenca. Diversión para toda la familia con Planeta Movimiento.',
}

const TALLERES = [
  {
    nombre: 'Taller de Malabares',
    fecha: '15 jun 2026',
    precio: '12€/persona',
    plazas: 12,
    desc: 'Aprende los fundamentos del malabarismo con pelotas y pañuelos. Apto para todos los niveles.',
    badge: 'bg-blue-500',
  },
  {
    nombre: 'Taller de Acrobacia familiar',
    fecha: '22 jun 2026',
    precio: '10€/persona',
    plazas: 8,
    desc: 'Acrobacias y equilibrios en pareja y grupo. Perfecto para familias con niños desde 5 años.',
    badge: 'bg-green-500',
  },
  {
    nombre: 'Taller de Circo en verano',
    fecha: '1 jul 2026',
    precio: '15€/persona',
    plazas: 15,
    desc: 'Un recorrido por las principales disciplinas del circo: malabares, acrobacia y equilibrio.',
    badge: 'bg-pm-red',
  },
]

const EVENTOS = [
  { nombre: 'Noche de circo en la plaza', fecha: '20 jun 2026', desc: 'Espectáculo abierto al público con actuaciones de alumnos avanzados.' },
  { nombre: 'Feria de las artes de Cuenca', fecha: '5 jul 2026', desc: 'Participamos con un stand de actividades circenses gratuitas para toda la familia.' },
  { nombre: 'Festival de fin de temporada', fecha: '15 sep 2026', desc: 'Gran gala de clausura con actuaciones de todos los niveles del club.' },
]

export default function OcioPage() {
  return (
    <main>
      {/* HERO */}
      <section className="bg-pm-navy text-white py-20 px-4 border-t-4 border-pm-red">
        <div className="max-w-5xl mx-auto">
          <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>›</span>
            <span className="text-white">Ocio</span>
          </nav>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
            Ocio y diversión<br/>para toda la familia
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mb-8">
            Cumpleaños mágicos, talleres abiertos, eventos especiales y campamentos de verano en nuestras instalaciones de Cuenca.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="bg-white/10 text-white text-sm font-semibold px-4 py-2 rounded-full">Sin edad mínima</span>
            <span className="bg-white/10 text-white text-sm font-semibold px-4 py-2 rounded-full">Reserva online</span>
            <span className="bg-white/10 text-white text-sm font-semibold px-4 py-2 rounded-full">En Cuenca</span>
          </div>
        </div>
      </section>

      {/* CUMPLEAÑOS */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black text-pm-navy mb-4">🎂 Cumpleaños circense</h2>
              <p className="text-gray-600 mb-4">
                Celebra el cumpleaños de tu peque con una experiencia única de circo. Nuestros monitores organizan la fiesta perfecta para que los niños se diviertan y aprendan al mismo tiempo.
              </p>
              <p className="text-gray-600 mb-6">
                Adaptamos la actividad a la edad del cumpleañero y del grupo de invitados. Disponible todos los fines de semana con reserva previa.
              </p>
              <h3 className="font-bold text-pm-navy mb-3">Incluye:</h3>
              <ul className="space-y-2 mb-6">
                {[
                  'Monitor circense especializado',
                  'Materiales y equipamiento',
                  '90 minutos de actividad',
                  'Decoración temática opcional',
                  'Zona merienda disponible',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <span className="text-pm-red font-black">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-pm-red-light border-2 border-pm-red rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <div className="text-pm-navy text-sm font-semibold uppercase tracking-wider mb-2">Precio desde</div>
              <div className="text-5xl font-black text-pm-red mb-1">15€</div>
              <div className="text-gray-500 text-sm mb-6">por persona · mínimo 8 niños</div>
              <Link href="/reservar" className="block bg-pm-red hover:bg-pm-red-dark text-white font-black py-3 rounded-xl transition-colors">
                Reservar cumpleaños
              </Link>
              <p className="text-gray-400 text-xs mt-3">Consulta disponibilidad sin compromiso</p>
            </div>
          </div>
        </div>
      </section>

      {/* TALLERES */}
      <section className="bg-pm-bg py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-pm-navy mb-3 text-center">Talleres próximos</h2>
          <p className="text-gray-500 text-center mb-10">Sesiones puntuales abiertas al público. Reserva tu plaza.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {TALLERES.map((t) => (
              <div key={t.nombre} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className={`${t.badge} text-white px-4 py-2 flex items-center gap-2`}>
                  <span className="text-xs font-black uppercase tracking-wider">📅 {t.fecha}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-black text-pm-navy text-lg mb-2">{t.nombre}</h3>
                  <p className="text-gray-500 text-sm mb-4">{t.desc}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-pm-red font-black text-xl">{t.precio}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{t.plazas} plazas</span>
                  </div>
                  <Link href="/reservar" className="block text-center bg-pm-red hover:bg-pm-red-dark text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
                    Reservar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAMPAMENTOS */}
      <section className="bg-pm-navy py-20 px-4 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-5xl mb-4">⛺</div>
          <h2 className="text-4xl font-black mb-4">Campamentos de verano</h2>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto mb-6">
            Semanas completas de circo, acrobacia, juegos y convivencia. Una experiencia que los niños recordarán para siempre.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-white/10 rounded-xl px-6 py-4 text-center">
              <div className="font-black text-2xl text-pm-red mb-1">Julio</div>
              <div className="text-gray-300 text-sm">Semanas 1, 2 y 3</div>
            </div>
            <div className="bg-white/10 rounded-xl px-6 py-4 text-center">
              <div className="font-black text-2xl text-pm-red mb-1">Agosto</div>
              <div className="text-gray-300 text-sm">Semanas 1 y 2</div>
            </div>
            <div className="bg-white/10 rounded-xl px-6 py-4 text-center">
              <div className="font-black text-2xl text-pm-red mb-1">Desde 95€</div>
              <div className="text-gray-300 text-sm">por semana</div>
            </div>
          </div>
          <Link href="/reservar" className="inline-block bg-pm-red hover:bg-pm-red-dark text-white font-black px-10 py-4 rounded-xl transition-colors text-lg">
            Reservar campamento
          </Link>
        </div>
      </section>

      {/* EVENTOS ESPECIALES */}
      <section className="bg-pm-bg py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-pm-navy mb-3 text-center">Eventos especiales</h2>
          <p className="text-gray-500 text-center mb-10">Próximas citas en el calendario</p>
          <div className="space-y-4">
            {EVENTOS.map((ev) => (
              <div key={ev.nombre} className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
                <div className="shrink-0 bg-pm-red text-white text-center rounded-xl px-4 py-2 text-sm font-bold min-w-[110px]">
                  {ev.fecha}
                </div>
                <div>
                  <h3 className="font-black text-pm-navy text-lg">{ev.nombre}</h3>
                  <p className="text-gray-500 text-sm mt-1">{ev.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
