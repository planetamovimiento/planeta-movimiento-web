'use client'

import { useState, useTransition } from 'react'
import { SubirImagen } from '@/components/admin/SubirImagen'
import { METODOS_PAGO, ESTADOS_GASTO, SUBCATEGORIAS_GASTO, gastoConIva, eur, type Categoria, type GastoMov } from '@/lib/balance/constants'
import { crearGasto, editarGasto, type GastoInput } from './actions'

const hoy = () => new Date().toISOString().slice(0, 10)
const input = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'
const label = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'

export default function GastoModal({ gasto, categorias, onClose, onSaved }: {
  gasto: GastoMov | null
  categorias: Categoria[]
  onClose: () => void
  onSaved: () => void
}) {
  const [f, setF] = useState<GastoInput>({
    fecha: gasto?.fecha || hoy(),
    concepto: gasto?.concepto || '',
    categoria: gasto?.categoria || (categorias[0]?.nombre ?? 'Otros gastos'),
    subcategoria: gasto?.subcategoria || '',
    proveedor: gasto?.proveedor || '',
    importe: gasto?.importe ?? 0,
    iva: gasto?.iva ?? null,
    metodo_pago: gasto?.metodo || '',
    estado: gasto?.estado || 'pagado',
    observaciones: gasto?.observaciones || '',
    adjunto_url: gasto?.adjuntoUrl || '',
    factura_ref: gasto?.facturaRef || '',
  })
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const set = (k: keyof GastoInput, v: unknown) => setF(p => ({ ...p, [k]: v }))

  const total = gastoConIva(Number(f.importe) || 0, f.iva == null || (f.iva as unknown) === '' ? null : Number(f.iva))

  function guardar() {
    setError('')
    if (!f.fecha || !f.concepto.trim()) { setError('Fecha y concepto son obligatorios.'); return }
    startTransition(async () => {
      const r = gasto ? await editarGasto(gasto.id, f) : await crearGasto(f)
      if (!r.ok) { setError(r.error || 'No se pudo guardar'); return }
      onSaved()
    })
  }

  const catsActivas = categorias.filter(c => c.activa)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="bg-pm-navy text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="font-black">{gasto ? 'Editar gasto' : 'Nuevo gasto'}</div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={label}>Fecha *</label><input type="date" value={f.fecha} onChange={e => set('fecha', e.target.value)} className={input} /></div>
            <div><label className={label}>Estado</label>
              <select value={f.estado} onChange={e => set('estado', e.target.value)} className={input}>
                {ESTADOS_GASTO.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
              </select>
            </div>
          </div>

          <div><label className={label}>Concepto *</label><input value={f.concepto} onChange={e => set('concepto', e.target.value)} placeholder="Ej. Factura luz octubre" className={input} /></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={label}>Categoría</label>
              <select value={f.categoria} onChange={e => set('categoria', e.target.value)} className={input}>
                {catsActivas.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                {!catsActivas.some(c => c.nombre === f.categoria) && f.categoria && <option value={f.categoria}>{f.categoria}</option>}
              </select>
            </div>
            <div>
              <label className={label}>Subcategoría</label>
              <input list="subcats" value={f.subcategoria} onChange={e => set('subcategoria', e.target.value)} placeholder="Opcional" className={input} />
              <datalist id="subcats">
                {(SUBCATEGORIAS_GASTO[f.categoria] ?? []).map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={label}>Proveedor</label><input value={f.proveedor} onChange={e => set('proveedor', e.target.value)} placeholder="Opcional" className={input} /></div>
            <div><label className={label}>Método de pago</label>
              <select value={f.metodo_pago} onChange={e => set('metodo_pago', e.target.value)} className={input}>
                <option value="">—</option>
                {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-end">
            <div><label className={label}>Importe base (€) *</label><input type="number" step="0.01" value={f.importe} onChange={e => set('importe', e.target.value)} className={input} /></div>
            <div><label className={label}>IVA (%)</label><input type="number" step="0.01" value={f.iva ?? ''} onChange={e => set('iva', e.target.value === '' ? null : e.target.value)} placeholder="21" className={input} /></div>
            <div className="bg-pm-bg rounded-xl px-3 py-2.5 text-center">
              <div className="text-[11px] text-gray-400 uppercase font-bold">Total c/IVA</div>
              <div className="font-black text-pm-navy">{eur(total)}</div>
            </div>
          </div>

          <div><label className={label}>Nº factura / referencia</label><input value={f.factura_ref} onChange={e => set('factura_ref', e.target.value)} placeholder="Opcional" className={input} /></div>

          <div><label className={label}>Observaciones</label><textarea rows={2} value={f.observaciones} onChange={e => set('observaciones', e.target.value)} className={`${input} resize-none`} /></div>

          <div>
            <label className={label}>Justificante / factura (imagen)</label>
            <SubirImagen value={f.adjunto_url || ''} onChange={url => set('adjunto_url', url)} carpeta="gastos" />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 sticky bottom-0 bg-white">
            <button onClick={onClose} className="text-sm font-semibold text-gray-500 px-4 py-2.5">Cancelar</button>
            <button onClick={guardar} disabled={pending} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-xl transition-colors">
              {pending ? 'Guardando…' : (gasto ? 'Guardar cambios' : 'Añadir gasto')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
