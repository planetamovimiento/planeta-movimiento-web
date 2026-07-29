'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { guardarSesion, eliminarSesion, type SesionInput } from '../actions'
import { ESTADOS_SESION, labelEstadoSesion, type Sesion, type Grupo, type EstadoSesion } from '@/lib/circo-inclusivo/tipos'

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pm-red'
const estadoColor = (e: EstadoSesion) => ESTADOS_SESION.find(x => x.valor === e)?.color ?? 'bg-gray-100 text-gray-500 border-gray-300'
const fechaLarga = (iso: string) => { const d = new Date(iso + 'T00:00:00'); return isNaN(d.getTime()) ? iso : d.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) }

type Props = {
  sesiones: Sesion[]; grupos: Grupo[]; conteo: Record<string, number>
  migrado: boolean; puedeGestionar: boolean; puedeEliminar: boolean
}

export default function SesionesClient({ sesiones, grupos, conteo, migrado, puedeGestionar, puedeEliminar }: Props) {
  const [editando, setEditando] = useState<Sesion | null>(null)
  const [creando, setCreando] = useState(false)
  const grupoNombre = useMemo(() => new Map(grupos.map(g => [g.id, g.nombre])), [grupos])

  return (
    <div className="p-4 lg:p-8 space-y-5">
      {!migrado && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <div className="font-black mb-1">⚙️ Falta la migración</div>
          Ejecuta <code className="bg-amber-100 px-1.5 py-0.5 rounded">supabase/migration_circo_sesiones.sql</code> en Supabase para activar las sesiones.
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{sesiones.length} sesión(es)</p>
        {puedeGestionar && migrado && (
          <button onClick={() => { setCreando(true); setEditando(null) }} className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-4 py-2 rounded-xl text-sm">+ Nueva sesión</button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {sesiones.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">Aún no hay sesiones.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Fecha</th>
                  <th className="px-5 py-3 font-semibold">Grupo</th>
                  <th className="px-5 py-3 font-semibold">Monitor</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold">Evaluados</th>
                  <th className="px-5 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sesiones.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-semibold text-pm-navy capitalize whitespace-nowrap">{fechaLarga(s.fecha)}{s.hora ? ` · ${s.hora}` : ''}</td>
                    <td className="px-5 py-3 text-gray-600">{s.grupo_id ? grupoNombre.get(s.grupo_id) ?? '—' : '—'}</td>
                    <td className="px-5 py-3 text-gray-600">{s.monitor ?? '—'}</td>
                    <td className="px-5 py-3"><span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${estadoColor(s.estado)}`}>{labelEstadoSesion(s.estado)}</span></td>
                    <td className="px-5 py-3 text-gray-600">{conteo[s.id] ?? 0}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/admin/circo-inclusivo/sesiones/${s.id}`} className="text-xs font-bold text-pm-red hover:underline">Realizar evaluación →</Link>
                        {puedeGestionar && <button onClick={() => { setEditando(s); setCreando(false) }} className="text-xs font-semibold text-gray-500 hover:text-pm-red">Editar</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(creando || editando) && puedeGestionar && (
        <FormSesion inicial={editando} grupos={grupos} puedeEliminar={puedeEliminar} onClose={() => { setCreando(false); setEditando(null) }} />
      )}
    </div>
  )
}

function FormSesion({ inicial, grupos, puedeEliminar, onClose }: { inicial: Sesion | null; grupos: Grupo[]; puedeEliminar: boolean; onClose: () => void }) {
  const router = useRouter()
  const [f, setF] = useState<SesionInput>({
    id: inicial?.id, fecha: inicial?.fecha ?? new Date().toISOString().slice(0, 10),
    hora: inicial?.hora ?? '', grupo_id: inicial?.grupo_id ?? '', lugar: inicial?.lugar ?? '',
    monitor: inicial?.monitor ?? '', estado: inicial?.estado ?? 'realizada', observaciones: inicial?.observaciones ?? '',
  })
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const set = (k: keyof SesionInput, v: string) => setF(p => ({ ...p, [k]: v }))

  const run = (fn: () => Promise<{ ok: boolean; error?: string | null }>) => start(async () => {
    setError(''); const r = await fn(); if (!r.ok) setError(r.error || 'Error'); else { router.refresh(); onClose() }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-black text-pm-navy">{f.id ? 'Editar sesión' : 'Nueva sesión'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-pm-red text-xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-bold text-gray-500">Fecha *</label><input type="date" className={inputCls} value={f.fecha} onChange={e => set('fecha', e.target.value)} /></div>
            <div><label className="text-xs font-bold text-gray-500">Hora</label><input className={inputCls} placeholder="17:00" value={f.hora} onChange={e => set('hora', e.target.value)} /></div>
            <div>
              <label className="text-xs font-bold text-gray-500">Grupo</label>
              <select className={inputCls} value={f.grupo_id ?? ''} onChange={e => set('grupo_id', e.target.value)}>
                <option value="">— Sin grupo —</option>{grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Estado</label>
              <select className={inputCls} value={f.estado} onChange={e => set('estado', e.target.value)}>
                {ESTADOS_SESION.map(e => <option key={e.valor} value={e.valor}>{e.label}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-bold text-gray-500">Lugar</label><input className={inputCls} value={f.lugar} onChange={e => set('lugar', e.target.value)} /></div>
            <div><label className="text-xs font-bold text-gray-500">Monitor</label><input className={inputCls} value={f.monitor} onChange={e => set('monitor', e.target.value)} /></div>
          </div>
          <div><label className="text-xs font-bold text-gray-500">Observaciones</label><textarea rows={2} className={inputCls} value={f.observaciones} onChange={e => set('observaciones', e.target.value)} /></div>
          {error && <p className="text-pm-red text-sm">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          {f.id && puedeEliminar
            ? <button onClick={() => { if (confirm('¿Eliminar la sesión y sus evaluaciones?')) run(() => eliminarSesion(f.id!)) }} disabled={pending} className="text-sm text-gray-400 hover:text-pm-red font-semibold">Eliminar</button>
            : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="border border-gray-200 text-gray-600 font-bold px-5 py-2 rounded-xl text-sm">Cancelar</button>
            <button onClick={() => run(() => guardarSesion(f))} disabled={pending || !f.fecha} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-sm">{pending ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
