'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Calendario de las 50 etapas, con forma de RUTA por carretera.
//
// Las tarjetas se disponen en serpiente (una fila izq→der, la siguiente
// der→izq…) manteniendo SIEMPRE el orden cronológico, y una carretera de fondo
// (componente Carretera) las une del día 1 al 50 como un único recorrido. En
// móvil la ruta pasa a ser vertical.
//
// «Ver detalles» abre el detalle de esa etapa —con su vídeo, recaudación,
// burflips y estado— en un panel bajo la ruta, para no deformar la cuadrícula
// ni romper la carretera. Es exactamente la misma información de siempre.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AQUI, ESTADOS_ETAPA, ESTADO_ACTUAL, RETO, WHATSAPP, badgeEstadoEtapa, dotEstadoEtapa, enlaceWhatsapp,
  euros, kilos, fechaCorta, fechaLarga, labelEstadoEtapa,
} from '@/lib/reto50/constants'
import type { ColaboradorLocal, ConfigReto, EtapaPublica } from '@/lib/reto50/tipos'
import VideoEtapa from './VideoEtapa'
import Carretera from './Carretera'

/** Quita acentos para que buscar "avila" encuentre "Ávila". */
const normaliza = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const IconoOk = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
)

const IconoBanderin = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 21V5m0 0l7-2 7 2v9l-7-2-7 2" />
  </svg>
)

/**
 * Estilo de la tarjeta según el estado. Van sobre el paisaje, así que llevan
 * fondo sólido y sombra para separarse del fondo y seguir siendo legibles.
 */
function estiloTarjeta(estado: string): string {
  const base = 'shadow-lg shadow-black/25'
  switch (estado) {
    case ESTADO_ACTUAL:
      return `${base} border-pm-red border-2 bg-white ring-4 ring-pm-red/30 shadow-pm-red/30`
    case 'finalizada':
      return `${base} border-emerald-300 bg-emerald-50`
    case 'cancelada':
      return `${base} border-gray-300 bg-gray-100 opacity-80`
    case 'modificada':
      return `${base} border-blue-300 bg-blue-50`
    default:
      return `${base} border-white/60 bg-white`
  }
}

/** Bandera de la provincia. Si no hay imagen, un hueco neutro que no rompe nada. */
function Bandera({ etapa }: { etapa: EtapaPublica }) {
  if (!etapa.banderaUrl) {
    return (
      <span className="w-9 h-6 rounded-[3px] bg-gray-100 border border-gray-200 grid place-items-center text-gray-300 shrink-0" aria-hidden="true">
        <IconoBanderin />
      </span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={etapa.banderaUrl}
      alt={etapa.banderaAlt || `Bandera de ${etapa.provincia}`}
      loading="lazy"
      className="w-9 h-6 rounded-[3px] object-cover border border-gray-200 shrink-0 bg-white"
    />
  )
}

/** Una parada de la ruta. Toda la info clave queda visible sin depender de la carretera. */
function Tarjeta({ etapa, activa, onVer }: { etapa: EtapaPublica; activa: boolean; onVer: () => void }) {
  const esActual = etapa.estado === ESTADO_ACTUAL
  const hecha = etapa.estado === 'finalizada'

  return (
    <div className={`relative rounded-xl border p-2.5 min-w-0 pm-card ${estiloTarjeta(etapa.estado)} ${activa ? 'ring-2 ring-pm-navy/30' : ''}`}>
      {/* Grises 500/600: el 400 no llega al contraste mínimo sobre blanco */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-black text-gray-500">{fechaCorta(etapa.fecha)}</span>
        <Bandera etapa={etapa} />
      </div>

      <div className={`text-[11px] font-black mt-1.5 ${esActual ? 'text-pm-red' : 'text-gray-500'}`}>Día {etapa.dia}</div>
      <div className="font-black text-pm-navy text-sm leading-tight mt-0.5 break-words">{etapa.provincia}</div>
      {etapa.ciudad && <div className="text-[11px] text-gray-500 mt-0.5 break-words leading-tight">{etapa.ciudad}</div>}

      {/* Estado: siempre visible (accesibilidad), no depende de la carretera */}
      <div className="mt-1.5">
        {esActual ? (
          <span className="inline-flex items-center gap-1.5 bg-pm-red text-white text-[10px] font-black uppercase tracking-wide rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {AQUI}
          </span>
        ) : hecha ? (
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 text-[10px] font-bold rounded-full px-2 py-0.5">
            <IconoOk className="w-3 h-3" /> Completada
          </span>
        ) : (
          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeEstadoEtapa(etapa.estado)}`}>
            {labelEstadoEtapa(etapa.estado)}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onVer}
        aria-expanded={activa}
        className="mt-1.5 text-[11px] font-bold text-gray-600 hover:text-pm-red transition-colors cursor-pointer"
      >
        {activa ? 'Detalles abajo ↓' : 'Ver detalles'}
      </button>
    </div>
  )
}

export default function RutaCalendario({ etapas, config, colaboradores }: {
  etapas: EtapaPublica[]; config: ConfigReto; colaboradores: ColaboradorLocal[]
}) {
  const [busqueda, setBusqueda] = useState('')
  const [abierta, setAbierta] = useState<number | null>(null)
  // Columnas de la ruta: móvil 1, tablet 3, escritorio 5. Se calcula al montar.
  const [cols, setCols] = useState(5)
  const detalleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const calc = () => setCols(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 3 : 5)
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  const filtradas = useMemo(() => {
    const q = normaliza(busqueda.trim())
    if (!q) return etapas
    return etapas.filter(e =>
      normaliza(e.provincia).includes(q) || normaliza(e.ciudad).includes(q) || String(e.dia) === q,
    )
  }, [etapas, busqueda])

  // Orden serpiente: se invierte el orden visual de las filas impares, pero el
  // array sigue siendo cronológico (día 1, 2, 3…), solo cambia dónde se pinta.
  const ordenVisual = useMemo(() => {
    const out: EtapaPublica[] = []
    for (let inicio = 0; inicio < filtradas.length; inicio += cols) {
      const fila = filtradas.slice(inicio, inicio + cols)
      const nFila = Math.floor(inicio / cols)
      out.push(...(nFila % 2 === 1 ? [...fila].reverse() : fila))
    }
    return out
  }, [filtradas, cols])

  // Hasta dónde ha llegado la ruta: la posición más avanzada que esté hecha o en curso.
  const hechas = useMemo(() => {
    let idx = -1
    filtradas.forEach((e, i) => {
      if (e.estado === 'finalizada' || e.estado === ESTADO_ACTUAL) idx = i
    })
    return idx + 1
  }, [filtradas])

  // Posición de la etapa en curso, para iluminar su tramo de carretera.
  const idxActual = useMemo(() => filtradas.findIndex(e => e.estado === ESTADO_ACTUAL), [filtradas])

  const totalHechas = etapas.filter(e => e.estado === 'finalizada').length
  const etapaAbierta = abierta == null ? null : filtradas.find(e => e.dia === abierta) ?? null

  // Acumulados de recaudación por día (billetes en céntimos y kilos de céntimos).
  // Solo cuentan las etapas con estado != «pendiente». Se recorre en orden de día.
  const acumPorDia = useMemo(() => {
    const cuenta = (e: EtapaPublica) => (e.recaudacionEstado ?? 'registrado') !== 'pendiente'
    const orden = [...etapas].sort((a, b) => a.dia - b.dia)
    const map = new Map<number, { kg: number; billetes: number }>()
    let kg = 0, billetes = 0
    for (const e of orden) {
      if (cuenta(e)) {
        if (e.centimosKg != null) kg += e.centimosKg
        if (e.billetesCents != null) billetes += e.billetesCents
      }
      map.set(e.dia, { kg, billetes })
    }
    return map
  }, [etapas])

  function verDetalles(dia: number) {
    setAbierta(prev => (prev === dia ? null : dia))
    // Llevar el panel de detalle a la vista, suave.
    requestAnimationFrame(() => detalleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
  }

  return (
    <div>
      {/* Controles */}
      {/* Controles sobre el paisaje: en claro para que se lean */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-sm text-white/70">
            <strong className="text-white font-black">{totalHechas}</strong> de {etapas.length} completadas
          </span>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {ESTADOS_ETAPA.filter(
              s => ['proximamente', 'en-curso', 'finalizada'].includes(s.id) || etapas.some(e => e.estado === s.id),
            ).map(s => (
              <span key={s.id} className="inline-flex items-center gap-1.5 text-xs text-white/60">
                <span className={`w-2 h-2 rounded-full ${dotEstadoEtapa(s.id)}`} />
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative sm:w-56 shrink-0">
          <input
            type="search"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Busca tu provincia…"
            aria-label="Buscar provincia"
            className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-pm-red focus:bg-white/15 backdrop-blur-sm"
          />
          <svg className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
        </div>
      </div>

      {filtradas.length === 0 ? (
        <p className="text-center text-sm text-white/60 py-12">No hay ninguna parada que coincida con «{busqueda}».</p>
      ) : (
        <>
          {/* La ruta: carretera de fondo + tarjetas en serpiente.
              La separación es generosa a propósito: por ahí asoma el asfalto. */}
          <div className="relative">
            <Carretera total={filtradas.length} cols={cols} hechas={hechas} actual={idxActual} />
            <div
              className="relative grid gap-7 sm:gap-8"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {ordenVisual.map(e => (
                <Tarjeta key={e.dia} etapa={e} activa={abierta === e.dia} onVer={() => verDetalles(e.dia)} />
              ))}
            </div>
          </div>

          {/* Detalle de la etapa seleccionada: misma info y mismo vídeo de siempre */}
          <div ref={detalleRef}>
            {etapaAbierta && (
              <div className="pm-in mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 max-w-2xl mx-auto">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Bandera etapa={etapaAbierta} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-pm-red uppercase tracking-widest">Día {etapaAbierta.dia}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeEstadoEtapa(etapaAbierta.estado)}`}>
                          {etapaAbierta.estado === ESTADO_ACTUAL ? AQUI : labelEstadoEtapa(etapaAbierta.estado)}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-pm-navy leading-tight mt-0.5">{etapaAbierta.provincia}</h3>
                      <p className="text-xs text-gray-500 capitalize">{fechaLarga(etapaAbierta.fecha)}</p>
                      {etapaAbierta.ciudad && <p className="text-sm text-gray-500 mt-0.5">{etapaAbierta.ciudad}</p>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAbierta(null)}
                    aria-label="Cerrar detalles"
                    className="shrink-0 w-8 h-8 grid place-items-center rounded-full text-gray-400 hover:bg-pm-bg hover:text-pm-navy transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <DetalleCuerpo etapa={etapaAbierta} acum={acumPorDia.get(etapaAbierta.dia) ?? null} config={config} colaboradores={colaboradores} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const IconoWhatsapp = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

/**
 * Contacto para colaborar en esa etapa concreta. Sale en todas: el mensaje se
 * arma con la provincia abierta, así quien escribe ya dice dónde puede ayudar.
 */
function BotonWhatsapp({ etapa, config }: { etapa: EtapaPublica; config: ConfigReto }) {
  if (config.wa_activo === 'no') return null

  const prefijo = config.wa_prefijo || WHATSAPP.prefijo
  const numero = config.wa_numero || WHATSAPP.numero
  const plantilla = config.wa_mensaje || WHATSAPP.mensaje
  const texto = config.wa_boton || WHATSAPP.textoBoton
  // Siempre la provincia: algunas ciudades llevan coletillas («Cuenca / Planeta
  // Movimiento») que en un mensaje de WhatsApp quedan raras.
  const lugar = etapa.provincia
  const mensaje = plantilla.replace(/\{provincia\}/g, lugar)

  return (
    <a
      href={enlaceWhatsapp(prefijo, numero, mensaje)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Escribir por WhatsApp para colaborar en la etapa de ${lugar}`}
      className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-sm px-4 py-3 rounded-xl transition-colors"
    >
      <IconoWhatsapp />
      {texto}
    </a>
  )
}

/**
 * Quien echa una mano en esta provincia concreta: solo nombre y logo. Si no hay
 * ninguno el bloque no se pinta, para no dejar un hueco vacío en la etapa.
 */
function ColaboradoresEtapa({ etapa, colaboradores }: { etapa: EtapaPublica; colaboradores: ColaboradorLocal[] }) {
  const suyos = colaboradores.filter(c => c.provincias.includes(etapa.provincia))
  if (suyos.length === 0) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-pm-bg p-4">
      <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">
        Colaboradores locales de esta etapa
      </p>
      <ul className="flex flex-wrap gap-2 mt-3">
        {suyos.map(c => {
          const contenido = (
            <>
              {c.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logoUrl} alt={c.nombre} loading="lazy" className="h-8 w-auto max-w-[7rem] object-contain" />
              ) : (
                <span className="text-sm font-bold text-pm-navy">{c.nombre}</span>
              )}
            </>
          )
          const clases = 'bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-center min-h-[3rem]'
          return (
            <li key={c.id} title={c.nombre}>
              {c.webUrl ? (
                <a href={c.webUrl} target="_blank" rel="noopener noreferrer"
                  aria-label={`Web de ${c.nombre}`}
                  className={`${clases} hover:border-pm-red transition-colors`}>
                  {contenido}
                </a>
              ) : (
                <div className={clases}>{contenido}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * Recaudación de esa provincia: DOS magnitudes separadas (billetes en euros y
 * kilos de céntimos), con el dato del día y el acumulado hasta esa etapa. Los
 * kilos nunca se convierten a euros. Si la etapa está «pendiente» de registrar,
 * no se muestra su dato como público.
 */
function RecaudacionProvincia({ etapa, acum }: { etapa: EtapaPublica; acum: { kg: number; billetes: number } | null }) {
  const publica = (etapa.recaudacionEstado ?? 'registrado') !== 'pendiente'
  const kgHoy = publica ? etapa.centimosKg : null
  const billetesHoy = publica ? etapa.billetesCents : null
  const hayDato = kgHoy != null || billetesHoy != null

  return (
    <div className={`rounded-xl border p-4 ${hayDato ? 'bg-emerald-50 border-emerald-200' : 'bg-pm-bg border-gray-200'}`}>
      <p className={`text-[11px] font-black uppercase tracking-widest ${hayDato ? 'text-emerald-700' : 'text-gray-500'}`}>
        Recaudación en {etapa.provincia}
      </p>

      {hayDato ? (
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">Billetes hoy</div>
            <div className="text-xl font-black text-pm-navy leading-none">{billetesHoy != null ? euros(billetesHoy / 100) : '—'}</div>
            {acum && acum.billetes > 0 && <div className="text-[11px] text-gray-500 mt-1">Acumulado: {euros(acum.billetes / 100)}</div>}
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">Céntimos hoy</div>
            <div className="text-xl font-black text-pm-navy leading-none">{kgHoy != null ? kilos(kgHoy) : '—'}</div>
            {acum && acum.kg > 0 && <div className="text-[11px] text-gray-500 mt-1">Acumulado: {kilos(acum.kg)}</div>}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
          Aún sin datos. Se publica cuando se registra la jornada de esta provincia.
        </p>
      )}
    </div>
  )
}

/** Cuerpo del detalle: datos + vídeo. Mismo contenido que antes, sin cambios de lógica. */
function DetalleCuerpo({ etapa, acum, config, colaboradores }: {
  etapa: EtapaPublica; acum: { kg: number; billetes: number } | null; config: ConfigReto; colaboradores: ColaboradorLocal[]
}) {
  const datos: [string, string][] = []
  if (etapa.hora) datos.push(['Hora', etapa.hora])
  if (etapa.puntoEncuentro) datos.push(['Punto de encuentro', etapa.puntoEncuentro])
  datos.push(['Burflips del día', String(etapa.burflips)])

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
      <RecaudacionProvincia etapa={etapa} acum={acum} />

      <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
        {datos.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2 text-sm border-b border-gray-50 pb-1.5">
            <dt className="text-gray-500 shrink-0">{k}</dt>
            <dd className="font-bold text-pm-navy text-right break-words min-w-0">{v}</dd>
          </div>
        ))}
      </dl>

      {!etapa.hora && !etapa.puntoEncuentro && (
        <p className="text-xs text-gray-500 leading-relaxed">La hora y el punto de encuentro se confirman en los días previos.</p>
      )}

      {etapa.enlaceRedes && (
        <a href={etapa.enlaceRedes} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-bold text-pm-red hover:text-pm-red-dark">
          Ver la jornada →
        </a>
      )}

      <VideoEtapa etapa={etapa} />

      <ColaboradoresEtapa etapa={etapa} colaboradores={colaboradores} />

      {/* Contacto para colaborar en esta etapa: va tras el vídeo para no taparlo */}
      <BotonWhatsapp etapa={etapa} config={config} />
    </div>
  )
}
