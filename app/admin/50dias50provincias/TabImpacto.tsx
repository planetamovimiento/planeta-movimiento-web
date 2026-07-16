'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Recaudación y participantes por provincia.
// Regla: vacío = sin dato (null). Nunca se guarda ni se muestra un 0 inventado.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { euros, labelEstadoEtapa, badgeEstadoEtapa } from '@/lib/reto50/constants'
import type { Etapa, ResumenReto } from '@/lib/reto50/tipos'
import { guardarEtapa } from './actions'
import { Bloque, BotonGuardar, SinDato, inputCls, type Correr } from './piezas'

type Props = {
  etapas: Etapa[]
  resumen: ResumenReto
  pending: boolean
  correr: Correr
  editable: boolean
}

type Draft = { recaudado: string; asistentes: string }

const aDraft = (e: Etapa): Draft => ({
  recaudado: e.recaudado == null ? '' : String(e.recaudado),
  asistentes: e.asistentes == null ? '' : String(e.asistentes),
})

function Metrica({ label, valor, sub }: { label: string; valor: string | null; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="mt-1 text-2xl font-black text-pm-navy">
        {valor ?? <SinDato />}
      </div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function TabImpacto({ etapas, resumen, pending, correr, editable }: Props) {
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})

  const draftDe = (e: Etapa): Draft => drafts[e.id] ?? aDraft(e)
  const set = (id: string, campo: keyof Draft, valor: string) =>
    setDrafts(d => ({ ...d, [id]: { ...(d[id] ?? aDraft(etapas.find(e => e.id === id)!)), [campo]: valor } }))

  const sucia = (e: Etapa) => {
    const d = drafts[e.id]
    if (!d) return false
    const o = aDraft(e)
    return d.recaudado !== o.recaudado || d.asistentes !== o.asistentes
  }

  function guardar(e: Etapa) {
    const d = draftDe(e)
    correr(async () => {
      const r = await guardarEtapa({
        id: e.id,
        // '' viaja como null: es "sin dato", no un cero.
        recaudado: d.recaudado.trim() === '' ? null : d.recaudado.trim(),
        asistentes: d.asistentes.trim() === '' ? null : d.asistentes.trim(),
      })
      if (r.ok) setDrafts(prev => { const { [e.id]: _quitada, ...resto } = prev; return resto })
      return r
    })
  }

  const conDato = etapas.filter(e => e.recaudado != null).length

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metrica label="Recaudado" valor={resumen.recaudadoTotal == null ? null : euros(resumen.recaudadoTotal)} sub={`${conDato} de ${etapas.length} provincias con dato`} />
        <Metrica label="Participantes" valor={resumen.participantes == null ? null : resumen.participantes.toLocaleString('es-ES')} />
        <Metrica label="Provincias completadas" valor={`${resumen.provinciasCompletadas} / ${resumen.totalProvincias}`} />
        <Metrica label="Etapas finalizadas" valor={`${Math.round((resumen.provinciasCompletadas / Math.max(1, resumen.totalProvincias)) * 100)} %`} />
      </div>

      <Bloque
        titulo="Recaudación y asistentes por provincia"
        desc="Deja el campo vacío mientras no tengas el dato: la web mostrará “aún sin datos” en vez de un 0. El objetivo global se configura en la pestaña General."
      >
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[620px]">
            <thead>
              <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="py-2 pr-2 w-12">Día</th>
                <th className="py-2 pr-2">Provincia</th>
                <th className="py-2 pr-2 w-32">Estado</th>
                <th className="py-2 pr-2 w-36">Recaudado (€)</th>
                <th className="py-2 pr-2 w-32">Asistentes</th>
                <th className="py-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {etapas.map(e => {
                const d = draftDe(e)
                return (
                  <tr key={e.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 pr-2 font-black text-pm-navy">{e.dia}</td>
                    <td className="py-2 pr-2">
                      <div className="font-semibold text-pm-navy">{e.provincia}</div>
                      {e.ciudad && <div className="text-xs text-gray-400">{e.ciudad}</div>}
                    </td>
                    <td className="py-2 pr-2">
                      <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${badgeEstadoEtapa(e.estado)}`}>
                        {labelEstadoEtapa(e.estado)}
                      </span>
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number" min="0" step="0.01" inputMode="decimal" placeholder="Sin dato"
                        className={inputCls} disabled={!editable}
                        value={d.recaudado}
                        onChange={ev => set(e.id, 'recaudado', ev.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number" min="0" step="1" inputMode="numeric" placeholder="Sin dato"
                        className={inputCls} disabled={!editable}
                        value={d.asistentes}
                        onChange={ev => set(e.id, 'asistentes', ev.target.value)}
                      />
                    </td>
                    <td className="py-2">
                      {sucia(e) && (
                        <BotonGuardar onClick={() => guardar(e)} pending={pending} disabled={!editable}>
                          Guardar
                        </BotonGuardar>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Bloque>
    </div>
  )
}
