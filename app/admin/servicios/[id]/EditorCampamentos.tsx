'use client'

import { useState } from 'react'
import { ESTADOS_MM, type EstadoMM } from '@/lib/eventos/manana-magica'
import { ELEMENTOS, type CampamentosConfig, type SemanaCfg, type Elemento } from '@/lib/campamentos/editable'
import { guardarEventoConfig } from '../evento-actions'

const input = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'
const label = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'

export default function EditorCampamentos({ inicial, puedeEditar }: { inicial: CampamentosConfig; puedeEditar: boolean }) {
  const [f, setF] = useState<CampamentosConfig>(inicial)
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState('')
  const set = (k: keyof CampamentosConfig, v: unknown) => setF(p => ({ ...p, [k]: v }))

  const setSemana = (i: number, k: keyof SemanaCfg, v: unknown) => setF(p => ({ ...p, veranoSemanas: p.veranoSemanas.map((s, idx) => idx === i ? { ...s, [k]: v } : s) }))
  const addSemana = () => setF(p => ({ ...p, veranoSemanas: [...p.veranoSemanas, { id: (p.veranoSemanas.at(-1)?.id ?? 0) + 1, elemento: 'Tierra' as Elemento, inicio: '', fin: '' }] }))
  const delSemana = (i: number) => setF(p => ({ ...p, veranoSemanas: p.veranoSemanas.filter((_, idx) => idx !== i) }))

  async function guardar() {
    setGuardando(true); setMsg('')
    const contenido = {
      precioDiaSuelto: Number(f.precioDiaSuelto) || 0, precioSemana: Number(f.precioSemana) || 0,
      precioMatinal: Number(f.precioMatinal) || 0, precioVespertino: Number(f.precioVespertino) || 0,
      descuentoHermanos: Number(f.descuentoHermanos) || 0, cuponHermanos: f.cuponHermanos,
      navidadFechas: f.navidadFechas, navidadHorario: f.navidadHorario, navidadEstado: f.navidadEstado,
      ssantaFechas: f.ssantaFechas, ssantaHorario: f.ssantaHorario, ssantaEstado: f.ssantaEstado,
      veranoSemanas: f.veranoSemanas.map((s, i) => ({ id: i + 1, elemento: s.elemento, inicio: s.inicio, fin: s.fin })),
      veranoHorario: f.veranoHorario, veranoEstado: f.veranoEstado,
    }
    const r = await guardarEventoConfig('campamentos', contenido, 'abierto')
    setGuardando(false)
    setMsg(r.ok ? 'Guardado ✓' : (r.error || 'Error al guardar'))
  }

  const EstadoSel = ({ value, onChange }: { value: EstadoMM; onChange: (v: EstadoMM) => void }) => (
    <div className="flex flex-wrap gap-1.5">
      {ESTADOS_MM.map(e => (
        <button key={e.id} type="button" disabled={!puedeEditar} onClick={() => onChange(e.id)}
          className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${value === e.id ? `${e.badge} border-transparent ring-2 ring-offset-1 ring-pm-navy/20` : 'border-gray-200 text-gray-500 hover:border-pm-navy'}`}>
          {e.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      {/* PRECIOS */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-black text-pm-navy mb-4">💶 Precios (Verano)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div><label className={label}>Día suelto (€)</label><input type="number" value={f.precioDiaSuelto} disabled={!puedeEditar} onChange={e => set('precioDiaSuelto', e.target.value)} className={input} /></div>
          <div><label className={label}>Semana completa (€)</label><input type="number" value={f.precioSemana} disabled={!puedeEditar} onChange={e => set('precioSemana', e.target.value)} className={input} /></div>
          <div><label className={label}>Descuento hermanos (%)</label><input type="number" value={f.descuentoHermanos} disabled={!puedeEditar} onChange={e => set('descuentoHermanos', e.target.value)} className={input} /></div>
          <div><label className={label}>Matinal (€/día)</label><input type="number" value={f.precioMatinal} disabled={!puedeEditar} onChange={e => set('precioMatinal', e.target.value)} className={input} /></div>
          <div><label className={label}>Vespertino (€/día)</label><input type="number" value={f.precioVespertino} disabled={!puedeEditar} onChange={e => set('precioVespertino', e.target.value)} className={input} /></div>
          <div><label className={label}>Cupón hermanos</label><input value={f.cuponHermanos} disabled={!puedeEditar} onChange={e => set('cuponHermanos', e.target.value.toUpperCase())} className={input} /></div>
        </div>
      </section>

      {/* NAVIDAD */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h3 className="font-black text-pm-navy">⛄ Campamento de Navidad</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={label}>Fechas (una por línea, AAAA-MM-DD)</label><textarea rows={5} value={f.navidadFechas} disabled={!puedeEditar} onChange={e => set('navidadFechas', e.target.value)} className={`${input} resize-none font-mono text-xs`} /></div>
          <div className="space-y-3">
            <div><label className={label}>Horario</label><input value={f.navidadHorario} disabled={!puedeEditar} onChange={e => set('navidadHorario', e.target.value)} className={input} /></div>
            <div><label className={label}>Estado</label><EstadoSel value={f.navidadEstado} onChange={v => set('navidadEstado', v)} /></div>
          </div>
        </div>
      </section>

      {/* SEMANA SANTA */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h3 className="font-black text-pm-navy">🌸 Campamento de Semana Santa</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={label}>Fechas (una por línea, AAAA-MM-DD)</label><textarea rows={5} value={f.ssantaFechas} disabled={!puedeEditar} onChange={e => set('ssantaFechas', e.target.value)} className={`${input} resize-none font-mono text-xs`} /></div>
          <div className="space-y-3">
            <div><label className={label}>Horario</label><input value={f.ssantaHorario} disabled={!puedeEditar} onChange={e => set('ssantaHorario', e.target.value)} className={input} /></div>
            <div><label className={label}>Estado</label><EstadoSel value={f.ssantaEstado} onChange={v => set('ssantaEstado', v)} /></div>
          </div>
        </div>
      </section>

      {/* VERANO */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h3 className="font-black text-pm-navy">☀️ Campamento de Verano — semanas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={label}>Horario</label><input value={f.veranoHorario} disabled={!puedeEditar} onChange={e => set('veranoHorario', e.target.value)} className={input} /></div>
          <div><label className={label}>Estado</label><EstadoSel value={f.veranoEstado} onChange={v => set('veranoEstado', v)} /></div>
        </div>
        <div className="space-y-2 pt-1">
          {f.veranoSemanas.map((s, i) => (
            <div key={i} className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-2 bg-pm-bg rounded-xl p-2.5">
              <span className="text-xs font-black text-gray-400 w-6 text-center">{i + 1}</span>
              <select value={s.elemento} disabled={!puedeEditar} onChange={e => setSemana(i, 'elemento', e.target.value as Elemento)} className="border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:border-pm-red">
                {ELEMENTOS.map(el => <option key={el} value={el}>{el}</option>)}
              </select>
              <input type="date" value={s.inicio} disabled={!puedeEditar} onChange={e => setSemana(i, 'inicio', e.target.value)} className="border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:border-pm-red" title="Inicio (lunes)" />
              <input type="date" value={s.fin} disabled={!puedeEditar} onChange={e => setSemana(i, 'fin', e.target.value)} className="border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:border-pm-red" title="Fin (viernes)" />
              {puedeEditar && <button type="button" onClick={() => delSemana(i)} className="text-gray-300 hover:text-red-500 px-1" title="Quitar semana">✕</button>}
            </div>
          ))}
          {puedeEditar && <button type="button" onClick={addSemana} className="w-full border-2 border-dashed border-gray-300 rounded-xl py-2.5 text-sm font-bold text-pm-red hover:border-pm-red transition-colors">+ Añadir semana</button>}
        </div>
        <p className="text-[11px] text-gray-400">Inicio = lunes, Fin = viernes. El color y el «sentido» se asignan solos según el elemento.</p>
      </section>

      {puedeEditar && (
        <div className="flex items-center gap-3 sticky bottom-0 bg-pm-bg/80 backdrop-blur py-3 -mx-1 px-1">
          <button onClick={guardar} disabled={guardando} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black px-6 py-3 rounded-xl transition-colors">
            {guardando ? 'Guardando…' : 'Guardar todos los cambios'}
          </button>
          {msg && <span className={`text-sm font-semibold ${msg.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>{msg}</span>}
          {f.updatedAt && <span className="text-xs text-gray-400 ml-auto">Última edición: {new Date(f.updatedAt).toLocaleString('es-ES')}{f.updatedBy ? ` · ${f.updatedBy}` : ''}</span>}
        </div>
      )}
    </div>
  )
}
