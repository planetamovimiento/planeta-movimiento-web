'use client'

import { useState, useTransition } from 'react'
import { guardarTipos } from '../actions'
import { COLORES, PALETA, paleta, type TipoEvento } from '@/lib/calendario-club/tipos'

export default function AjustesColoresClient({ tipos }: { tipos: TipoEvento[] }) {
  const [items, setItems] = useState<TipoEvento[]>([...tipos].sort((a, b) => a.orden - b.orden))
  const [ok, setOk] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const set = (id: string, patch: Partial<TipoEvento>) => { setOk(false); setItems(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t)) }

  function guardar() {
    setError(''); setOk(false)
    startTransition(async () => {
      const r = await guardarTipos(items.map(t => ({ id: t.id, label: t.label, color: t.color, orden: t.orden })))
      if (!r.ok) setError(r.error || 'Error'); else setOk(true)
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-50">
        {items.map(t => (
          <div key={t.id} className="flex items-center gap-3 px-5 py-3">
            <span className={`w-5 h-5 rounded-full shrink-0 ${paleta(t.color).dot}`} />
            <input value={t.label} onChange={e => set(t.id, { label: e.target.value })}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pm-red" />
            <select value={t.color} onChange={e => set(t.id, { color: e.target.value })}
              className="border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white">
              {COLORES.map(c => <option key={c} value={c}>{PALETA[c].label}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3">
        <button onClick={guardar} disabled={pending} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm">{pending ? 'Guardando…' : 'Guardar cambios'}</button>
        {ok && <span className="text-green-600 text-sm font-semibold">✓ Guardado</span>}
        {error && <span className="text-pm-red text-sm">{error}</span>}
      </div>
    </div>
  )
}
