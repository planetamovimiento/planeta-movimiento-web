'use client'

import { useState, useTransition } from 'react'
import { guardarPromos } from './actions'
import type { Promo } from '@/lib/home/promos'

const ATAJOS = [
  { label: 'Club Origen', enlace: '/club' },
  { label: 'Hazte socio', enlace: '/familias/login' },
  { label: 'Campamentos', enlace: '/servicios/campamentos' },
  { label: 'Talleres intensivos', enlace: '/club/talleres-intensivos' },
]

export default function PromosManager({ promos: inicial, puedeEditar }: { promos: Promo[]; puedeEditar: boolean }) {
  const [promos, setPromos] = useState<Promo[]>(inicial)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState('')

  const set = (i: number, patch: Partial<Promo>) => setPromos(a => a.map((x, j) => j === i ? { ...x, ...patch } : x))
  const add = () => setPromos(a => [...a, { id: crypto.randomUUID(), etiqueta: '', titulo: '', texto: '', botonTexto: 'Apúntate', enlace: '', activo: true }])
  const quitar = (i: number) => setPromos(a => a.filter((_, j) => j !== i))
  const mover = (i: number, d: -1 | 1) => setPromos(a => { const j = i + d; if (j < 0 || j >= a.length) return a; const c = [...a]; [c[i], c[j]] = [c[j], c[i]]; return c })
  const guardar = () => { setMsg(''); startTransition(async () => { const r = await guardarPromos(promos); setMsg(r.ok ? '✓ Guardado' : (r.error || 'Error')) }) }

  const inp = 'w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-pm-red'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 max-w-3xl">
      <div className="mb-3">
        <div className="font-black text-pm-navy">Promociones del inicio</div>
        <div className="text-xs text-gray-400">Aparecen como tiras destacadas al entrar en la web (justo bajo la portada). Solo se muestran las activas, en este orden.</div>
      </div>

      {promos.length === 0 && <p className="text-sm text-gray-400 py-2">No hay promociones. Añade una para destacarla en el inicio.</p>}

      <div className="space-y-3">
        {promos.map((p, i) => (
          <div key={p.id} className="border border-gray-100 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input className={`${inp} max-w-[180px]`} placeholder="Etiqueta (ej. Nueva temporada)" value={p.etiqueta} disabled={!puedeEditar} onChange={e => set(i, { etiqueta: e.target.value })} />
              <input className={`${inp} flex-1`} placeholder="Título *" value={p.titulo} disabled={!puedeEditar} onChange={e => set(i, { titulo: e.target.value })} />
              <label className="flex items-center gap-1.5 text-xs font-bold text-pm-navy whitespace-nowrap"><input type="checkbox" checked={p.activo} disabled={!puedeEditar} onChange={e => set(i, { activo: e.target.checked })} className="accent-pm-red w-4 h-4" /> Activa</label>
            </div>
            <textarea className={`${inp} min-h-[44px]`} placeholder="Texto descriptivo" value={p.texto} disabled={!puedeEditar} onChange={e => set(i, { texto: e.target.value })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input className={inp} placeholder="Texto del botón (ej. Apúntate)" value={p.botonTexto} disabled={!puedeEditar} onChange={e => set(i, { botonTexto: e.target.value })} />
              <input className={inp} placeholder="Enlace de destino (/club, /servicios/campamentos…) *" value={p.enlace} disabled={!puedeEditar} onChange={e => set(i, { enlace: e.target.value })} />
            </div>
            {puedeEditar && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-gray-400">Atajos:</span>
                {ATAJOS.map(a => <button key={a.enlace} onClick={() => set(i, { enlace: a.enlace })} className="text-[11px] font-bold text-pm-navy border border-gray-200 rounded-full px-2 py-0.5 hover:border-pm-red">{a.label}</button>)}
                <span className="ml-auto flex items-center gap-1">
                  <button onClick={() => mover(i, -1)} disabled={i === 0} className="text-xs border border-gray-200 rounded px-1.5 py-0.5 disabled:opacity-30">↑</button>
                  <button onClick={() => mover(i, 1)} disabled={i === promos.length - 1} className="text-xs border border-gray-200 rounded px-1.5 py-0.5 disabled:opacity-30">↓</button>
                  <button onClick={() => quitar(i)} className="text-gray-300 hover:text-red-500 text-lg px-1">✕</button>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {puedeEditar && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <button onClick={add} className="text-sm font-bold text-pm-navy border border-gray-200 hover:border-pm-navy rounded-xl px-3 py-2">+ Añadir promoción</button>
          <button onClick={guardar} disabled={pending} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-bold text-sm px-4 py-2 rounded-xl">{pending ? 'Guardando…' : 'Guardar'}</button>
          {msg && <span className="text-sm text-gray-500">{msg}</span>}
        </div>
      )}
    </div>
  )
}
