'use client'

import { useState, useTransition } from 'react'
import { guardarGrupo, eliminarGrupo, type GrupoInput } from '../actions'
import type { Grupo } from '@/lib/circo-inclusivo/tipos'

type Props = { grupos: Grupo[]; conteo: Record<string, number>; puedeGestionar: boolean }

export default function GruposClient({ grupos, conteo, puedeGestionar }: Props) {
  const [editando, setEditando] = useState<Grupo | null>(null)
  const [creando, setCreando] = useState(false)

  return (
    <div className="p-4 lg:p-8 space-y-5">
      {puedeGestionar && (
        <div className="flex justify-end">
          <button onClick={() => { setCreando(true); setEditando(null) }} className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-4 py-2 rounded-xl text-sm">+ Nuevo grupo</button>
        </div>
      )}

      {grupos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400 text-sm">
          Aún no hay grupos. {puedeGestionar ? 'Crea el primero con el botón de arriba.' : ''}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grupos.map(g => (
            <div key={g.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="font-black text-pm-navy">{g.nombre}</div>
                <span className="text-xs font-semibold bg-pm-bg border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">{conteo[g.id] ?? 0} part.</span>
              </div>
              <div className="mt-2 space-y-1 text-xs text-gray-500">
                {g.entidad && <div>🏢 {g.entidad}</div>}
                {g.horario && <div>🕒 {g.horario}</div>}
                {g.lugar && <div>📍 {g.lugar}</div>}
                {g.monitor && <div>🧑‍🏫 {g.monitor}</div>}
              </div>
              {g.observaciones && <p className="mt-2 text-xs text-gray-400 leading-relaxed">{g.observaciones}</p>}
              {puedeGestionar && (
                <button onClick={() => { setEditando(g); setCreando(false) }} className="mt-3 text-xs font-semibold text-pm-navy hover:text-pm-red">Editar</button>
              )}
            </div>
          ))}
        </div>
      )}

      {(creando || editando) && puedeGestionar && (
        <FormGrupo inicial={editando} onClose={() => { setCreando(false); setEditando(null) }} />
      )}
    </div>
  )
}

function FormGrupo({ inicial, onClose }: { inicial: Grupo | null; onClose: () => void }) {
  const [f, setF] = useState<GrupoInput>({
    id: inicial?.id,
    nombre: inicial?.nombre ?? '',
    entidad: inicial?.entidad ?? '',
    horario: inicial?.horario ?? '',
    lugar: inicial?.lugar ?? '',
    monitor: inicial?.monitor ?? '',
    observaciones: inicial?.observaciones ?? '',
  })
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const set = (k: keyof GrupoInput, v: string) => setF(p => ({ ...p, [k]: v }))
  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pm-red'

  function guardar() {
    setError('')
    startTransition(async () => {
      const r = await guardarGrupo(f)
      if (!r.ok) setError(r.error || 'Error'); else onClose()
    })
  }
  function borrar() {
    if (!f.id || !confirm('¿Eliminar este grupo? Los participantes quedarán sin grupo asignado.')) return
    startTransition(async () => {
      const r = await eliminarGrupo(f.id!)
      if (!r.ok) setError(r.error || 'Error'); else onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-black text-pm-navy">{f.id ? 'Editar grupo' : 'Nuevo grupo'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-pm-red text-xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-3">
          <div><label className="text-xs font-bold text-gray-500">Nombre del grupo *</label><input className={inputCls} value={f.nombre} onChange={e => set('nombre', e.target.value)} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="text-xs font-bold text-gray-500">Entidad asociada</label><input className={inputCls} value={f.entidad} onChange={e => set('entidad', e.target.value)} /></div>
            <div><label className="text-xs font-bold text-gray-500">Horario</label><input className={inputCls} value={f.horario} onChange={e => set('horario', e.target.value)} /></div>
            <div><label className="text-xs font-bold text-gray-500">Lugar</label><input className={inputCls} value={f.lugar} onChange={e => set('lugar', e.target.value)} /></div>
            <div><label className="text-xs font-bold text-gray-500">Monitor responsable</label><input className={inputCls} value={f.monitor} onChange={e => set('monitor', e.target.value)} /></div>
          </div>
          <div><label className="text-xs font-bold text-gray-500">Observaciones</label><textarea rows={2} className={inputCls} value={f.observaciones} onChange={e => set('observaciones', e.target.value)} /></div>
          {error && <p className="text-pm-red text-sm">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          {f.id ? <button onClick={borrar} disabled={pending} className="text-sm text-gray-400 hover:text-pm-red font-semibold">Eliminar</button> : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="border border-gray-200 text-gray-600 font-bold px-5 py-2 rounded-xl text-sm">Cancelar</button>
            <button onClick={guardar} disabled={pending || !f.nombre.trim()} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-sm">{pending ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
