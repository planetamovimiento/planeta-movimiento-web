'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Calendario de las 50 etapas: la vista principal de la ruta.
//
// Con 50 días una línea temporal obligaba a un scroll enorme, así que la ruta
// se consulta aquí (rejilla por meses) y en el mapa. Cada tarjeta se despliega
// para ver el detalle de esa etapa.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react'
import {
  AQUI, ESTADOS_ETAPA, ESTADO_ACTUAL, badgeEstadoEtapa, dotEstadoEtapa, euros,
  fechaCorta, fechaLarga, labelEstadoEtapa,
} from '@/lib/reto50/constants'
import type { EtapaPublica } from '@/lib/reto50/tipos'
import VideoEtapa from './VideoEtapa'

const MESES =['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const mesDe = (iso: string) => Number(iso.slice(5, 7)) - 1
const anioDe = (iso: string) => iso.slice(0, 4)

/** Quita acentos para que buscar "avila" encuentre "Ávila". */
const normaliza = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const IconoOk = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
)

/** Estilo de la tarjeta según el estado: es lo que se lee de un vistazo. */
function estiloTarjeta(estado: string): string {
  switch (estado) {
    case ESTADO_ACTUAL:
      return 'border-pm-red border-2 bg-pm-red/[0.04] shadow-md'
    case 'finalizada':
      return 'border-emerald-200 bg-emerald-50/60'
    case 'cancelada':
      return 'border-gray-200 bg-gray-50 opacity-70'
    case 'modificada':
      return 'border-blue-200 bg-blue-50/50'
    default:
      return 'border-gray-100 bg-white'
  }
}

function Detalle({ etapa }: { etapa: EtapaPublica }) {
  const datos: [string, string][] = []
  if (etapa.hora) datos.push(['Hora', etapa.hora])
  if (etapa.puntoEncuentro) datos.push(['Punto de encuentro', etapa.puntoEncuentro])
  datos.push(['Burflips del día', String(etapa.burflips)])
  if (etapa.recaudado != null) datos.push(['Recaudado', euros(etapa.recaudado)])
  if (etapa.asistentes != null) datos.push(['Personas', etapa.asistentes.toLocaleString('es-ES')])

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
      <dl className="space-y-1.5">
        {datos.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 text-xs">
            <dt className="text-gray-400 shrink-0">{k}</dt>
            <dd className="font-bold text-pm-navy text-right break-words min-w-0">{v}</dd>
          </div>
        ))}
      </dl>

      {!etapa.hora && !etapa.puntoEncuentro && (
        <p className="text-xs text-gray-400 leading-relaxed">
          La hora y el punto de encuentro se confirman en los días previos.
        </p>
      )}

      {etapa.enlaceRedes && (
        <a
          href={etapa.enlaceRedes}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs font-bold text-pm-red hover:text-pm-red-dark"
        >
          Ver la jornada →
        </a>
      )}

      {/* El mismo vídeo que en el mapa: misma etapa, mismos datos. */}
      <VideoEtapa etapa={etapa} />
    </div>
  )
}

export default function RutaCalendario({ etapas }: { etapas: EtapaPublica[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [abierta, setAbierta] = useState<number | null>(null)

  const filtradas = useMemo(() => {
    const q = normaliza(busqueda.trim())
    if (!q) return etapas
    return etapas.filter(e =>
      normaliza(e.provincia).includes(q) ||
      normaliza(e.ciudad).includes(q) ||
      String(e.dia) === q
    )
  }, [etapas, busqueda])

  const porMes = useMemo(() => {
    const grupos = new Map<string, EtapaPublica[]>()
    for (const e of filtradas) {
      const clave = `${anioDe(e.fecha)}-${String(mesDe(e.fecha)).padStart(2, '0')}`
      const lista = grupos.get(clave)
      if (lista) lista.push(e)
      else grupos.set(clave, [e])
    }
    return [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [filtradas])

  const hechas = etapas.filter(e => e.estado === 'finalizada').length

  return (
    <div>
      {/* Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-sm text-gray-500">
            <strong className="text-pm-navy font-black">{hechas}</strong> de {etapas.length} completadas
          </span>
          {/* Leyenda: básicos siempre, excepcionales solo si se usan */}
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

      {filtradas.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-12">
          No hay ninguna parada que coincida con «{busqueda}».
        </p>
      )}

      {/* Calendario por meses */}
      <div className="space-y-8">
        {porMes.map(([clave, dias]) => (
          <div key={clave}>
            <h3 className="text-xs font-black text-pm-red uppercase tracking-widest mb-3">
              {MESES[mesDe(dias[0].fecha)]} {anioDe(dias[0].fecha)}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {dias.map(e => {
                const esActual = e.estado === ESTADO_ACTUAL
                const hecha = e.estado === 'finalizada'
                const desplegada = abierta === e.dia
                return (
                  <div
                    key={e.dia}
                    className={`rounded-xl border p-3 min-w-0 transition-colors ${estiloTarjeta(e.estado)}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-gray-400">{fechaCorta(e.fecha)}</span>
                      {hecha ? (
                        <span className="text-emerald-600" title="Completada"><IconoOk /></span>
                      ) : (
                        <span className={`w-2 h-2 rounded-full shrink-0 ${dotEstadoEtapa(e.estado)}`} title={labelEstadoEtapa(e.estado)} />
                      )}
                    </div>

                    <div className={`text-xs font-black mt-1.5 ${esActual ? 'text-pm-red' : 'text-gray-400'}`}>
                      Día {e.dia}
                    </div>
                    <div className="font-black text-pm-navy text-sm leading-tight mt-0.5 break-words">{e.provincia}</div>
                    {e.ciudad && <div className="text-xs text-gray-400 mt-0.5 break-words">{e.ciudad}</div>}

                    {/* Estado: lo que hay que entender de un vistazo */}
                    <div className="mt-2">
                      {esActual ? (
                        <span className="inline-flex items-center gap-1.5 bg-pm-red text-white text-[11px] font-black uppercase tracking-wide rounded-full px-2 py-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          {AQUI}
                        </span>
                      ) : e.estado !== 'proximamente' ? (
                        <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeEstadoEtapa(e.estado)}`}>
                          {labelEstadoEtapa(e.estado)}
                        </span>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => setAbierta(desplegada ? null : e.dia)}
                      aria-expanded={desplegada}
                      className="mt-2 text-xs font-bold text-gray-400 hover:text-pm-red transition-colors"
                    >
                      {desplegada ? 'Ocultar detalles' : 'Ver detalles'}
                    </button>

                    {desplegada && (
                      <>
                        <p className="sr-only">{fechaLarga(e.fecha)}</p>
                        <Detalle etapa={e} />
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
