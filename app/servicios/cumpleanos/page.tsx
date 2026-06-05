import Link from 'next/link'
import ReservaCumpleanos from './ReservaCumpleanos'

export const metadata = {
  title: 'Celebración de Cumpleaños — Planeta Movimiento Cuenca',
  description:
    '¡Celebra un cumpleaños a lo grande en Cuenca! 2 horas de actividad guiada, juegos, retos en grupo y merienda incluida. Desde 11 €/participante.',
}

const incluye = [
  { icon: '🤸', texto: '1,5h de actividad guiada' },
  { icon: '🍽️', texto: '30 min de merienda' },
  { icon: '🥤', texto: 'Bebidas incluidas' },
  { icon: '🍴', texto: 'Cubiertos y vasos' },
  { icon: '👨‍🏫', texto: 'Monitor especializado' },
  { icon: '🛡', texto: 'Seguro incluido' },
]

const noIncluye = ['La tarta (podéis traerla vosotros)']

export default function CumpleanosPage() {
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
            <span className="text-pm-navy font-semibold">Celebración de cumpleaños</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">

          {/* ── COLUMNA IZQUIERDA ── */}
          <div className="space-y-6">

            {/* Imagen principal */}
            <div className="relative bg-pm-navy rounded-2xl overflow-hidden aspect-[16/9]">
              <div className="absolute inset-0 bg-gradient-to-br from-pm-navy via-pm-navy-md to-pm-red/40" />
              <div className="relative h-full flex flex-col items-center justify-center text-center px-8">
                <div className="text-6xl mb-3">🎂</div>
                <div className="text-white font-black text-3xl mb-2">Celebración de<br/>cumpleaños</div>
                <div className="text-white/60 text-sm">Planeta Movimiento · Cuenca</div>
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h1 className="text-2xl font-black text-pm-navy mb-3">Celebración de cumpleaños</h1>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                Celebra un <strong className="text-pm-navy">cumpleaños a lo grande en Cuenca</strong> en las instalaciones de Planeta Movimiento.{' '}
                <strong className="text-pm-navy">2 horas</strong> de diversión activa con{' '}
                <strong className="text-pm-navy">actividad guiada</strong>, juegos y retos en grupo, más{' '}
                <strong className="text-pm-navy">merienda</strong> y detalle para el cumpleañero/a.
              </p>

              {/* Tarifas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="bg-pm-bg border border-gray-200 rounded-xl p-4">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Lunes a Jueves</div>
                  <div className="text-3xl font-black text-pm-navy">11 €</div>
                  <div className="text-xs text-gray-500">por participante</div>
                  <div className="text-xs text-amber-600 mt-1 font-medium">Mínimo 13 participantes</div>
                </div>
                <div className="bg-pm-red-light border border-pm-red/20 rounded-xl p-4">
                  <div className="text-xs font-bold text-pm-red/70 uppercase tracking-wider mb-1">Viernes · Sábado · Domingo · Festivos</div>
                  <div className="text-3xl font-black text-pm-red">13 €</div>
                  <div className="text-xs text-gray-500">por participante</div>
                  <div className="text-xs text-amber-600 mt-1 font-medium">Mínimo 13 participantes</div>
                </div>
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-5">
                💡 Si venís menos de 13 niños se puede celebrar igualmente, pero se factura el mínimo de 13.
                Si superáis los 25 participantes se añade un monitor extra (+20 €).
              </div>

              {/* Incluye / No incluye */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">✓ Incluido</div>
                  <ul className="space-y-1.5">
                    {incluye.map(({ icon, texto }) => (
                      <li key={texto} className="flex items-center gap-2 text-xs text-gray-700">
                        <span>{icon}</span> {texto}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">✗ No incluido</div>
                  <ul className="space-y-1.5">
                    {noIncluye.map(item => (
                      <li key={item} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="text-gray-300">✗</span> {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                    🎈 ¿No traéis tarta? Usamos nuestra tarta decorativa para las velas. Los niños ganan <strong>15 min extra de juego</strong>.
                  </div>
                </div>
              </div>
            </div>

            {/* Horarios */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-black text-pm-navy text-base mb-4">Horarios disponibles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-pm-bg rounded-xl p-4 border border-gray-200">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lunes a Viernes</div>
                  <div className="text-pm-navy font-black">18:15 – 20:15</div>
                  <div className="text-xs text-gray-400 mt-1">1 franja disponible</div>
                </div>
                <div className="bg-pm-bg rounded-xl p-4 border border-gray-200">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sábados y Domingos</div>
                  <div className="text-pm-navy font-black">16:45 – 18:45</div>
                  <div className="text-pm-navy font-black">18:15 – 20:15</div>
                  <div className="text-xs text-gray-400 mt-1">2 franjas disponibles</div>
                </div>
              </div>
            </div>

            {/* Dinámica */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-black text-pm-navy text-base mb-4">¿Cómo es el cumpleaños?</h2>
              <div className="flex flex-col sm:flex-row gap-1 items-stretch">
                {[
                  { tiempo: '1h 30 min', label: 'Actividad guiada', desc: 'Juegos, retos, circuitos y diversión con monitores', color: 'bg-pm-red text-white', icon: '🤸' },
                  { tiempo: '30 min', label: 'Merienda', desc: 'Menú elegido + bebidas + soplar las velas', color: 'bg-pm-navy text-white', icon: '🎂' },
                ].map(({ tiempo, label, desc, color, icon }) => (
                  <div key={label} className={`flex-1 ${color} rounded-xl p-4`}>
                    <div className="text-2xl mb-2">{icon}</div>
                    <div className="font-black text-base">{tiempo}</div>
                    <div className="font-semibold text-sm opacity-90">{label}</div>
                    <div className="text-xs opacity-70 mt-1">{desc}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-500 text-center">Duración total: 2 horas</div>
            </div>
          </div>

          {/* ── COLUMNA DERECHA — Widget de reserva ── */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-pm-red text-white px-5 py-4">
                <div className="font-black text-base">Reservar cumpleaños</div>
                <div className="text-red-200 text-xs mt-0.5">Fianza de 50 € para confirmar la fecha</div>
              </div>
              <div className="p-5">
                <ReservaCumpleanos />
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
