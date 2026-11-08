import Link from 'next/link'
import { Galeria } from '@/components/ui/Galeria'
import { VideoYoutube } from '@/components/ui/VideoYoutube'
import ReservaCumpleanos from './ReservaCumpleanos'
import { getCumpleanosOcupados } from '@/lib/cumpleanos/disponibilidad'
import { getHorarioServicio } from '@/lib/reservas/horarios'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbsJsonLd, SITE_URL } from '@/lib/seo'
import { CANCELACION_TRAMOS } from '@/lib/reservas/cancelacion'

export const dynamic = 'force-dynamic'

// 🎥 Enlace del vídeo explicativo de YouTube (déjalo vacío para ocultar la sección).
const VIDEO_CUMPLE = 'https://www.youtube.com/shorts/HsIbAnQt6qc'

const TITULO = 'Cumpleaños Infantiles en Cuenca | Planeta Movimiento'
const DESCRIPCION =
  'Celebra el cumpleaños de tu hijo en Cuenca: 2 horas con monitores, juegos, circo y retos en grupo, merienda y bebidas incluidas. Desde 11 € por niño. Reserva online.'

export const metadata = {
  title: TITULO,
  description: DESCRIPCION,
  keywords: ['cumpleaños Cuenca', 'cumpleaños infantiles Cuenca', 'celebrar cumpleaños en Cuenca', 'fiestas de cumpleaños Cuenca', 'dónde celebrar un cumpleaños en Cuenca'],
  alternates: { canonical: '/servicios/cumpleanos' },
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    url: '/servicios/cumpleanos',
    type: 'website',
    locale: 'es_ES',
  },
}

// Preguntas frecuentes: se muestran en la página y van también como FAQPage.
const FAQ: { p: string; r: string }[] = [
  { p: '¿Cuánto cuesta celebrar un cumpleaños en Planeta Movimiento?',
    r: 'De lunes a jueves, 11 € por participante; viernes, sábados, domingos y festivos, 13 € por participante. El mínimo es de 13 participantes (si venís menos se puede celebrar igualmente, facturando el mínimo). A partir de 25 participantes se añade un monitor extra (+20 €).' },
  { p: '¿Qué incluye el cumpleaños?',
    r: '1 hora y media de actividad guiada con monitor especializado (juegos, retos, circuitos y circo), 30 minutos de merienda con bebidas, cubiertos y vasos, y seguro. La tarta no está incluida: podéis traerla vosotros.' },
  { p: '¿Cuánto dura un cumpleaños?',
    r: 'Dos horas en total: 1 h 30 min de actividad y 30 min de merienda para soplar las velas.' },
  { p: '¿Qué merienda hay?',
    r: 'Cada niño elige el día del cumpleaños entre sándwich mixto, sándwich de Nocilla, nuggets o salchipapas, con agua, Aquarius de limón o naranja, o zumo de melocotón o piña.' },
  { p: '¿Qué horarios tenéis?',
    r: 'De lunes a viernes, de 18:15 a 20:15. Sábados y domingos hay dos turnos: de 16:45 a 18:45 y de 18:15 a 20:15.' },
  { p: '¿Cómo se reserva un cumpleaños?',
    r: 'Desde esta misma página: eliges el día y el horario libres, rellenas los datos y pagas online una señal de 50 € para confirmar la fecha. El resto se abona el día del cumpleaños en la instalación.' },
  { p: '¿Y si tenemos que cancelar?',
    r: `La señal de 50 € sigue la política general de cancelación: ${CANCELACION_TRAMOS.map(t => `${t.cuando.toLowerCase()}, ${t.devolucion}`).join('; ')}.` },
  { p: '¿Dónde se celebra?',
    r: 'En las instalaciones de Planeta Movimiento, en el Polígono Los Palancares, 8, 16004 Cuenca.' },
]

const SERVICIO_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${SITE_URL}/servicios/cumpleanos#servicio`,
  name: 'Cumpleaños infantiles en Cuenca',
  serviceType: 'Fiestas de cumpleaños infantiles',
  description: DESCRIPCION,
  url: `${SITE_URL}/servicios/cumpleanos`,
  image: `${SITE_URL}/fotos/cumpleanos/1.webp`,
  provider: { '@id': `${SITE_URL}/#negocio` },
  areaServed: { '@type': 'City', name: 'Cuenca' },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: 11,
    highPrice: 13,
    description: 'Precio por participante (mínimo 13 participantes)',
    url: `${SITE_URL}/servicios/cumpleanos`,
  },
}

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.p, acceptedAnswer: { '@type': 'Answer', text: f.r } })),
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

export default async function CumpleanosPage() {
  const [ocupados, franjas] = await Promise.all([getCumpleanosOcupados(), getHorarioServicio('cumpleanos')])
  return (
    <main className="bg-pm-bg min-h-screen">
      <JsonLd data={breadcrumbsJsonLd([{ name: 'Inicio', path: '/' }, { name: 'Ocio', path: '/ocio' }, { name: 'Cumpleaños en Cuenca', path: '/servicios/cumpleanos' }])} />
      <JsonLd data={SERVICIO_JSONLD} />
      <JsonLd data={FAQ_JSONLD} />
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

            {/* Imagen principal — foto real de cumpleaños */}
            <div className="relative bg-pm-navy rounded-2xl overflow-hidden aspect-[16/9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fotos/cumpleanos/1.webp" alt="Niños celebrando un cumpleaños infantil en Planeta Movimiento, Cuenca" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-pm-navy/90 via-pm-navy/45 to-pm-navy/20" />
              <div className="relative h-full flex flex-col items-center justify-center text-center px-8">
                <div className="text-white font-black text-3xl mb-2 [text-shadow:0_2px_16px_rgba(0,0,0,0.5)]">Celebra tu<br/>cumpleaños en Cuenca</div>
                <div className="text-white/85 text-sm [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">Planeta Movimiento · Cuenca</div>
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h1 className="text-2xl font-black text-pm-navy mb-3">Cumpleaños infantiles en Cuenca</h1>
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

            {/* Texto para quien busca dónde celebrar un cumpleaños en Cuenca */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3 text-sm text-gray-700 leading-relaxed">
              <h2 className="font-black text-pm-navy text-base">¿Dónde celebrar un cumpleaños en Cuenca?</h2>
              <p>
                En Planeta Movimiento convertimos el cumpleaños de tu hijo o hija en una fiesta activa y diferente:
                los niños se mueven, juegan en equipo y prueban actividades de circo y acrobacia guiados por monitores,
                mientras las familias se despreocupan de organizar nada. Es una alternativa a los parques de bolas
                para celebrar cumpleaños infantiles en Cuenca con más movimiento y más diversión.
              </p>
              <p>
                La fiesta dura dos horas: hora y media de juegos, retos y circuitos, y media hora de merienda con
                bebidas para soplar las velas. El monitor, el seguro, los cubiertos y los vasos están incluidos;
                vosotros solo tenéis que traer la tarta (y si no la traéis, usamos nuestra tarta decorativa y los
                niños ganan 15 minutos más de juego).
              </p>
              <p>
                Puedes ver los días libres y <strong className="text-pm-navy">reservar el cumpleaños online</strong> en
                esta misma página, con una señal de 50 €. Estamos en el Polígono Los Palancares, 8, en Cuenca.
                ¿Buscas otros planes? Mira también nuestros{' '}
                <Link href="/servicios/campamentos" className="text-pm-red font-semibold hover:underline">campamentos</Link>{' '}
                y los <Link href="/servicios/eventos" className="text-pm-red font-semibold hover:underline">eventos en el centro</Link>.
              </p>
            </section>
          </div>

          {/* ── COLUMNA DERECHA — Widget de reserva ── */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-pm-red text-white px-5 py-4">
                <div className="font-black text-base">Reservar cumpleaños</div>
                <div className="text-red-200 text-xs mt-0.5">Fianza de 50 € para confirmar la fecha</div>
              </div>
              <div className="p-5">
                <ReservaCumpleanos ocupados={ocupados} franjas={franjas} />
              </div>
            </div>
          </div>

        </div>
      </div>
      <VideoYoutube url={VIDEO_CUMPLE} titulo="Cómo es un cumpleaños en Planeta Movimiento" subtitulo="Dale al play y descúbrelo en vídeo" fondo="bg-white" />
      <Galeria slug="cumpleanos" titulo="Galería" subtitulo="Cumpleaños llenos de circo y diversión" fondo="bg-pm-bg" />

      {/* Preguntas frecuentes (también en FAQ_JSONLD) */}
      <section className="bg-white py-12" aria-labelledby="faq-cumple">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 id="faq-cumple" className="text-2xl font-black text-pm-navy mb-6 text-center">Preguntas frecuentes sobre los cumpleaños</h2>
          <div className="space-y-3">
            {FAQ.map(f => (
              <details key={f.p} className="group bg-pm-bg rounded-xl border border-gray-100 p-4">
                <summary className="font-bold text-pm-navy cursor-pointer list-none flex justify-between gap-3">
                  <h3 className="text-sm sm:text-base">{f.p}</h3>
                  <span className="text-pm-red group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
                </summary>
                <p className="text-sm text-gray-700 leading-relaxed mt-2">{f.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
