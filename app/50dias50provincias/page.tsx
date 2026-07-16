import Reveal from '@/components/home/Reveal'
import { Foto } from '@/components/ui/Foto'
import { JsonLd } from '@/components/seo/JsonLd'
import { SITE_URL, breadcrumbsJsonLd } from '@/lib/seo'
import {
  IMPACTO, RETO, TOTAL_PROVINCIAS, euros, fechaLarga, labelNivel, litros,
} from '@/lib/reto50/constants'
import {
  gasolinaDeConfig, getConfigReto, getEtapasPublicas, getFaqActivas, getPatrocinadoresActivos,
  getQrsActivos, getRankingPublico, proximaParada, resumenReto,
} from '@/lib/reto50/data'
import MapaEspana from './MapaEspana'
import RutaCalendario from './RutaCalendario'
import Faq from './Faq'
import PanelQr from './PanelQr'
import Gasolina from './Gasolina'
import { BloqueCompartir, BotonCompartir } from './Compartir'

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

export default async function CincuentaDiasPage() {
  const [etapas, patrocinadores, faq, qrs, ranking, config] = await Promise.all([
    getEtapasPublicas(),
    getPatrocinadoresActivos(),
    getFaqActivas(),
    getQrsActivos(),
    getRankingPublico(),
    getConfigReto(),
  ])

  const proxima = proximaParada(etapas)
  const resumen = resumenReto(etapas)
  const gasolina = gasolinaDeConfig(config)
  const finalizadas = etapas.filter(e => e.estado === 'finalizada')
  const conGaleria = finalizadas.filter(e => e.galeria.length > 0 || e.resumen || e.videoUrl)

  // Solo se enlaza lo que existe de verdad: nada de URLs inventadas.
  const donacion = config.donacion_url || ''
  const dossier = config.dossier_url || ''
  const heroImagen = config.hero_imagen || ''
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
          <div className="absolute inset-0 bg-grid opacity-[0.07]" aria-hidden="true" />
          <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-pm-red/20 blur-3xl animate-orb" aria-hidden="true" />
          <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-pm-navy-md/60 blur-3xl" aria-hidden="true" />

          <div className={`${CONTENEDOR} relative py-16 sm:py-24`}>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div>
                <p className={KICKER}>{RETO.protagonista} · Reto 2026</p>
                <h1 className="text-white font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mt-3">
                  {heroTitulo}
                </h1>
                <p className="text-white/70 text-base sm:text-lg mt-5 leading-relaxed max-w-xl">
                  {heroSubtitulo}
                </p>
                <p className="text-white/50 text-sm mt-3 max-w-xl leading-relaxed">
                  Un reto deportivo y solidario en beneficio de la {RETO.causa}, organizado por {RETO.organiza}.
                </p>

                <div className="flex flex-wrap gap-3 mt-8">
                  <a href="#ruta" className={btnPrimario}>Conoce la ruta</a>
                  {proxima && <a href="#proxima" className={btnSecundario}>Próxima parada</a>}
                  {donacion && (
                    <a href={donacion} target="_blank" rel="noopener noreferrer" className={`${btnPrimario} bg-white text-pm-navy hover:bg-white/90`}>
                      Colaborar
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/10 max-w-md">
                  <div>
                    <div className="text-white font-black text-3xl">50</div>
                    <div className="text-white/50 text-xs mt-0.5">provincias</div>
                  </div>
                  <div>
                    <div className="text-white font-black text-3xl">50</div>
                    <div className="text-white/50 text-xs mt-0.5">días seguidos</div>
                  </div>
                  <div>
                    <div className="text-white font-black text-3xl">1</div>
                    <div className="text-white/50 text-xs mt-0.5">causa</div>
                  </div>
                </div>
              </div>

              {/* Zona de colaboración: los QR mandan; si aún no hay, la imagen del reto */}
              <div className="relative">
                {qrs.length > 0 ? (
                  <PanelQr qrs={qrs} titulo={config.qr_titulo} texto={config.qr_texto} />
                ) : heroImagen ? (
                  <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] relative">
                    <Foto src={heroImagen} alt={`${RETO.protagonista} — ${RETO.nombre}`} />
                  </div>
                ) : (
                  <div className="rounded-3xl bg-white/5 border border-white/10 p-8 text-center">
                    <h2 className="text-white font-black text-lg">{config.qr_titulo || 'Colabora con el reto'}</h2>
                    <p className="text-white/50 text-sm mt-2 leading-relaxed">
                      Los códigos para colaborar se publicarán aquí antes de la salida.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── 2 · EL RETO ────────────────────────────────────────────────── */}
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

                <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
                  {IMPACTO.map(i => (
                    <div key={i.label}>
                      <div className="text-pm-navy font-black text-xl">{i.valor}</div>
                      <div className="text-gray-400 text-xs leading-tight mt-0.5">{i.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── 3 · OBJETIVO DE GASOLINA ───────────────────────────────────── */}
        <section className="bg-pm-bg py-16 sm:py-20">
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

        {/* ── 4 · PRÓXIMA PARADA ─────────────────────────────────────────── */}
        <section id="proxima" className="scroll-mt-20 py-16 sm:py-20">
          <div className={CONTENEDOR}>
            {proxima ? (
              <div className="bg-pm-navy rounded-3xl overflow-hidden relative">
                <div className="absolute inset-0 bg-grid opacity-[0.06]" aria-hidden="true" />
                <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-pm-red/20 blur-3xl" aria-hidden="true" />
                <div className="relative p-6 sm:p-10 grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
                  <div>
                    <p className={KICKER}>Próxima parada</p>
                    <h2 className="text-white font-black text-4xl sm:text-5xl mt-2">{proxima.provincia}</h2>
                    <p className="text-white/60 text-sm mt-2 capitalize">
                      Día {proxima.dia} de 50 · {fechaLarga(proxima.fecha)}
                    </p>

                    <div className="mt-5 space-y-1.5">
                      {proxima.ciudad && <p className="text-white/80 text-sm">{proxima.ciudad}</p>}
                      <p className="text-white/80 text-sm">
                        {proxima.hora ? `Hora: ${proxima.hora}` : 'Hora por confirmar'}
                      </p>
                      <p className="text-white/80 text-sm">
                        {proxima.puntoEncuentro || 'Punto de encuentro por confirmar'}
                      </p>
                    </div>

                    {proxima.descripcion && (
                      <p className="text-white/60 text-sm mt-4 leading-relaxed max-w-lg">{proxima.descripcion}</p>
                    )}

                    <div className="flex flex-wrap gap-3 mt-7">
                      <a href="#ruta" className={`${btnPrimario} bg-white text-pm-navy hover:bg-white/90`}>
                        Ver todos los detalles
                      </a>
                      <BotonCompartir
                        texto={`${TEXTO_COMPARTIR} Próxima parada: ${proxima.provincia}, ${fechaLarga(proxima.fecha)}.`}
                        url={URL_PAGINA}
                        className={btnSecundario}
                      />
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                    <div className="text-white font-black text-6xl leading-none">{proxima.burflips}</div>
                    <div className="text-pm-red font-black text-sm uppercase tracking-widest mt-2">burflips</div>
                    <p className="text-white/40 text-xs mt-3 leading-relaxed">
                      Los que le tocan a {RETO.protagonista} ese día. Los que quieras hacer tú, los tuyos.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-pm-bg rounded-3xl p-10 text-center">
                <p className={KICKER}>El reto</p>
                <h2 className="text-3xl font-black text-pm-navy mt-2">50 provincias, completadas</h2>
                <p className="text-gray-500 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
                  La ruta ha terminado. Gracias a todas las personas que salieron a la calle en cada provincia para
                  sumarse al reto y apoyar la lucha contra el cáncer.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── 5 · MAPA ───────────────────────────────────────────────────── */}
        <section className="bg-pm-bg py-16 sm:py-20">
          <div className={CONTENEDOR}>
            <Reveal className="text-center max-w-2xl mx-auto mb-10">
              <p className={KICKER}>El recorrido</p>
              <h2 className="text-3xl font-black text-pm-navy mt-2">Toda España, provincia a provincia</h2>
              <p className="text-gray-500 text-sm mt-4 leading-relaxed">
                De {RETO.ciudadInicio} a {RETO.ciudadFin}, pasando por las {TOTAL_PROVINCIAS} provincias. Pulsa sobre
                cualquier punto para ver el día y la información de esa parada.
              </p>
            </Reveal>
            <MapaEspana etapas={etapas} />
          </div>
        </section>

        {/* ── 6 · RUTA COMPLETA ──────────────────────────────────────────── */}
        <section id="ruta" className="scroll-mt-20 py-16 sm:py-20">
          <div className={CONTENEDOR}>
            <Reveal className="mb-8">
              <p className={KICKER}>Calendario</p>
              <h2 className="text-3xl font-black text-pm-navy mt-2">Las 50 etapas, día a día</h2>
              <p className="text-gray-500 text-sm mt-3 max-w-2xl leading-relaxed">
                Del {fechaLarga(RETO.fechaInicio)} al {fechaLarga(RETO.fechaFin)} de 2026. Los horarios y los puntos de
                encuentro se confirman en los días previos a cada parada.
              </p>
            </Reveal>
            <RutaCalendario etapas={etapas} />
          </div>
        </section>

        {/* ── 7 · RECAUDACIÓN ────────────────────────────────────────────── */}
        <section className="bg-pm-navy py-16 sm:py-20">
          <div className={CONTENEDOR}>
            <div className="text-center max-w-2xl mx-auto">
              <p className={KICKER}>La causa</p>
              <h2 className="text-3xl font-black text-white mt-2">Cada provincia suma</h2>
              <p className="text-white/60 text-sm mt-4 leading-relaxed">
                Lo recaudado va destinado a la lucha contra el cáncer a través de la {RETO.causa}.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-10">
              {[
                {
                  label: 'Recaudado',
                  valor: resumen.recaudadoTotal != null ? euros(resumen.recaudadoTotal) : null,
                },
                {
                  label: 'Personas participando',
                  valor: resumen.participantes != null ? resumen.participantes.toLocaleString('es-ES') : null,
                },
                {
                  label: 'Provincias completadas',
                  valor: `${resumen.provinciasCompletadas} / ${resumen.totalProvincias}`,
                },
                {
                  label: 'Objetivo',
                  valor: config.objetivo_global || null,
                },
              ].map(m => (
                <div key={m.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                  {m.valor ? (
                    <div className="text-white font-black text-2xl sm:text-3xl break-words">{m.valor}</div>
                  ) : (
                    <div className="text-white/30 font-bold text-sm py-2">Aún sin datos</div>
                  )}
                  <div className="text-white/50 text-xs mt-1.5 leading-tight">{m.label}</div>
                </div>
              ))}
            </div>

            {resumen.recaudadoTotal == null && (
              <p className="text-white/40 text-xs text-center mt-6 max-w-xl mx-auto leading-relaxed">
                Las cifras se publicarán aquí a medida que avance la ruta, provincia a provincia.
              </p>
            )}

            {donacion ? (
              <div className="text-center mt-10">
                <a href={donacion} target="_blank" rel="noopener noreferrer" className={`${btnPrimario} bg-white text-pm-navy hover:bg-white/90`}>
                  Donar a la lucha contra el cáncer
                </a>
                <p className="text-white/40 text-xs mt-3">
                  La donación se realiza en la página oficial de la campaña, fuera de esta web.
                </p>
              </div>
            ) : (
              <p className="text-white/50 text-sm text-center mt-10 max-w-xl mx-auto leading-relaxed">
                El canal oficial de donación se anunciará próximamente en esta misma página y en los perfiles del reto.
              </p>
            )}
          </div>
        </section>

        {/* ── 8 · PATROCINADORES ─────────────────────────────────────────── */}
        <section className={`${CONTENEDOR} py-16 sm:py-20`}>
          <Reveal className="text-center max-w-2xl mx-auto mb-10">
            <p className={KICKER}>Quién lo hace posible</p>
            <h2 className="text-3xl font-black text-pm-navy mt-2">Patrocinadores y colaboradores</h2>
          </Reveal>

          {patrocinadores.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {patrocinadores.map((p, i) => {
                const Contenido = (
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
                    <div className="text-center">
                      <span className="text-xs font-black text-pm-red uppercase tracking-widest">{labelNivel(p.nivel)}</span>
                      <h3 className="font-black text-pm-navy mt-1">{p.nombre}</h3>
                      {p.descripcion && <p className="text-gray-500 text-sm mt-2 leading-relaxed">{p.descripcion}</p>}
                    </div>
                  </>
                )
                const clases = `bg-white rounded-2xl border border-gray-100 shadow-sm p-6 pm-card block ${
                  p.destacado ? 'sm:col-span-1' : ''
                }`
                return (
                  <Reveal key={p.id} delay={i * 60}>
                    {p.webUrl ? (
                      <a href={p.webUrl} target="_blank" rel="noopener noreferrer" className={clases}>
                        {Contenido}
                      </a>
                    ) : (
                      <div className={clases}>{Contenido}</div>
                    )}
                  </Reveal>
                )
              })}
            </div>
          )}

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

        {/* ── 9 · GALERÍA Y SEGUIMIENTO ──────────────────────────────────── */}
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
                        {e.recaudado != null && <span>Recaudado: <strong className="text-pm-navy font-black">{euros(e.recaudado)}</strong></span>}
                        {e.asistentes != null && <span><strong className="text-pm-navy font-black">{e.asistentes.toLocaleString('es-ES')}</strong> personas</span>}
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

        {/* ── 10 · FAQ ───────────────────────────────────────────────────── */}
        {faq.length > 0 && (
          <section className={`${CONTENEDOR} py-16 sm:py-20`}>
            <Reveal className="text-center max-w-2xl mx-auto mb-8">
              <p className={KICKER}>Dudas</p>
              <h2 className="text-3xl font-black text-pm-navy mt-2">Preguntas frecuentes</h2>
            </Reveal>
            <Faq preguntas={faq} />
          </section>
        )}

        {/* ── 11 · CIERRE Y COMPARTIR ────────────────────────────────────── */}
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
                instagram={config.instagram_url || ''}
                tiktok={config.tiktok_url || ''}
                youtube={config.youtube_url || ''}
                facebook={config.facebook_url || ''}
              />
            </div>
            {config.web_brosjaca && (
              <a
                href={config.web_brosjaca}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-8 text-white/70 hover:text-white text-sm font-bold underline underline-offset-4"
              >
                Conoce más sobre {RETO.protagonista}
              </a>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
