import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

const SERVICIOS_DATA: Record<string, {
  nombre: string
  descripcionLarga: string
  icon: string
  precio_base: number
  duracion_min: number
  edad_min: number
  aforo_max: number
}> = {
  cumpleanos: {
    nombre: 'Cumpleaños', icon: '🎂', precio_base: 15000, duracion_min: 90, edad_min: 4, aforo_max: 25,
    descripcionLarga: 'Celebra el día más especial de tu hijo con una fiesta de cumpleaños única llena de circo, acrobacia y magia. Nuestros monitores especializados crean una experiencia memorable para los niños y sus familias. Incluye actividades adaptadas a la edad de los participantes.',
  },
  campamentos: {
    nombre: 'Campamento', icon: '⛺', precio_base: 20000, duracion_min: 480, edad_min: 6, aforo_max: 20,
    descripcionLarga: 'Campamentos de verano llenos de aventura, movimiento y aprendizaje. Los niños descubren el circo, la acrobacia y el juego cooperativo durante jornadas completas de actividad. Una experiencia que combina diversión, creatividad y valores en equipo.',
  },
  acrobacia: {
    nombre: 'Acrobacia', icon: '🤸', precio_base: 1200, duracion_min: 60, edad_min: 5, aforo_max: 15,
    descripcionLarga: 'Clases de acrobacia de suelo con monitores titulados. Aprende volteretas, equilibrios, pirámides y mucho más en un ambiente seguro y motivador. Ideal para niños y adultos que quieran mejorar su capacidad física y coordinación.',
  },
  circo: {
    nombre: 'Circo', icon: '🎪', precio_base: 1200, duracion_min: 60, edad_min: 5, aforo_max: 15,
    descripcionLarga: 'Malabares, trapecio, cuerda y habilidades circenses para todas las edades. Nuestras clases de circo combinan el arte, el deporte y la creatividad en una experiencia única. Aprende a dominar materiales circenses con nuestros artistas profesionales.',
  },
  club: {
    nombre: 'Club Movimiento', icon: '🎡', precio_base: 800, duracion_min: 60, edad_min: 3, aforo_max: 18,
    descripcionLarga: 'El Club Movimiento es la opción ideal para quienes quieren practicar de forma regular. Clases semanales con grupos reducidos, progresión personalizada y una comunidad de amantes del movimiento. Cuota mensual con acceso a todas las sesiones del grupo.',
  },
  empresas: {
    nombre: 'Empresa', icon: '🏢', precio_base: 30000, duracion_min: 120, edad_min: 18, aforo_max: 40,
    descripcionLarga: 'Team building y actividades corporativas diseñadas para fortalecer vínculos entre equipos. Combinamos el circo y la acrobacia para crear experiencias únicas que fomentan la comunicación, la confianza y el trabajo en equipo. Adaptamos el programa a los objetivos de tu empresa.',
  },
}

const DEFAULT_SERVICIO = {
  nombre: 'Servicio', icon: '🎪', precio_base: 1200, duracion_min: 60, edad_min: 5, aforo_max: 20,
  descripcionLarga: 'Descubre nuestras actividades de circo y movimiento en Planeta Movimiento.',
}

const PAQUETES = [
  {
    nombre: 'Básico', precio: 1200, max_participantes: 15, duracion_min: 60,
    incluye: ['Monitor', 'Materiales', 'Seguro'], destacado: false,
  },
  {
    nombre: 'Estándar', precio: 1800, max_participantes: 20, duracion_min: 90,
    incluye: ['Monitor', 'Materiales', 'Seguro', 'Merienda', 'Fotos'], destacado: true,
  },
  {
    nombre: 'Premium', precio: 2500, max_participantes: 25, duracion_min: 120,
    incluye: ['Monitor', 'Materiales', 'Seguro', 'Merienda', 'Fotos', 'Vídeo', 'Decoración'], destacado: false,
  },
]

type Props = { params: Promise<{ slug: string }> }

export default async function ServicioPage({ params }: Props) {
  const { slug } = await params
  const servicio = SERVICIOS_DATA[slug] ?? DEFAULT_SERVICIO

  return (
    <main>
      <section className="bg-pm-navy text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>›</span>
            <Link href="/servicios" className="hover:text-white transition-colors">Servicios</Link>
            <span>›</span>
            <span className="text-white">{servicio.nombre}</span>
          </nav>
          <div className="text-5xl mb-4">{servicio.icon}</div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">{servicio.nombre}</h1>
          <p className="text-gray-300 text-lg max-w-2xl mb-8">{servicio.descripcionLarga}</p>
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="bg-white/10 px-4 py-2 rounded-full text-sm font-medium">⏱ {servicio.duracion_min} min</span>
            <span className="bg-white/10 px-4 py-2 rounded-full text-sm font-medium">Desde {formatPrice(servicio.precio_base)}</span>
          </div>
          <Link href="/reservar" className="inline-block bg-pm-red hover:bg-pm-red-dark text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg">
            Reservar ahora
          </Link>
        </div>
      </section>

      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-pm-navy mb-3 text-center">Paquetes disponibles</h2>
          <p className="text-gray-500 text-center mb-10">Elige el que mejor se adapte a lo que necesitas</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAQUETES.map((p) => (
              <div key={p.nombre} className={`relative rounded-2xl border-2 p-6 ${p.destacado ? 'border-pm-red bg-pm-red-light' : 'border-gray-200 bg-white'}`}>
                {p.destacado && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pm-red text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Más popular
                  </span>
                )}
                <h3 className="text-xl font-black text-pm-navy mb-1">{p.nombre}</h3>
                <div className="text-3xl font-black text-pm-red mb-1">{formatPrice(p.precio)}</div>
                <div className="text-sm text-gray-500 mb-4">por persona · {p.duracion_min} min · máx {p.max_participantes}</div>
                <ul className="space-y-2 mb-6">
                  {p.incluye.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500 font-bold">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <Link href="/reservar" className={`block text-center py-2.5 rounded-xl font-bold transition-colors ${p.destacado ? 'bg-pm-red text-white hover:bg-pm-red-dark' : 'border-2 border-pm-navy text-pm-navy hover:bg-pm-navy hover:text-white'}`}>
                  Seleccionar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-pm-bg py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="text-4xl mb-3">🧒</div>
              <div className="font-bold text-pm-navy text-lg mb-1">Edad mínima</div>
              <div className="text-gray-500">{servicio.edad_min} años</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="text-4xl mb-3">⏱</div>
              <div className="font-bold text-pm-navy text-lg mb-1">Duración</div>
              <div className="text-gray-500">{servicio.duracion_min} minutos</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="text-4xl mb-3">👥</div>
              <div className="font-bold text-pm-navy text-lg mb-1">Aforo máximo</div>
              <div className="text-gray-500">{servicio.aforo_max} participantes</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-pm-red py-14 px-4 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-3">¿Tienes dudas? Llámanos</h2>
          <p className="text-red-100 mb-6">Estaremos encantados de ayudarte a elegir la mejor opción</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:+34969000000" className="text-2xl font-black hover:underline">969 000 000</a>
            <a href="https://wa.me/34969000000" target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
