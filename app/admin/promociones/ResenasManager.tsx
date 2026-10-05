'use client'

import { useState, useTransition } from 'react'
import { guardarResenas } from './actions'
import type { Resena, ResenasHome } from '@/lib/home/resenas'

/** Reseñas de Google del inicio: se copian de la ficha de Google y se editan aquí. */
export default function ResenasManager({ datos: inicial, puedeEditar }: { datos: ResenasHome; puedeEditar: boolean }) {
  const [d, setD] = useState<ResenasHome>(inicial)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState('')

  const setItem = (i: number, patch: Partial<Resena>) =>
    setD(p => ({ ...p, items: p.items.map((x, j) => (j === i ? { ...x, ...patch } : x)) }))
  const add = () => setD(p => ({
    ...p,
    items: [...p.items, { id: crypto.randomUUID(), nombre: '', rol: '', texto: '', estrellas: 5, activa: true }],
  }))
  const quitar = (i: number) => setD(p => ({ ...p, items: p.items.filter((_, j) => j !== i) }))
  const mover = (i: number, dir: -1 | 1) => setD(p => {
    const j = i + dir
    if (j < 0 || j >= p.items.length) return p
    const c = [...p.items]
    ;[c[i], c[j]] = [c[j], c[i]]
    return { ...p, items: c }
  })
  const guardar = () => {
    setMsg('')
    startTransition(async () => {
      const r = await guardarResenas(d)
      setMsg(r.ok ? '✓ Guardado' : (r.error || 'Error'))
    })
  }

  const inp = 'w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-pm-red'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 max-w-3xl">
      <div className="mb-3">
        <div className="font-black text-pm-navy">Reseñas de Google del inicio</div>
        <div className="text-xs text-gray-400">
          Las que se ven en «Lo que dicen de nosotros». Cópialas de tu ficha de Google y pégalas aquí tal cual.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase">Nota media</label>
          <input className={inp} value={d.nota} disabled={!puedeEditar} onChange={e => setD(p => ({ ...p, nota: e.target.value }))} placeholder="4,9" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase">Nº de reseñas</label>
          <input className={inp} type="number" value={d.total} disabled={!puedeEditar} onChange={e => setD(p => ({ ...p, total: Number(e.target.value) || 0 }))} />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase">Enlace a Google</label>
          <input className={inp} value={d.enlace} disabled={!puedeEditar} onChange={e => setD(p => ({ ...p, enlace: e.target.value }))} />
        </div>
      </div>

      {d.items.length === 0 && <p className="text-sm text-gray-400 py-2">Sin reseñas. Añade una para que salga en la portada.</p>}

      <div className="space-y-3">
        {d.items.map((r, i) => (
          <div key={r.id} className="border border-gray-100 rounded-xl p-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <input className={`${inp} flex-1 min-w-[160px]`} placeholder="Nombre de quien la escribió *" value={r.nombre} disabled={!puedeEditar} onChange={e => setItem(i, { nombre: e.target.value })} />
              <input className={`${inp} flex-1 min-w-[160px]`} placeholder="Hace 6 meses · Local Guide" value={r.rol} disabled={!puedeEditar} onChange={e => setItem(i, { rol: e.target.value })} />
              <select className="border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white" value={r.estrellas} disabled={!puedeEditar} onChange={e => setItem(i, { estrellas: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
              </select>
              <label className="flex items-center gap-1.5 text-xs font-bold text-pm-navy whitespace-nowrap">
                <input type="checkbox" checked={r.activa} disabled={!puedeEditar} onChange={e => setItem(i, { activa: e.target.checked })} className="accent-pm-red w-4 h-4" /> Visible
              </label>
            </div>
            <textarea className={`${inp} min-h-[66px]`} placeholder="Texto de la reseña *" value={r.texto} disabled={!puedeEditar} onChange={e => setItem(i, { texto: e.target.value })} />
            {puedeEditar && (
              <div className="flex gap-1 justify-end">
                <button type="button" onClick={() => mover(i, -1)} className="text-gray-400 hover:text-pm-navy px-2" title="Subir">↑</button>
                <button type="button" onClick={() => mover(i, 1)} className="text-gray-400 hover:text-pm-navy px-2" title="Bajar">↓</button>
                <button type="button" onClick={() => quitar(i)} className="text-gray-400 hover:text-red-600 px-2" title="Eliminar">🗑</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {puedeEditar && (
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button type="button" onClick={add} className="border-2 border-dashed border-gray-200 hover:border-pm-red text-sm font-bold text-gray-500 hover:text-pm-red px-4 py-2 rounded-xl">+ Añadir reseña</button>
          <button type="button" onClick={guardar} disabled={pending} className="bg-pm-red text-white font-black text-sm px-5 py-2.5 rounded-xl disabled:opacity-50">
            {pending ? 'Guardando…' : 'Guardar reseñas'}
          </button>
          {msg && <span className="text-sm text-gray-500">{msg}</span>}
        </div>
      )}
    </div>
  )
}
