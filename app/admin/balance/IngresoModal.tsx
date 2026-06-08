'use client'

import { useState, useTransition } from 'react'
import { METODOS_PAGO, ESTADOS_INGRESO, type IngresoMov } from '@/lib/balance/constants'
import { crearIngresoManual, editarIngresoManual, type IngresoManualInput } from './actions'

const hoy = () => new Date().toISOString().slice(0, 10)
const input = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'
const label = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'

export default function IngresoModal({ ingreso, onClose, onSaved }: {
  ingreso: IngresoMov | null   // manual a editar, o null para crear
  onClose: () => void
  onSaved: () => void
}) {
  const editId = ingreso && ingreso.tipo === 'manual' ? ingreso.id.replace(/^manual:/, '') : null
  const [f, setF] = useState<IngresoManualInput>({
    fecha: ingreso?.fecha || hoy(),
    concepto: ingreso?.servicio || '',
    servicio: ingreso?.servicio || '',
    categoria: ingreso?.categoria || '',
    cliente: ingreso?.cliente && ingreso.cliente !== '—' ? ingreso.cliente : '',
    importe: ingreso?.total ?? 0,
    pagado: ingreso?.pagado ?? null,
    metodo_pago: ingreso?.metodo || '',
    estado: ingreso?.estado || 'pagado',
    referencia: ingreso && ingreso.referencia.startsWith('M-') ? '' : (ingreso?.referencia || ''),
    observaciones: '',
  })
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const set = (k: keyof IngresoManualInput, v: unknown) => setF(p => ({ ...p, [k]: v }))

  function guardar() {
    setError('')
    if (!f.fecha || !f.concepto.trim()) { setError('Fecha y concepto son obligatorios.'); return }
    startTransition(async () => {
      const r = editId ? await editarIngresoManual(editId, f) : await crearIngresoManual(f)
      if (!r.ok) { setError(r.error || 'No se pudo guardar'); return }
      onSaved()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
        <div className="bg-green-700 text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="font-black">{editId ? 'Editar ingreso manual' : 'Nuevo ingreso manual'}</div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div>}
          <p className="text-xs text-gray-500 bg-pm-bg rounded-xl p-3">Usa esto para ingresos que <strong>no provienen de una reserva</strong> (efectivo, histórico de 2026, transferencias sueltas…). Los ingresos de reservas y pedidos se recogen solos.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={label}>Fecha *</label><input type="date" value={f.fecha} onChange={e => set('fecha', e.target.value)} className={input} /></div>
            <div><label className={label}>Estado</label>
              <select value={f.estado} onChange={e => set('estado', e.target.value)} className={input}>
                {ESTADOS_INGRESO.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
              </select>
            </div>
          </div>

          <div><label className={label}>Concepto *</label><input value={f.concepto} onChange={e => set('concepto', e.target.value)} placeholder="Ej. Taller AMPA colegio X" className={input} /></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={label}>Servicio</label><input value={f.servicio} onChange={e => set('servicio', e.target.value)} placeholder="Talleres, Eventos…" className={input} /></div>
            <div><label className={label}>Cliente</label><input value={f.cliente} onChange={e => set('cliente', e.target.value)} placeholder="Opcional" className={input} /></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div><label className={label}>Importe (€) *</label><input type="number" step="0.01" value={f.importe} onChange={e => set('importe', e.target.value)} className={input} /></div>
            <div><label className={label}>Cobrado (€)</label><input type="number" step="0.01" value={f.pagado ?? ''} onChange={e => set('pagado', e.target.value === '' ? null : e.target.value)} placeholder="Si parcial" className={input} /></div>
            <div><label className={label}>Método</label>
              <select value={f.metodo_pago} onChange={e => set('metodo_pago', e.target.value)} className={input}>
                <option value="">—</option>
                {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={label}>Referencia</label><input value={f.referencia} onChange={e => set('referencia', e.target.value)} placeholder="Opcional" className={input} /></div>
            <div><label className={label}>Categoría</label><input value={f.categoria} onChange={e => set('categoria', e.target.value)} placeholder="Opcional" className={input} /></div>
          </div>

          <div><label className={label}>Observaciones</label><textarea rows={2} value={f.observaciones} onChange={e => set('observaciones', e.target.value)} className={`${input} resize-none`} /></div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button onClick={onClose} className="text-sm font-semibold text-gray-500 px-4 py-2.5">Cancelar</button>
            <button onClick={guardar} disabled={pending} className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-xl transition-colors">
              {pending ? 'Guardando…' : (editId ? 'Guardar cambios' : 'Añadir ingreso')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
