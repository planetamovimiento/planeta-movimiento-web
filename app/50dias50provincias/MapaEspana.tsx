'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Mapa esquemático de la ruta.
//
// No es un mapa a escala ni lleva las siluetas de las provincias: es un
// esquema de puntos situados por las coordenadas reales de cada capital, con
// la línea del recorrido uniendo las paradas en orden. Canarias va en un
// recuadro aparte porque, a 28° de latitud, metida en el mismo encuadre
// deformaría la península entera.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import {
  AQUI, ESTADOS_ETAPA, ESTADO_ACTUAL, badgeEstadoEtapa, colorEstadoEtapa, dotEstadoEtapa,
  euros, fechaLarga, labelEstadoEtapa,
} from '@/lib/reto50/constants'
import type { EtapaPublica } from '@/lib/reto50/tipos'
import VideoEtapa from './VideoEtapa'

// Encuadre peninsular (incluye Baleares).
const LAT_MAX = 43.9
const LAT_MIN = 36.0
const LNG_MIN = -9.4
const PX_LAT = 61.5
// Corrección por latitud (~cos 40°): sin esto España sale estirada a lo ancho.
const PX_LNG = PX_LAT * 0.766

const OX = 30
const OY = 55

const proyectar = (lat: number, lng: number) => ({
  x: OX + (lng - LNG_MIN) * PX_LNG,
  y: OY + (LAT_MAX - lat) * PX_LAT,
})

// Recuadro de Canarias, abajo a la izquierda.
const proyectarCanarias = (lat: number, lng: number) => ({
  x: 52 + (lng + 16.9) * 68.4,
  y: 452 + (28.75 - lat) * 112.5,
})

const esCanarias = (lat: number) => lat < 32

function posicion(e: EtapaPublica) {
  if (e.lat == null || e.lng == null) return null
  return esCanarias(e.lat) ? proyectarCanarias(e.lat, e.lng) : proyectar(e.lat, e.lng)
}

export default function MapaEspana({ etapas }: { etapas: EtapaPublica[] }) {
  const actual = etapas.find(e => e.estado === ESTADO_ACTUAL) ?? null
  // Al abrir se enseña dónde está Brosjaca ahora y, si el reto no ha arrancado,
  // la primera etapa: así el panel nunca sale vacío.
  const [activa, setActiva] = useState<EtapaPublica | null>(actual ?? etapas[0] ?? null)
  // Con un vídeo en marcha el ratón deja de cambiar la etapa: si no, pasar por
  // encima del mapa te cortaría el vídeo que estás viendo.
  const [bloqueada, setBloqueada] = useState(false)

  const elegir = (e: EtapaPublica, porRaton: boolean) => {
    if (porRaton && bloqueada) return
    setActiva(e)
    if (!porRaton) setBloqueada(false)
  }

  const conPos = etapas.filter(e => posicion(e) !== null)
  // La línea del recorrido solo une lo que se puede unir por tierra/mar en el
  // mismo encuadre: los saltos en avión a Canarias no se dibujan cruzando el mapa.
  const peninsula = conPos.filter(e => e.lat != null && !esCanarias(e.lat)).sort((a, b) => a.dia - b.dia)
  const canarias = conPos.filter(e => e.lat != null && esCanarias(e.lat)).sort((a, b) => a.dia - b.dia)

  const trazado = peninsula
    .map(e => { const p = posicion(e)!; return `${p.x.toFixed(1)},${p.y.toFixed(1)}` })
    .join(' ')

  const trazadoCanarias = canarias
    .map(e => { const p = posicion(e)!; return `${p.x.toFixed(1)},${p.y.toFixed(1)}` })
    .join(' ')

  return (
    // 1.4fr deja al panel derecho ancho suficiente para que el vídeo se vea bien.
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
      <div className="bg-pm-navy rounded-3xl p-3 sm:p-5 overflow-hidden">
        <svg
          viewBox="0 0 700 600"
          className="w-full h-auto"
          role="img"
          aria-label="Esquema de la ruta por las 50 provincias de España"
        >
          {/* Recuadro de Canarias */}
          <rect x="30" y="440" width="150" height="105" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <text x="38" y="458" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="700">CANARIAS</text>

          {/* Recorrido */}
          <polyline points={trazado} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={trazadoCanarias} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />

          {/* Paradas */}
          {conPos.map(e => {
            const p = posicion(e)!
            const activo = activa?.dia === e.dia
            const esActual = e.estado === ESTADO_ACTUAL
            const color = colorEstadoEtapa(e.estado)
            return (
              <g
                key={e.dia}
                tabIndex={0}
                role="button"
                aria-label={`Día ${e.dia}: ${e.provincia}, ${fechaLarga(e.fecha)}. ${
                  esActual ? `${AQUI}.` : labelEstadoEtapa(e.estado)
                }`}
                className="cursor-pointer focus:outline-none"
                onMouseEnter={() => elegir(e, true)}
                onFocus={() => elegir(e, true)}
                onClick={() => elegir(e, false)}
              >
                {/* La etapa actual late para que se encuentre de un vistazo */}
                {esActual && <circle className="pm-pulso" cx={p.x} cy={p.y} r={6} fill={color} />}
                {activo && !esActual && <circle cx={p.x} cy={p.y} r={11} fill={color} opacity={0.25} />}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={esActual ? 7 : activo ? 6 : 4}
                  fill={color}
                  stroke={esActual ? '#fff' : '#0F1A3D'}
                  strokeWidth={esActual ? 2 : 1.5}
                />
                {/* Área de pulsación cómoda en móvil */}
                <circle cx={p.x} cy={p.y} r={13} fill="transparent" />
              </g>
            )
          })}

          {/* Etiqueta «Estamos aquí» pegada a la etapa actual */}
          {actual && (() => {
            const p = posicion(actual)
            if (!p) return null
            // Si el punto cae a la derecha del encuadre, la etiqueta va a la izquierda.
            const derecha = p.x > 480
            return (
              <g aria-hidden="true">
                <rect
                  x={derecha ? p.x - 84 : p.x + 12}
                  y={p.y - 9}
                  width="72"
                  height="18"
                  rx="9"
                  fill="#D42B2B"
                />
                <text
                  x={derecha ? p.x - 48 : p.x + 48}
                  y={p.y + 3.5}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="9.5"
                  fontWeight="800"
                >
                  {AQUI}
                </text>
              </g>
            )
          })()}

          {/* Salida, rotulada mientras no haya etapa actual que destacar */}
          {!actual && peninsula.length > 0 && (() => {
            const p = posicion(peninsula[0])!
            return (
              <text x={p.x + 9} y={p.y + 3} fill="rgba(255,255,255,0.75)" fontSize="10" fontWeight="800">
                Salida
              </text>
            )
          })()}
        </svg>

        <p className="text-[11px] text-white/35 mt-2 px-1 leading-relaxed">
          Esquema orientativo: los puntos se sitúan por las coordenadas de cada capital de provincia, no es un mapa a
          escala. Los desplazamientos en avión a las islas no se dibujan como línea.
        </p>
      </div>

      {/* Ficha de la parada seleccionada */}
      <div className="lg:sticky lg:top-24">
        {activa ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-pm-red uppercase tracking-widest">Día {activa.dia}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeEstadoEtapa(activa.estado)}`}>
                {activa.estado === ESTADO_ACTUAL ? AQUI : labelEstadoEtapa(activa.estado)}
              </span>
            </div>
            <h3 className="text-2xl font-black text-pm-navy mt-1">{activa.provincia}</h3>
            <p className="text-sm text-gray-500 capitalize">{fechaLarga(activa.fecha)}</p>

            {activa.ciudad && <p className="text-sm text-gray-600 mt-3">{activa.ciudad}</p>}

            {activa.hora && <p className="text-sm text-gray-600 mt-1">Hora: {activa.hora}</p>}
            {activa.puntoEncuentro && <p className="text-sm text-gray-600 mt-1">{activa.puntoEncuentro}</p>}

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-xl font-black text-pm-navy">{activa.burflips}</div>
                <div className="text-xs text-gray-400">burflips ese día</div>
              </div>
              <div>
                <div className="text-xl font-black text-pm-navy">
                  {activa.recaudado != null ? euros(activa.recaudado) : <span className="text-gray-300">—</span>}
                </div>
                <div className="text-xs text-gray-400">recaudado</div>
              </div>
            </div>

            {activa.asistentes != null && (
              <p className="text-sm text-gray-600 mt-3">
                {activa.asistentes.toLocaleString('es-ES')} personas se sumaron.
              </p>
            )}

            {activa.enlaceRedes && (
              <a
                href={activa.enlaceRedes}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-sm font-bold text-pm-red hover:text-pm-red-dark"
              >
                Ver la jornada →
              </a>
            )}
          </div>
        ) : (
          <div className="bg-pm-bg rounded-2xl border border-gray-100 p-6 text-center">
            <p className="text-sm text-gray-500">
              Pasa el ratón o pulsa sobre cualquier punto del mapa para ver el día, la fecha y el vídeo resumen de esa
              provincia.
            </p>
          </div>
        )}

        {/* Vídeo del día. La key reinicia el reproductor al cambiar de etapa. */}
        {activa && (
          <div className="mt-4">
            <VideoEtapa key={activa.dia} etapa={activa} onReproducir={() => setBloqueada(true)} />
          </div>
        )}

        {/* Leyenda: los estados básicos y solo los excepcionales que se usen */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 px-1">
          {ESTADOS_ETAPA.filter(
            s => ['proximamente', 'en-curso', 'finalizada'].includes(s.id) || etapas.some(e => e.estado === s.id),
          ).map(s => (
            <span key={s.id} className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <span className={`w-2.5 h-2.5 rounded-full ${dotEstadoEtapa(s.id)}`} />
              {s.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
