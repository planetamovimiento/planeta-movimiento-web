'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Las 50 etapas, en dos vistas: línea temporal y calendario por meses.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react'
import { badgeEstadoEtapa, dotEstadoEtapa, euros, fechaCorta, fechaLarga, labelEstadoEtapa } from '@/lib/reto50/constants'
import type { EtapaPublica } from '@/lib/reto50/tipos'

type Vista = 'linea' | 'calendario'

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const mesDe = (iso: string) => Number(iso.slice(5, 7)) - 1
const anioDe = (iso: string) => iso.slice(0, 4)

/** Quita acentos para que buscar "avila" encuentre "Ávila". */
const normaliza = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function Etiqueta({ etapa }: { etapa: EtapaPublica }) {
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${badgeEstadoEtapa(etapa.estado)}`}>
      {labelEstadoEtapa(etapa.estado)}
    </span>
  )
}

function Ciudad({ etapa }: { etapa: EtapaPublica }) {
  if (!etapa.ciudad) return null
  return <span className="text-sm text-gray-500">{etapa.ciudad}</span>
}

export default function RutaCalendario({ etapas }: { etapas: EtapaPublica[] }) {
  const [vista, setVista] = useState<Vista>('linea')
  const [busqueda, setBusqueda] = useState('')

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

  const btnVista = (v: Vista, label: string) => (
    <button
      type="button"
      onClick={() => setVista(v)}
      className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
        vista === v ? 'bg-pm-navy text-white' : 'text-gray-500 hover:text-pm-navy hover:bg-pm-bg'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div>
      {/* Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1 self-start">
          {btnVista('linea', 'Línea temporal')}
          {btnVista('calendario', 'Calendario')}
        </div>
        <div className="relative sm:w-64">
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

      {/* Vista: línea temporal */}
      {vista === 'linea' && filtradas.length > 0 && (
        <ol className="relative border-l-2 border-gray-100 ml-3 sm:ml-4">
          {filtradas.map(e => (
            <li key={e.dia} className="relative pl-5 sm:pl-7 pb-5 last:pb-0">
              <span className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white ${dotEstadoEtapa(e.estado)}`} />
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 pm-card">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-xs font-black text-pm-red uppercase tracking-widest">Día {e.dia}</span>
                  <span className="text-xs text-gray-400 capitalize">{fechaLarga(e.fecha)}</span>
                  <Etiqueta etapa={e} />
                </div>
                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-lg font-black text-pm-navy">{e.provincia}</h3>
                  <Ciudad etapa={e} />
                </div>
                {e.descripcion && <p className="text-sm text-gray-500 mt-2 leading-relaxed">{e.descripcion}</p>}

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500">
                  <span><strong className="text-pm-navy font-black">{e.burflips}</strong> burflips</span>
                  {e.hora && <span>Hora: {e.hora}</span>}
                  {e.puntoEncuentro && <span>{e.puntoEncuentro}</span>}
                  {e.recaudado != null && <span>Recaudado: <strong className="text-pm-navy font-black">{euros(e.recaudado)}</strong></span>}
                  {e.asistentes != null && <span><strong className="text-pm-navy font-black">{e.asistentes.toLocaleString('es-ES')}</strong> personas</span>}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      {/* Vista: calendario por meses */}
      {vista === 'calendario' && filtradas.length > 0 && (
        <div className="space-y-8">
          {porMes.map(([clave, dias]) => (
            <div key={clave}>
              <h3 className="text-xs font-black text-pm-red uppercase tracking-widest mb-3">
                {MESES[mesDe(dias[0].fecha)]} {anioDe(dias[0].fecha)}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {dias.map(e => (
                  <div key={e.dia} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 pm-card min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-gray-300">{fechaCorta(e.fecha)}</span>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${dotEstadoEtapa(e.estado)}`} title={labelEstadoEtapa(e.estado)} />
                    </div>
                    <div className="text-xs font-black text-pm-red mt-1.5">Día {e.dia}</div>
                    <div className="font-black text-pm-navy text-sm leading-tight mt-0.5 break-words">{e.provincia}</div>
                    {e.ciudad && <div className="text-xs text-gray-400 mt-0.5 truncate" title={e.ciudad}>{e.ciudad}</div>}
                    <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">
                      <strong className="text-pm-navy font-black">{e.burflips}</strong> burflips
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
