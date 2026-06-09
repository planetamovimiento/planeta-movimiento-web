'use client'

import { useState, useTransition } from 'react'
import { guardarActividad, eliminarActividad, type ActividadInput } from '../actions'
import type { Actividad } from '@/lib/circo-inclusivo/tipos'

type Props = { actividades: Actividad[]; conteo: Record<string, number>; puedeGestionar: boolean }

export default function ActividadesClient({ actividades, conteo, puedeGestionar }: Props) {
  const [editando, setEditando] = useState<Actividad | null>(null)
  const [creando, setCreando] = useState(false)

  return (
    <div className="p-4 lg:p-8 space-y-5">
      {puedeGestionar && (
        <div className="flex justify-end">
          <button onClick={() => { setCreando(true); setEditando(null) }} className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-4 py-2 rounded-xl text-sm">+ Nueva actividad</button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {actividades.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">Aún no hay actividades.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {actividades.map(a => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-pm-navy text-sm">{a.nombre}</div>
                  {a.descripcion && <div className="text-xs text-gray-400">{a.descripcion}</div>}
                </div>
                <span className="text-xs font-semibold bg-pm-bg border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">{conteo[a.nombre] ?? 0} part.</span>
                {puedeGestionar && (
                  <button onClick={() => { setEditando(a); setCreando(false) }} className="text-xs font-semibold text-gray-500 hover:text-pm-red">Editar</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {(creando || editando) && puedeGestionar && (
        <FormActividad inicial={editando} onClose={() => { setCreando(false); setEditando(null) }} />
      )}
    </div>
  )
}

function FormActividad({ inicial, onClose }: { inicial: Actividad | null; onClose: () => void }) {
  const [f, setF] = useState<ActividadInput>({ id: inicial?.id, nombre: inicial?.nombre ?? '', descripcion: inicial?.descripcion ?? '', orden: inicial?.orden ?? 0 })
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pm-red'

  function guardar() {
    setError('')
    startTransition(async () => {
      const r = await guardarActividad(f)
      if (!r.ok) setError(r.error || 'Error'); else onClose()
    })
  }
  function borrar() {
    if (!f.id || !confirm('¿Eliminar esta actividad?')) return
    startTransition(async () => {
      const r = await eliminarActividad(f.id!)
      if (!r.ok) setError(r.error || 'Error'); else onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-black text-pm-navy">{f.id ? 'Editar actividad' : 'Nueva actividad'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-pm-red text-xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-3">
          <div><label className="text-xs font-bold text-gray-500">Nombre *</label><input className={inputCls} value={f.nombre} onChange={e => setF(p => ({ ...p, nombre: e.target.value }))} /></div>
          <div><label className="text-xs font-bold text-gray-500">Descripción</label><textarea rows={2} className={inputCls} value={f.descripcion} onChange={e => setF(p => ({ ...p, descripcion: e.target.value }))} /></div>
          {error && <p className="text-pm-red text-sm">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          {f.id ? <button onClick={borrar} disabled={pending} className="text-sm text-gray-400 hover:text-pm-red font-semibold">Eliminar</button> : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="border border-gray-200 text-gray-600 font-bold px-5 py-2 rounded-xl text-sm">Cancelar</button>
            <button onClick={guardar} disabled={pending || !f.nombre?.trim()} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-sm">{pending ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
