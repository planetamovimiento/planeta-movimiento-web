'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { VALORACIONES, type Evaluacion, type Participante, type Grupo } from '@/lib/circo-inclusivo/tipos'

const fechaCorta = (s?: string | null) => (s ? new Date(s).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')

type Props = { evaluaciones: Evaluacion[]; participantes: Participante[]; grupos: Grupo[] }

export default function EvaluacionesClient({ evaluaciones, participantes, grupos }: Props) {
  const [tipo, setTipo] = useState('')
  const [valoracion, setValoracion] = useState('')
  const [grupo, setGrupo] = useState('')
  const [periodo, setPeriodo] = useState('')

  const pMap = useMemo(() => new Map(participantes.map(p => [p.id, p])), [participantes])
  const gMap = useMemo(() => new Map(grupos.map(g => [g.id, g.nombre])), [grupos])

  const filtradas = evaluaciones.filter(e => {
    if (tipo && e.tipo !== tipo) return false
    if (valoracion && e.valoracion_global !== valoracion) return false
    if (periodo && !(e.periodo ?? '').toLowerCase().includes(periodo.toLowerCase())) return false
    if (grupo) {
      const p = pMap.get(e.participante_id)
      if (!p || p.grupo_id !== grupo) return false
    }
    return true
  })

  return (
    <div className="p-4 lg:p-8 space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-2 items-center">
        <select value={tipo} onChange={e => setTipo(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
          <option value="">Mensual y trimestral</option>
          <option value="mensual">Solo mensuales</option>
          <option value="trimestral">Solo trimestrales</option>
        </select>
        <select value={valoracion} onChange={e => setValoracion(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
          <option value="">Toda valoración</option>
          {VALORACIONES.map(v => <option key={v.valor} value={v.valor}>{v.label}</option>)}
        </select>
        <select value={grupo} onChange={e => setGrupo(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
          <option value="">Todos los grupos</option>
          {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
        </select>
        <input value={periodo} onChange={e => setPeriodo(e.target.value)} placeholder="Periodo (ej. 2026-06, 2026-T2)" className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-[180px]" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 text-sm text-gray-500">{filtradas.length} evaluación(es)</div>
        {filtradas.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">No hay evaluaciones que coincidan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Participante</th>
                  <th className="px-5 py-3 font-semibold">Tipo</th>
                  <th className="px-5 py-3 font-semibold">Fecha</th>
                  <th className="px-5 py-3 font-semibold">Periodo</th>
                  <th className="px-5 py-3 font-semibold">Grupo</th>
                  <th className="px-5 py-3 font-semibold">Valoración</th>
                  <th className="px-5 py-3 font-semibold text-right">Informe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtradas.map(e => {
                  const p = pMap.get(e.participante_id)
                  const val = VALORACIONES.find(v => v.valor === e.valoracion_global)
                  return (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        {p
                          ? <Link href={`/admin/circo-inclusivo/participantes/${p.id}`} className="font-semibold text-pm-navy hover:text-pm-red">{p.nombre} {p.apellidos ?? ''}</Link>
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-3 text-gray-600 capitalize">{e.tipo}</td>
                      <td className="px-5 py-3 text-gray-600">{fechaCorta(e.fecha)}</td>
                      <td className="px-5 py-3 text-gray-600">{e.periodo ?? '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{p?.grupo_id ? gMap.get(p.grupo_id) ?? '—' : '—'}</td>
                      <td className="px-5 py-3">{val ? <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${val.color}`}>{val.label}</span> : '—'}</td>
                      <td className="px-5 py-3 text-right">
                        {p && <Link href={`/admin/circo-inclusivo/participantes/${p.id}/informe?tipo=${e.tipo}&eval=${e.id}`} target="_blank" className="text-xs font-semibold text-pm-navy hover:text-pm-red">Informe →</Link>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
