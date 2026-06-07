'use client'

import { useState } from 'react'
import { ESTADOS_MM } from '@/lib/eventos/manana-magica'
import type { EventoCentroCfg } from '@/lib/eventos/centro'
import { guardarEventoConfig } from '../evento-actions'

export default function EditorEventoCentro({ id, inicial, puedeEditar }: { id: string; inicial: EventoCentroCfg; puedeEditar: boolean }) {
  const [f, setF] = useState<EventoCentroCfg>(inicial)
  const [estado, setEstado] = useState(inicial.estado)
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState('')

  const esDSC = id === 'dias-sin-cole'
  const esHalloween = id === 'halloween'
  const set = (k: keyof EventoCentroCfg, v: unknown) => setF(prev => ({ ...prev, [k]: v }))

  async function guardar() {
    setGuardando(true); setMsg('')
    const contenido = {
      precio: Number(f.precio) || 0, ivaIncluido: f.ivaIncluido, horario: f.horario, edad: f.edad,
      nota: f.nota, fechas: f.fechas, evento: f.evento, plazas: Number(f.plazas) || 0,
    }
    const r = await guardarEventoConfig(id, contenido, estado)
    setGuardando(false)
    setMsg(r.ok ? 'Guardado ✓' : (r.error || 'Error al guardar'))
  }

  const input = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'
  const label = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Precio por niño (€)</label>
          <input type="number" value={f.precio} disabled={!puedeEditar} onChange={e => set('precio', e.target.value)} className={input} />
          <label className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <input type="checkbox" checked={f.ivaIncluido} disabled={!puedeEditar} onChange={e => set('ivaIncluido', e.target.checked)} className="accent-pm-red" />
            IVA incluido en el precio
          </label>
        </div>
        <div>
          <label className={label}>Horario</label>
          <input value={f.horario} disabled={!puedeEditar} onChange={e => set('horario', e.target.value)} className={input} />
        </div>
        <div>
          <label className={label}>Edad</label>
          <input value={f.edad} disabled={!puedeEditar} onChange={e => set('edad', e.target.value)} className={input} />
        </div>
        {esHalloween && (
          <div>
            <label className={label}>Plazas máximas</label>
            <input type="number" value={f.plazas} disabled={!puedeEditar} onChange={e => set('plazas', e.target.value)} className={input} />
          </div>
        )}
      </div>

      {esHalloween && (
        <div>
          <label className={label}>Nombre temático del año</label>
          <input value={f.evento} disabled={!puedeEditar} onChange={e => set('evento', e.target.value)} className={input} placeholder="Apocalipsis Zombie" />
        </div>
      )}

      {(esDSC || esHalloween) && (
        <div>
          <label className={label}>{esDSC ? 'Fechas (una por línea: AAAA-MM-DD = Etiqueta)' : 'Fechas (texto visible)'}</label>
          <textarea rows={esDSC ? 8 : 2} value={f.fechas} disabled={!puedeEditar} onChange={e => set('fechas', e.target.value)} className={`${input} resize-none font-mono text-xs`} />
          {esDSC && <p className="text-[11px] text-gray-400 mt-1">Ej: <code>2026-12-07 = Puente Constitución</code>. Estas son las fechas que el cliente podrá elegir en la web.</p>}
        </div>
      )}

      <div>
        <label className={label}>Nota / aviso</label>
        <input value={f.nota} disabled={!puedeEditar} onChange={e => set('nota', e.target.value)} className={input} placeholder="Texto informativo opcional" />
      </div>

      <div>
        <label className={label}>Estado</label>
        <div className="flex flex-wrap gap-2">
          {ESTADOS_MM.map(e => (
            <button key={e.id} disabled={!puedeEditar} onClick={() => setEstado(e.id)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${estado === e.id ? `${e.badge} border-transparent ring-2 ring-offset-1 ring-pm-navy/20` : 'border-gray-200 text-gray-500 hover:border-pm-navy'}`}>
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {puedeEditar && (
        <div className="flex items-center gap-3 pt-2">
          <button onClick={guardar} disabled={guardando} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black px-6 py-3 rounded-xl transition-colors">
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
          {msg && <span className={`text-sm font-semibold ${msg.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>{msg}</span>}
          {f.updatedAt && <span className="text-xs text-gray-400 ml-auto">Última edición: {new Date(f.updatedAt).toLocaleString('es-ES')}{f.updatedBy ? ` · ${f.updatedBy}` : ''}</span>}
        </div>
      )}
    </div>
  )
}
