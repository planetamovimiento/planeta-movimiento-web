'use client'

import { useState, useTransition } from 'react'
import { guardarAvisosClub } from './actions'
import type { Aviso } from '@/lib/familias/avisos'

export default function AvisosManager({ avisos: inicial, puedeEditar }: { avisos: Aviso[]; puedeEditar: boolean }) {
  const [avisos, setAvisos] = useState<Aviso[]>(inicial)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState('')

  const set = (i: number, patch: Partial<Aviso>) => setAvisos(a => a.map((x, j) => j === i ? { ...x, ...patch } : x))
  const add = () => setAvisos(a => [...a, { id: crypto.randomUUID(), titulo: '', cuerpo: '', activo: true }])
  const quitar = (i: number) => setAvisos(a => a.filter((_, j) => j !== i))
  const guardar = () => {
    setMsg('')
    startTransition(async () => {
      const r = await guardarAvisosClub(avisos)
      setMsg(r.ok ? '✓ Guardado' : (r.error || 'No se pudo guardar'))
    })
  }

  const inp = 'w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-pm-red'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-black text-pm-navy">Avisos del club</div>
          <div className="text-xs text-gray-400">Se muestran a todas las familias en su portal. Los inactivos no se publican.</div>
        </div>
      </div>

      {avisos.length === 0 && <p className="text-sm text-gray-400 py-2">No hay avisos. Añade uno para publicarlo en el portal.</p>}

      <div className="space-y-3">
        {avisos.map((a, i) => (
          <div key={a.id} className="border border-gray-100 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input className={`${inp} flex-1`} placeholder="Título (ej. Cambio de horario)" value={a.titulo} disabled={!puedeEditar} onChange={e => set(i, { titulo: e.target.value })} />
              <label className="flex items-center gap-1.5 text-xs font-bold text-pm-navy whitespace-nowrap">
                <input type="checkbox" checked={a.activo} disabled={!puedeEditar} onChange={e => set(i, { activo: e.target.checked })} className="accent-pm-red w-4 h-4" />
                Activo
              </label>
              {puedeEditar && <button onClick={() => quitar(i)} className="text-gray-300 hover:text-red-500 text-lg px-1" title="Quitar">✕</button>}
            </div>
            <textarea className={`${inp} min-h-[52px]`} placeholder="Texto del aviso" value={a.cuerpo} disabled={!puedeEditar} onChange={e => set(i, { cuerpo: e.target.value })} />
          </div>
        ))}
      </div>

      {puedeEditar && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <button onClick={add} className="text-sm font-bold text-pm-navy border border-gray-200 hover:border-pm-navy rounded-xl px-3 py-2">+ Añadir aviso</button>
          <button onClick={guardar} disabled={pending} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-bold text-sm px-4 py-2 rounded-xl">
            {pending ? 'Guardando…' : 'Guardar avisos'}
          </button>
          {msg && <span className="text-sm text-gray-500">{msg}</span>}
        </div>
      )}
    </div>
  )
}
