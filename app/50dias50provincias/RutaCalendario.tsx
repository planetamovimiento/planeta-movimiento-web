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
  AQUI, ESTADOS_ETAPA, ESTADO_ACTUAL, badgeEstadoEtapa, dotEstadoEtapa, euros,
  fechaCorta, fechaLarga, labelEstadoEtapa,
} from '@/lib/reto50/constants'
import type { EtapaPublica } from '@/lib/reto50/tipos'
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

/** Estilo de la tarjeta según el estado: lo que se lee de un vistazo. */
function estiloTarjeta(estado: string): string {
  switch (estado) {
    case ESTADO_ACTUAL:
      return 'border-pm-red border-2 bg-pm-red/[0.05] shadow-md ring-2 ring-pm-red/20'
    case 'finalizada':
      return 'border-emerald-300 bg-emerald-50/70'
    case 'cancelada':
      return 'border-gray-200 bg-gray-50 opacity-70'
    case 'modificada':
      return 'border-blue-200 bg-blue-50/60'
    default:
      return 'border-gray-100 bg-white'
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
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-black text-gray-400">{fechaCorta(etapa.fecha)}</span>
        <Bandera etapa={etapa} />
      </div>

      <div className={`text-[11px] font-black mt-1.5 ${esActual ? 'text-pm-red' : 'text-gray-400'}`}>Día {etapa.dia}</div>
      <div className="font-black text-pm-navy text-sm leading-tight mt-0.5 break-words">{etapa.provincia}</div>
      {etapa.ciudad && <div className="text-[11px] text-gray-400 mt-0.5 break-words leading-tight">{etapa.ciudad}</div>}

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
        className="mt-1.5 text-[11px] font-bold text-gray-400 hover:text-pm-red transition-colors cursor-pointer"
      >
        {activa ? 'Detalles abajo ↓' : 'Ver detalles'}
      </button>
    </div>
  )
}

export default function RutaCalendario({ etapas }: { etapas: EtapaPublica[] }) {
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

  const totalHechas = etapas.filter(e => e.estado === 'finalizada').length
  const etapaAbierta = abierta == null ? null : filtradas.find(e => e.dia === abierta) ?? null

  function verDetalles(dia: number) {
    setAbierta(prev => (prev === dia ? null : dia))
    // Llevar el panel de detalle a la vista, suave.
    requestAnimationFrame(() => detalleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
  }

  return (
    <div>
      {/* Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-sm text-gray-500">
            <strong className="text-pm-navy font-black">{totalHechas}</strong> de {etapas.length} completadas
          </span>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {ESTADOS_ETAPA.filter(
              s => ['proximamente', 'en-curso', 'finalizada'].includes(s.id) || etapas.some(e => e.estado === s.id),
            ).map(s => (
              <span key={s.id} className="inline-flex items-center gap-1.5 text-xs text-gray-400">
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
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"
          />
          <svg className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
        </div>
      </div>

      {filtradas.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-12">No hay ninguna parada que coincida con «{busqueda}».</p>
      ) : (
        <>
          {/* La ruta: carretera de fondo + tarjetas en serpiente */}
          <div className="relative">
            <Carretera total={filtradas.length} cols={cols} hechas={hechas} />
            <div
              className="relative grid gap-3.5 sm:gap-4"
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
                      <p className="text-xs text-gray-400 capitalize">{fechaLarga(etapaAbierta.fecha)}</p>
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

                <DetalleCuerpo etapa={etapaAbierta} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/** Cuerpo del detalle: datos + vídeo. Mismo contenido que antes, sin cambios de lógica. */
function DetalleCuerpo({ etapa }: { etapa: EtapaPublica }) {
  const datos: [string, string][] = []
  if (etapa.hora) datos.push(['Hora', etapa.hora])
  if (etapa.puntoEncuentro) datos.push(['Punto de encuentro', etapa.puntoEncuentro])
  datos.push(['Burflips del día', String(etapa.burflips)])
  if (etapa.recaudado != null) datos.push(['Recaudado', euros(etapa.recaudado)])
  if (etapa.asistentes != null) datos.push(['Personas', etapa.asistentes.toLocaleString('es-ES')])

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
        {datos.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2 text-sm border-b border-gray-50 pb-1.5">
            <dt className="text-gray-400 shrink-0">{k}</dt>
            <dd className="font-bold text-pm-navy text-right break-words min-w-0">{v}</dd>
          </div>
        ))}
      </dl>

      {!etapa.hora && !etapa.puntoEncuentro && (
        <p className="text-xs text-gray-400 leading-relaxed">La hora y el punto de encuentro se confirman en los días previos.</p>
      )}

      {etapa.enlaceRedes && (
        <a href={etapa.enlaceRedes} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-bold text-pm-red hover:text-pm-red-dark">
          Ver la jornada →
        </a>
      )}

      <VideoEtapa etapa={etapa} />
    </div>
  )
}
