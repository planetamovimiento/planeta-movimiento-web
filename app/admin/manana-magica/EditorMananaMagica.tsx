'use client'

import { useState } from 'react'
import { ESTADOS_MM, type MananaMagica } from '@/lib/eventos/manana-magica'
import { guardarMananaMagica } from './actions'

export default function EditorMananaMagica({ inicial, puedeEditar }: { inicial: MananaMagica; puedeEditar: boolean }) {
  const [f, setF] = useState<MananaMagica>(inicial)
  const [actsText, setActsText] = useState(inicial.actividades.join('\n'))
  const [estado, setEstado] = useState(inicial.estado)
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState('')

  const set = (k: keyof MananaMagica, v: unknown) => setF(prev => ({ ...prev, [k]: v }))

  async function guardar() {
    setGuardando(true); setMsg('')
    const contenido = {
      personaje: f.personaje, tematica: f.tematica, emoji: f.emoji,
      fecha: f.fecha, fechaTexto: f.fechaTexto, horario: f.horario,
      precio: Number(f.precio) || 0, descuentoHermanos: Number(f.descuentoHermanos) || 0,
      aforo: Number(f.aforo) || 0,
      edades: f.edades, descripcion: f.descripcion,
      actividades: actsText.split('\n').map(s => s.trim()).filter(Boolean),
    }
    const r = await guardarMananaMagica(contenido, estado)
    setGuardando(false)
    setMsg(r.ok ? 'Guardado ✓' : (r.error || 'Error al guardar'))
  }

  const input = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'
  const label = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Personaje del mes — lo más destacado */}
      <div className="bg-gradient-to-br from-fuchsia-600 to-violet-600 rounded-2xl p-5 text-white">
        <div className="text-xs font-black uppercase tracking-widest text-white/70 mb-1">Personaje / temática del mes</div>
        <input value={f.personaje} disabled={!puedeEditar} onChange={e => set('personaje', e.target.value)}
          placeholder="Ej. Las Guerreras K-POP"
          className="w-full bg-white/15 border border-white/30 rounded-xl px-3 py-2.5 text-lg font-black text-white placeholder-white/50 focus:outline-none focus:border-white" />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <div className="text-[11px] text-white/70 mb-1">Etiqueta corta (temática)</div>
            <input value={f.tematica} disabled={!puedeEditar} onChange={e => set('tematica', e.target.value)} className="w-full bg-white/15 border border-white/30 rounded-lg px-2.5 py-1.5 text-sm text-white placeholder-white/50 focus:outline-none" placeholder="K-POP" />
          </div>
          <div>
            <div className="text-[11px] text-white/70 mb-1">Emoji</div>
            <input value={f.emoji} disabled={!puedeEditar} onChange={e => set('emoji', e.target.value)} className="w-full bg-white/15 border border-white/30 rounded-lg px-2.5 py-1.5 text-sm text-white placeholder-white/50 focus:outline-none" placeholder="✨" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Fecha (selector de reserva)</label>
          <input type="date" value={f.fecha} disabled={!puedeEditar} onChange={e => set('fecha', e.target.value)} className={input} />
        </div>
        <div>
          <label className={label}>Fecha (texto visible)</label>
          <input value={f.fechaTexto} disabled={!puedeEditar} onChange={e => set('fechaTexto', e.target.value)} className={input} placeholder="Domingo 19 de abril" />
        </div>
        <div>
          <label className={label}>Horario</label>
          <input value={f.horario} disabled={!puedeEditar} onChange={e => set('horario', e.target.value)} className={input} placeholder="11:00 – 13:00" />
        </div>
        <div>
          <label className={label}>Edades</label>
          <input value={f.edades} disabled={!puedeEditar} onChange={e => set('edades', e.target.value)} className={input} placeholder="Infantil y primaria" />
        </div>
        <div>
          <label className={label}>Precio por niño (€)</label>
          <input type="number" value={f.precio} disabled={!puedeEditar} onChange={e => set('precio', e.target.value)} className={input} />
        </div>
        <div>
          <label className={label}>Descuento hermanos (%)</label>
          <input type="number" value={f.descuentoHermanos} disabled={!puedeEditar} onChange={e => set('descuentoHermanos', e.target.value)} className={input} />
        </div>
        <div>
          <label className={label}>Aforo (niños · 0 = sin límite)</label>
          <input type="number" min={0} value={f.aforo} disabled={!puedeEditar} onChange={e => set('aforo', e.target.value)} className={input} />
        </div>
      </div>

      <div>
        <label className={label}>Descripción</label>
        <textarea rows={3} value={f.descripcion} disabled={!puedeEditar} onChange={e => set('descripcion', e.target.value)} className={`${input} resize-none`} />
      </div>

      <div>
        <label className={label}>Actividades (una por línea)</label>
        <textarea rows={6} value={actsText} disabled={!puedeEditar} onChange={e => setActsText(e.target.value)} className={`${input} resize-none`} />
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
