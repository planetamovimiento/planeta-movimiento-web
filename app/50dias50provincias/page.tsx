import Reveal from '@/components/home/Reveal'
import { JsonLd } from '@/components/seo/JsonLd'
import { SITE_URL, breadcrumbsJsonLd } from '@/lib/seo'
import {
  BROSJACA, CATEGORIAS_APOYO, RETO, TOTAL_PROVINCIAS, euros, fechaLarga, kilos, labelNivel, litros,
} from '@/lib/reto50/constants'
import type { CategoriaApoyo } from '@/lib/reto50/constants'
import type { ColaboradorLocal, Patrocinador } from '@/lib/reto50/tipos'
import {
  gasolinaDeConfig, getApoyosActivos, getColaboradoresLocalesActivos, getConfigReto, getEtapasPublicas,
  getFaqActivas, getQrsActivos, getRankingPublico, recaudadoOnlineDeConfig, resumenReto,
} from '@/lib/reto50/data'
import MapaEspana from './MapaEspana'
import RutaCalendario from './RutaCalendario'
import Faq from './Faq'
import PanelQr from './PanelQr'
import PanelProtagonista from './PanelProtagonista'
import FondoRuta from './FondoRuta'
import FondoHero from './FondoHero'
import Gasolina from './Gasolina'
import Recaudacion from './Recaudacion'
import { BloqueCompartir } from './Compartir'

export const dynamic = 'force-dynamic'

const URL_PAGINA = `${SITE_URL}/50dias50provincias`
const TEXTO_COMPARTIR = '50 días, 50 provincias: el reto solidario de Brosjaca contra el cáncer.'

export const metadata = {
  title: '50 días, 50 provincias — El reto solidario de Brosjaca | Planeta Movimiento',
  description:
    'Brosjaca recorre las 50 provincias de España en 50 días, con un burflip más cada jornada, a beneficio de la Asociación Española Contra el Cáncer. Consulta la ruta, la próxima parada y súmate.',
  alternates: { canonical: '/50dias50provincias' },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: '/50dias50provincias',
    title: '50 días, 50 provincias — El reto solidario de Brosjaca',
    description:
      'Una provincia cada día, un burflip más cada jornada. Deporte y solidaridad por toda España a beneficio de la lucha contra el cáncer.',
  },
  twitter: {
    card: 'summary_large_image',
    title: '50 días, 50 provincias — El reto solidario de Brosjaca',
    description: 'Una provincia cada día, un burflip más cada jornada, contra el cáncer.',
  },
}

const CONTENEDOR = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'
const KICKER = 'text-xs font-black text-pm-red uppercase tracking-widest'

const btnPrimario =
  'inline-flex items-center justify-center gap-2 bg-pm-red hover:bg-pm-red-dark text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-colors'
const btnSecundario =
  'inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:bg-white/10 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-colors'

/**
 * Un bloque de apoyos (patrocinadores o colaboradores). La rejilla se adapta al
 * número de elementos y los logos van con object-contain para que no se
 * deformen. Si la categoría está vacía, el bloque no se pinta.
 */
function BloqueApoyos({ categoria, apoyos }: { categoria: CategoriaApoyo; apoyos: Patrocinador[] }) {
  if (apoyos.length === 0) return null

  const meta = CATEGORIAS_APOYO.find(c => c.id === categoria)!
  // Con pocos elementos no se estira la rejilla: quedaría desangelada.
  const cols =
    apoyos.length === 1 ? 'grid-cols-1 max-w-md mx-auto'
    : apoyos.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div>
      <Reveal className="text-center mb-6">
        <h3 className="text-xl font-black text-pm-navy">{meta.label}</h3>
        <p className="text-gray-400 text-sm mt-1.5 max-w-xl mx-auto leading-relaxed">{meta.desc}</p>
      </Reveal>

      <div className={`grid ${cols} gap-4`}>
        {apoyos.map((p, i) => {
          const contenido = (
            <>
              <div className={`${p.destacado ? 'h-24' : 'h-16'} flex items-center justify-center mb-4`}>
                {p.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logoUrl} alt={p.nombre} loading="lazy" className="max-h-full max-w-[80%] object-contain" />
                ) : (
                  <span className={`font-black text-pm-navy/15 ${p.destacado ? 'text-3xl' : 'text-2xl'} text-center leading-tight break-words px-2`}>
                    {p.nombre}
                  </span>
                )}
              </div>
              <div className="text-center min-w-0">
                <span className="text-xs font-black text-pm-red uppercase tracking-widest">{labelNivel(p.nivel)}</span>
                <h4 className="font-black text-pm-navy mt-1 break-words">{p.nombre}</h4>
                {p.descripcion && <p className="text-gray-500 text-sm mt-2 leading-relaxed">{p.descripcion}</p>}
              </div>
            </>
          )
          const clases = 'bg-white rounded-2xl border border-gray-100 shadow-sm p-6 pm-card block h-full'
          return (
            <Reveal key={p.id} delay={i * 60}>
              {p.webUrl ? (
                <a href={p.webUrl} target="_blank" rel="noopener noreferrer" className={clases}>
                  {contenido}
                </a>
              ) : (
                <div className={clases}>{contenido}</div>
              )}
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Colaboradores locales: la tercera categoría. Solo nombre y logo, sin nivel ni
 * descripción, porque son apoyos de una provincia concreta. Debajo de cada uno
 * se dice en qué etapas colabora. Si no hay ninguno, el bloque no se pinta.
 */
function BloqueLocales({ locales }: { locales: ColaboradorLocal[] }) {
  if (locales.length === 0) return null

  return (
    <div>
      <Reveal className="text-center mb-6">
        <h3 className="text-xl font-black text-pm-navy">Colaboradores locales</h3>
        <p className="text-gray-400 text-sm mt-1.5 max-w-xl mx-auto leading-relaxed">
          Quien echa una mano en cada provincia para que la parada de ese día salga adelante.
        </p>
      </Reveal>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {locales.map((c, i) => {
          const contenido = (
            <>
              {/* Sin logo no se pinta el hueco: el nombre ya va justo debajo */}
              {c.logoUrl && (
                <div className="h-14 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.logoUrl} alt={c.nombre} loading="lazy" className="max-h-full max-w-[85%] object-contain" />
                </div>
              )}
              <div className={`text-center min-w-0 ${c.logoUrl ? 'mt-3' : ''}`}>
                <h4 className="font-black text-pm-navy text-sm break-words">{c.nombre}</h4>
                {c.provincias.length > 0 && (
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed break-words">{c.provincias.join(' · ')}</p>
                )}
              </div>
            </>
          )
          const clases = 'bg-white rounded-2xl border border-gray-100 shadow-sm p-4 pm-card block h-full'
          return (
            <Reveal key={c.id} delay={i * 50}>
              {c.webUrl ? (
                <a href={c.webUrl} target="_blank" rel="noopener noreferrer" className={clases}>
                  {contenido}
                </a>
              ) : (
                <div className={clases}>{contenido}</div>
              )}
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}

export default async function CincuentaDiasPage() {
  const [etapas, patrocinadores, colaboradores, locales, faq, qrs, ranking, config] = await Promise.all([
    getEtapasPublicas(),
    getApoyosActivos('patrocinador'),
    getApoyosActivos('colaborador'),
    getColaboradoresLocalesActivos(),
    getFaqActivas(),
    getQrsActivos(),
    getRankingPublico(),
    getConfigReto(),
  ])

  // Lo recaudado son dos vías que se suman: las paradas y lo donado por la web.
  const resumen = resumenReto(etapas, recaudadoOnlineDeConfig(config))
  // Fecha más reciente de actualización de recaudación entre las etapas.
  const recaudacionActualizada = etapas.map(e => e.recaudacionActualizado).filter(Boolean).sort().pop() ?? ''
  const gasolina = gasolinaDeConfig(config)

  /**
   * Las cifras del reto, en la portada. valor null = todavía sin dato: se dice
   * así, nunca con un 0 que daría a entender que no se ha recaudado nada.
   */
  const cifras: { label: string; valor: string | null }[] = [
    { label: 'Recaudado', valor: resumen.recaudadoTotal != null ? euros(resumen.recaudadoTotal) : null },
    { label: 'Provincias completadas', valor: `${resumen.provinciasCompletadas} / ${resumen.totalProvincias}` },
    { label: 'Objetivo', valor: config.objetivo_global || RETO.objetivo },
  ]
  // El panel de colaborar sale si hay QR o si el Bizum de la gasolina está activo.
  const hayColabora = qrs.length > 0 || config.bizum_activo !== 'no'
  const finalizadas = etapas.filter(e => e.estado === 'finalizada')
  const conGaleria = finalizadas.filter(e => e.galeria.length > 0 || e.resumen || e.videoUrl)

  // Solo se enlaza lo que existe de verdad: nada de URLs inventadas.
  const donacion = config.donacion_url || ''
  const dossier = config.dossier_url || ''
  const heroTitulo = config.hero_titulo || RETO.nombre
  const heroSubtitulo =
    config.hero_subtitulo ||
    'Una provincia cada día. Un burflip más cada jornada. Todo por la lucha contra el cáncer.'

  const retoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: RETO.nombre,
    description:
      'Brosjaca recorre las 50 provincias de España en 50 días con un burflip más cada jornada, a beneficio de la Asociación Española Contra el Cáncer.',
    startDate: RETO.fechaInicio,
    endDate: RETO.fechaFin,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Country', name: 'España' },
    organizer: { '@id': `${SITE_URL}/#negocio` },
    performer: { '@type': 'Person', name: `${RETO.protagonistaNombre} «${RETO.protagonista}»` },
    url: URL_PAGINA,
  }

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd([{ name: 'Inicio', path: '/' }, { name: '50 días, 50 provincias', path: '/50dias50provincias' }])} />
      <JsonLd data={retoJsonLd} />

      <main className="bg-white min-h-screen">
        {/* ── 1 · HERO ───────────────────────────────────────────────────── */}
        <section className="relative bg-pm-navy overflow-hidden">
          {/* La imagen de portada, si la hay. Va la primera: todo lo demás encima */}
          <FondoHero config={config} />
          <div className="absolute inset-0 bg-grid opacity-[0.07]" aria-hidden="true" />
          <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-pm-red/20 blur-3xl animate-orb" aria-hidden="true" />
          <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-pm-navy-md/60 blur-3xl" aria-hidden="true" />

          {/* En escritorio el contenido se aparta a los lados y deja libre la
              franja central: es donde está el protagonista de la foto. */}
          <div className={`${CONTENEDOR} relative py-16 sm:py-24 lg:min-h-[38rem] flex items-center`}>
            <div className="w-full grid lg:grid-cols-[minmax(0,1fr)_19rem] gap-10 lg:gap-20 xl:gap-28 items-start">
              <div className="lg:max-w-lg xl:max-w-xl">
                <p className={KICKER}>{RETO.protagonista} · Reto Solidario 2026</p>
                <h1 className="text-white font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mt-3">
                  {heroTitulo}
                </h1>
                {/* Opacidades altas a propósito: sobre la foto de portada, un
                    white/70 se queda por debajo del contraste mínimo legible. */}
                <p className="text-white/85 text-base sm:text-lg mt-5 leading-relaxed max-w-xl">
                  {heroSubtitulo}
                </p>
                <div className="flex flex-wrap gap-3 mt-8">
                  <a href="#mapa" className={btnPrimario}>Conoce la ruta</a>
                  <a href="#ruta" className={btnSecundario}>Ver el calendario</a>
                  {donacion && (
                    <a href={donacion} target="_blank" rel="noopener noreferrer" className={`${btnPrimario} bg-white text-pm-navy hover:bg-white/90`}>
                      Colaborar
                    </a>
                  )}
                </div>

                {/* Las cifras reales del reto: se actualizan solas según avanza
                    la ruta. Lo que no tiene dato lo dice, nunca sale un 0. */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/10">
                  {cifras.map(c => (
                    <div key={c.label}>
                      {c.valor ? (
                        // Una sola línea siempre: partir «100.000 €» a la mitad
                        // se leía fatal. Con tres cifras hay sitio de sobra.
                        <div className="text-white font-black text-2xl leading-none whitespace-nowrap tabular-nums">
                          {c.valor}
                        </div>
                      ) : (
                        <div className="text-white/70 font-bold text-sm leading-none py-2 whitespace-nowrap">
                          Aún sin datos
                        </div>
                      )}
                      <div className="text-white/80 text-xs mt-1.5 leading-tight">{c.label}</div>
                    </div>
                  ))}
                </div>

                {resumen.recaudadoTotal == null && (
                  <p className="text-white/70 text-xs mt-4 leading-relaxed max-w-md">
                    Lo recaudado va destinado a la lucha contra el cáncer a través de la {RETO.causa}. Las cifras se
                    publican aquí a medida que avanza la ruta, provincia a provincia.
                  </p>
                )}
              </div>

              {/* Columna derecha: solo el protagonista. Lo de colaborar baja a su
                  propia banda para no tapar media foto. */}
              <div className="relative">
                <PanelProtagonista config={config} />
              </div>
            </div>
          </div>
        </section>

        {/* ── 2 · COLABORA ───────────────────────────────────────────────── */}
        {/* Estaba dentro de la portada, encima de la foto. Aquí se lee mejor y
            sigue siendo lo primero que aparece tras el titular. */}
        <section className="bg-pm-navy border-t border-white/10">
          <div className={`${CONTENEDOR} py-10 sm:py-12`}>
            <div className="max-w-3xl mx-auto">
              {hayColabora ? (
                <PanelQr qrs={qrs} titulo={config.qr_titulo} texto={config.qr_texto} config={config} />
              ) : (
                <div className="rounded-3xl bg-white/5 border border-white/10 p-8 text-center">
                  <h2 className="text-white font-black text-lg">{config.qr_titulo || 'Colabora con el reto'}</h2>
                  <p className="text-white/60 text-sm mt-2 leading-relaxed">
                    Los códigos para colaborar se publicarán aquí antes de la salida.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 3 · EL RETO ────────────────────────────────────────────────── */}
        <section className={`${CONTENEDOR} py-16 sm:py-20`}>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            <Reveal>
              <p className={KICKER}>El reto</p>
              <h2 className="text-3xl font-black text-pm-navy mt-2">
                Un burflip más cada día. Durante todo el año.
              </h2>
              <div className="space-y-4 text-gray-600 text-sm leading-relaxed mt-5">
                <p>
                  {RETO.protagonistaNombre} «{RETO.protagonista}» afronta en 2026 su reto más exigente: hacer un{' '}
                  <strong className="text-pm-navy">burflip</strong> más cada día durante los{' '}
                  {RETO.diasRetoAnual} días del año. El día 1 fue una repetición. El día 365 serán 365.
                </p>
                <p>
                  En pleno recorrido nace el gran hito: <strong className="text-pm-navy">{RETO.nombre}</strong>. Recorrer
                  una provincia distinta cada jornada, llevando el reto deportivo y la causa solidaria a cada rincón de
                  España, en colaboración directa con la {RETO.causa}.
                </p>
                <p>
                  {config.intro_texto ||
                    'Todo comenzó con «La Capacha Solidaria»: miles de personas aportando sus monedas para la Asociación Española Contra el Cáncer. Ahora el reto recorre las 50 provincias españolas, reuniendo vecinos, recaudando fondos y dando voz a historias locales en cada parada.'}
                </p>
              </div>

              <figure className="mt-8 border-l-2 border-pm-red pl-5">
                <blockquote className="text-pm-navy font-bold text-base leading-relaxed">
                  «Nadie dijo que conseguir cumplir un reto fuera fácil, pero todo gran hito comienza con un primer paso.
                  Grandes cambios empiezan con pequeñas acciones.»
                </blockquote>
                <figcaption className="text-xs text-gray-400 mt-2">
                  {RETO.protagonistaNombre} «{RETO.protagonista}»
                </figcaption>
              </figure>
            </Reveal>

            <Reveal delay={90}>
              <div className="bg-pm-bg rounded-3xl p-6 sm:p-8">
                <h3 className="font-black text-pm-navy text-lg">¿Cómo puedes participar?</h3>
                <ul className="mt-4 space-y-3.5">
                  {[
                    ['Ven a tu provincia', 'Cada día hay una parada distinta. Consulta el calendario y acércate: las quedadas son gratuitas y abiertas a todo el mundo.'],
                    ['Haz las que puedas', 'No hace falta entrenar ni saber hacer un burflip. Se puede acompañar, animar o hacer las repeticiones que cada uno quiera.'],
                    ['Comparte el reto', 'Cuanta más gente lo conozca, más visibilidad para la lucha contra el cáncer.'],
                    ['Suma a los tuyos', 'Trae a tu familia, a tu club o a tus amigos. El objetivo es reunir al mayor número posible de personas en cada provincia.'],
                  ].map(([titulo, texto]) => (
                    <li key={titulo} className="flex gap-3">
                      <svg className="w-4 h-4 text-pm-red shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <div className="min-w-0">
                        <div className="font-black text-pm-navy text-sm">{titulo}</div>
                        <p className="text-gray-500 text-sm leading-relaxed mt-0.5">{texto}</p>
                      </div>
                    </li>
                  ))}
                </ul>

              </div>
            </Reveal>
          </div>
        </section>

        {/* ── 4 · OBJETIVO DE GASOLINA ───────────────────────────────────── */}
        <section id="gasolina" className="bg-pm-bg scroll-mt-20 py-16 sm:py-20">
          <div className={CONTENEDOR}>
            <Reveal className="text-center max-w-2xl mx-auto mb-10">
              <p className={KICKER}>Objetivo de gasolina</p>
              <h2 className="text-3xl font-black text-pm-navy mt-2">
                {litros(gasolina.objetivoLitros)} para cruzar España
              </h2>
              <p className="text-gray-500 text-sm mt-4 leading-relaxed">
                Recorrer las {TOTAL_PROVINCIAS} provincias cuesta combustible. Este es el depósito del reto: se llena con
                lo que aporta la gente y así llega hasta {RETO.ciudadFin}.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <Gasolina gasolina={gasolina} ranking={ranking} />
            </Reveal>
          </div>
        </section>

        {/* ── 5 · MAPA · el archivo audiovisual del reto ─────────────────── */}
        <section id="mapa" className="scroll-mt-20 py-16 sm:py-20">
          <div className={CONTENEDOR}>
            <Reveal className="text-center max-w-2xl mx-auto mb-10">
              <p className={KICKER}>El recorrido</p>
              <h2 className="text-3xl font-black text-pm-navy mt-2">Toda España, provincia a provincia</h2>
              <p className="text-gray-500 text-sm mt-4 leading-relaxed">
                De {RETO.ciudadInicio} a {RETO.ciudadFin}, pasando por las {TOTAL_PROVINCIAS} provincias. Pulsa sobre
                cualquier punto para ver esa jornada y su vídeo resumen: las 50 quedan guardadas aquí, así que se puede
                recorrer el reto entero aunque se descubra al final.
              </p>
            </Reveal>
            <MapaEspana etapas={etapas} />
          </div>
        </section>

        {/* ── 6 · RUTA COMPLETA ──────────────────────────────────────────── */}
        {/* La ruta va sobre un paisaje: es un viaje por carretera, no una tabla */}
        <section id="ruta" className="relative bg-pm-navy scroll-mt-20 py-16 sm:py-20 overflow-hidden">
          <FondoRuta config={config} />
          <div className={`${CONTENEDOR} relative`}>
            <Reveal className="mb-8">
              <p className={KICKER}>Calendario</p>
              <h2 className="text-3xl font-black text-white mt-2">Las 50 etapas, día a día</h2>
              <p className="text-white/60 text-sm mt-3 max-w-2xl leading-relaxed">
                Del {fechaLarga(RETO.fechaInicio)} al {fechaLarga(RETO.fechaFin)} de 2026. Una sola carretera de{' '}
                {RETO.ciudadInicio} a {RETO.ciudadFin}: los horarios y los puntos de encuentro se confirman en los días
                previos a cada parada.
              </p>
            </Reveal>
            <RutaCalendario etapas={etapas} config={config} colaboradores={locales} />
          </div>
        </section>

        {/* ── 7 · RECAUDACIÓN (billetes € · kilos de céntimos) ───────────── */}
        <Recaudacion
          totalConfirmado={resumen.recaudadoTotal}
          billetes={resumen.recaudadoProvincias}
          online={resumen.recaudadoOnline}
          centimosKg={resumen.centimosKg}
          etapasConDatos={resumen.etapasConDatos}
          actualizado={recaudacionActualizada}
        />

        {/* ── 8 · PATROCINADORES Y COLABORADORES ─────────────────────────── */}
        <section className={`${CONTENEDOR} py-16 sm:py-20`}>
          <Reveal className="text-center max-w-2xl mx-auto mb-10">
            <p className={KICKER}>Quién lo hace posible</p>
            <h2 className="text-3xl font-black text-pm-navy mt-2">Patrocinadores y colaboradores</h2>
          </Reveal>

          {/* Dos categorías distintas: primero los patrocinadores, luego los colaboradores */}
          <div className="space-y-12">
            <BloqueApoyos categoria="patrocinador" apoyos={patrocinadores} />
            <BloqueApoyos categoria="colaborador" apoyos={colaboradores} />
            <BloqueLocales locales={locales} />
          </div>

          <div className="bg-pm-bg rounded-3xl p-6 sm:p-10 mt-10 text-center">
            <h3 className="font-black text-pm-navy text-xl">¿Colaboramos?</h3>
            <p className="text-gray-500 text-sm mt-3 max-w-2xl mx-auto leading-relaxed">
              Buscamos ayuntamientos, empresas y entidades que quieran sumarse: un espacio público céntrico para el
              vehículo del reto, difusión institucional, apoyo logístico puntual y una nota de prensa conjunta el día de
              la visita. A cambio, visibilidad nacional asociada a una causa solidaria, dinamización de un espacio
              céntrico con un evento gratuito para vecinos y contenido audiovisual profesional protagonizado por el
              municipio.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <a href="mailto:holasoyines0@gmail.com" className={btnPrimario}>Escríbenos</a>
              <a
                href="tel:+34618827126"
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-pm-red text-pm-navy font-bold text-sm px-6 py-3.5 rounded-xl transition-colors"
              >
                618 82 71 26
              </a>
              {dossier && (
                <a
                  href={dossier}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-pm-red text-pm-navy font-bold text-sm px-6 py-3.5 rounded-xl transition-colors"
                >
                  Descargar dossier
                </a>
              )}
            </div>
            <p className="text-gray-400 text-xs mt-4">Inés Bautista · Marketing de {RETO.organiza}</p>
          </div>
        </section>

        {/* ── 8 · GALERÍA Y SEGUIMIENTO ──────────────────────────────────── */}
        <section className="bg-pm-bg py-16 sm:py-20">
          <div className={CONTENEDOR}>
            <Reveal className="text-center max-w-2xl mx-auto mb-10">
              <p className={KICKER}>El día a día</p>
              <h2 className="text-3xl font-black text-pm-navy mt-2">Cómo se vivió cada provincia</h2>
            </Reveal>

            {conGaleria.length > 0 ? (
              <div className="space-y-10">
                {conGaleria.map(e => (
                  <Reveal key={e.dia}>
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-7">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className={KICKER}>Día {e.dia}</span>
                        <h3 className="text-2xl font-black text-pm-navy">{e.provincia}</h3>
                        <span className="text-sm text-gray-400 capitalize">{fechaLarga(e.fecha)}</span>
                      </div>

                      {e.resumen && <p className="text-gray-600 text-sm mt-3 leading-relaxed whitespace-pre-line">{e.resumen}</p>}

                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-xs text-gray-500">
                        {e.recaudacionEstado !== 'pendiente' && e.billetesCents != null && <span>Billetes: <strong className="text-pm-navy font-black">{euros(e.billetesCents / 100)}</strong></span>}
                        {e.recaudacionEstado !== 'pendiente' && e.centimosKg != null && <span>Céntimos: <strong className="text-pm-navy font-black">{kilos(e.centimosKg)}</strong></span>}
                        <span><strong className="text-pm-navy font-black">{e.burflips}</strong> burflips</span>
                      </div>

                      {e.galeria.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mt-5">
                          {e.galeria.map((url, i) => (
                            <div key={url} className="aspect-square rounded-xl overflow-hidden bg-pm-bg">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt={`${e.provincia} — foto ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      {e.testimonios && (
                        <blockquote className="border-l-2 border-pm-red pl-4 mt-5 text-sm text-pm-navy font-medium leading-relaxed whitespace-pre-line">
                          {e.testimonios}
                        </blockquote>
                      )}

                      <div className="flex flex-wrap gap-4 mt-5">
                        {e.videoUrl && (
                          <a href={e.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-pm-red hover:text-pm-red-dark">
                            Ver el vídeo →
                          </a>
                        )}
                        {e.enlaceRedes && (
                          <a href={e.enlaceRedes} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-pm-red hover:text-pm-red-dark">
                            Ver en redes →
                          </a>
                        )}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center max-w-2xl mx-auto">
                <p className="text-gray-500 text-sm leading-relaxed">
                  Aquí se irá publicando el seguimiento de la ruta: las fotos, los vídeos y la crónica de cada provincia,
                  con la gente que se sumó en cada parada. El reto arranca el {fechaLarga(RETO.fechaInicio)} de 2026 en{' '}
                  {RETO.ciudadInicio}.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── 9 · FAQ ───────────────────────────────────────────────────── */}
        {faq.length > 0 && (
          <section className={`${CONTENEDOR} py-16 sm:py-20`}>
            <Reveal className="text-center max-w-2xl mx-auto mb-8">
              <p className={KICKER}>Dudas</p>
              <h2 className="text-3xl font-black text-pm-navy mt-2">Preguntas frecuentes</h2>
            </Reveal>
            <Faq preguntas={faq} />
          </section>
        )}

        {/* ── 10 · CIERRE Y COMPARTIR ────────────────────────────────────── */}
        <section className="bg-pm-red">
          <div className={`${CONTENEDOR} py-16 sm:py-20 text-center`}>
            <h2 className="text-white font-black text-3xl sm:text-4xl">Nos vemos en tu provincia</h2>
            <p className="text-white/80 text-sm mt-4 max-w-xl mx-auto leading-relaxed">
              50 días. 50 provincias. Una causa. Comparte el reto y ayuda a que llegue más lejos.
            </p>
            <div className="mt-10">
              <BloqueCompartir
                url={URL_PAGINA}
                texto={TEXTO_COMPARTIR}
                instagram={config.instagram_url || BROSJACA.instagram}
                tiktok={config.tiktok_url || BROSJACA.tiktok}
                youtube={config.youtube_url || BROSJACA.youtube}
                facebook={config.facebook_url || ''}
              />
            </div>
            <a
              href={config.web_brosjaca || BROSJACA.web}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-8 text-white/70 hover:text-white text-sm font-bold underline underline-offset-4"
            >
              Conoce más sobre {RETO.protagonista}
            </a>
          </div>
        </section>
      </main>
    </>
  )
}
