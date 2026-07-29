'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Evaluar a todos los participantes de una sesión desde una sola pantalla.
// Cada uno: asistencia + 5 criterios (1–4) + observaciones. Media en vivo.
// Guardado en lote (upsert): sin duplicados. Ausencia no puntúa.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { guardarEvalsSesion, type EvalSesionInput } from '../../actions'
import {
  CRITERIOS_SESION, ESCALA, ASISTENCIA_OPCIONES, mediaSesion,
  type Sesion, type Participante, type EvalSesion, type Asistencia,
} from '@/lib/circo-inclusivo/tipos'

type Estado = { asistencia: Asistencia; items: Record<string, number>; observaciones: string }

export default function EvaluarSesionClient({ sesion, grupoNombre, participantes, evalsIniciales, puedeEvaluar }: {
  sesion: Sesion; grupoNombre: string | null; participantes: Participante[]; evalsIniciales: EvalSesion[]; puedeEvaluar: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const inicial = useMemo(() => {
    const m = new Map(evalsIniciales.map(e => [e.participante_id, e]))
    const o: Record<string, Estado> = {}
    for (const p of participantes) {
      const e = m.get(p.id)
      o[p.id] = { asistencia: e?.asistencia ?? 'asiste', items: { ...(e?.items ?? {}) }, observaciones: e?.observaciones ?? '' }
    }
    return o
  }, [participantes, evalsIniciales])

  const [estado, setEstado] = useState<Record<string, Estado>>(inicial)
  const set = (pid: string, patch: Partial<Estado>) => setEstado(s => ({ ...s, [pid]: { ...s[pid], ...patch } }))
  const setNota = (pid: string, crit: string, val: number) =>
    setEstado(s => ({ ...s, [pid]: { ...s[pid], items: { ...s[pid].items, [crit]: s[pid].items[crit] === val ? 0 : val } } }))

  function guardar(completar: boolean) {
    setMsg(''); setError('')
    const evals: EvalSesionInput[] = participantes.map(p => {
      const e = estado[p.id]
      const items = Object.fromEntries(Object.entries(e.items).filter(([, v]) => v >= 1 && v <= 4))
      return { participante_id: p.id, asistencia: e.asistencia, items, observaciones: e.observaciones, estado: completar ? 'completada' : 'borrador' }
    })
    start(async () => {
      const r = await guardarEvalsSesion(sesion.id, evals)
      if (!r.ok) setError(r.error || 'Error al guardar')
      else { setMsg(completar ? 'Evaluaciones guardadas y completadas' : 'Borrador guardado'); router.refresh() }
    })
  }

  const fecha = (() => { const d = new Date(sesion.fecha + 'T00:00:00'); return isNaN(d.getTime()) ? sesion.fecha : d.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) })()

  return (
    <div className="p-4 lg:p-8 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Link href="/admin/circo-inclusivo/sesiones" className="text-sm font-bold text-gray-400 hover:text-pm-navy">← Sesiones</Link>
          <p className="text-lg font-black text-pm-navy capitalize mt-1">{fecha}</p>
          <p className="text-sm text-gray-500">{grupoNombre ?? 'Sin grupo'} · {participantes.length} participante(s)</p>
        </div>
      </div>

      {/* Leyenda de la escala */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-xs text-gray-600 flex flex-wrap gap-x-5 gap-y-1">
        <span className="font-bold text-gray-400 uppercase tracking-wide">Escala 1–4:</span>
        {ESCALA.map(e => <span key={e.valor}><strong className="text-pm-navy">{e.valor}</strong> {e.corto}</span>)}
      </div>

      {participantes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400 text-sm">
          No hay participantes activos en este grupo.
        </div>
      ) : (
        <div className="space-y-3">
          {participantes.map(p => {
            const e = estado[p.id]
            const ausente = e.asistencia !== 'asiste'
            const media = ausente ? null : mediaSesion(e.items)
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="font-bold text-pm-navy">{p.nombre} {p.apellidos ?? ''}</span>
                  <div className="flex items-center gap-2">
                    <select value={e.asistencia} disabled={!puedeEvaluar} onChange={ev => set(p.id, { asistencia: ev.target.value as Asistencia })}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
                      {ASISTENCIA_OPCIONES.map(a => <option key={a.valor} value={a.valor}>{a.label}</option>)}
                    </select>
                    <span className={`text-sm font-black tabular-nums w-14 text-right ${media != null ? 'text-pm-navy' : 'text-gray-300'}`}>
                      {media != null ? media.toFixed(2) : '—'}
                    </span>
                  </div>
                </div>

                {!ausente && (
                  <div className="mt-3 space-y-2">
                    {CRITERIOS_SESION.map(c => (
                      <div key={c.key} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-600 min-w-0 flex-1 truncate">{c.label}</span>
                        <div className="flex gap-1 shrink-0">
                          {[1, 2, 3, 4].map(n => {
                            const on = e.items[c.key] === n
                            return (
                              <button key={n} type="button" disabled={!puedeEvaluar} onClick={() => setNota(p.id, c.key, n)}
                                aria-label={`${c.label}: ${n}`} aria-pressed={on}
                                className={`w-9 h-9 rounded-lg text-sm font-bold border transition-colors ${on ? 'bg-pm-red text-white border-pm-red' : 'bg-white text-gray-500 border-gray-200 hover:border-pm-red'}`}>
                                {n}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <input value={e.observaciones} disabled={!puedeEvaluar} onChange={ev => set(p.id, { observaciones: ev.target.value })}
                  placeholder="Observaciones (opcional)" className="w-full mt-3 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pm-red" />
              </div>
            )
          })}
        </div>
      )}

      {puedeEvaluar && participantes.length > 0 && (
        <div className="sticky bottom-4 z-10">
          <div className="bg-pm-navy text-white rounded-2xl shadow-lg p-3 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-sm font-semibold pl-2">{msg || error || 'Evalúa y guarda cuando quieras'}</span>
            <div className="flex gap-2">
              <button onClick={() => guardar(false)} disabled={pending} className="text-sm font-bold px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 disabled:opacity-40">Guardar borrador</button>
              <button onClick={() => guardar(true)} disabled={pending} className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-5 py-2 rounded-xl text-sm disabled:opacity-40">{pending ? 'Guardando…' : 'Guardar y completar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
