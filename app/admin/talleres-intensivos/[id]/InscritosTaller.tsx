'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { guardarInscripcionTaller, eliminarInscripcionTaller } from '../actions'
import type { InscripcionTaller } from '@/lib/talleres/store'

const ESTADOS = ['nueva', 'confirmada', 'pendiente', 'espera', 'cancelada']
const ESTADO_LBL: Record<string, string> = { nueva: 'Nueva', confirmada: 'Confirmada', pendiente: 'Pendiente', espera: 'Lista de espera', cancelada: 'Cancelada' }
const PAGOS = ['pendiente', 'transferencia', 'instalacion', 'exento']
const PAGO_LBL: Record<string, string> = { pendiente: 'Pendiente', transferencia: 'Pagado (transferencia)', instalacion: 'Pagado (instalación)', exento: 'Exento' }

const eur = (c: number) => (c / 100).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
const aCents = (v: string) => { const n = parseFloat(v.replace(/[^\d,.-]/g, '').replace(',', '.')); return Number.isFinite(n) ? Math.round(n * 100) : 0 }

export default function InscritosTaller({ inscritos }: { inscritos: InscripcionTaller[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const correr = (fn: () => Promise<{ ok: boolean; error?: string | null }>) => {
    setError('')
    startTransition(async () => { const r = await fn(); if (!r.ok) setError(r.error || 'Error'); else router.refresh() })
  }

  const inp = 'border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-pm-red'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-pm-navy">Inscritos <span className="text-gray-400 font-medium">({inscritos.length})</span></h2>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-3">{error}</div>}

      {inscritos.length === 0 ? (
        <p className="text-sm text-gray-400 py-4">Todavía no hay inscripciones para este intensivo.</p>
      ) : (
        <div className="space-y-3">
          {inscritos.map(i => (
            <div key={i.id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="font-black text-pm-navy">{i.nombre} {i.apellidos}{i.edad ? ` · ${i.edad} años` : ''}</div>
                  <div className="text-xs text-gray-400">
                    {[i.telefono, i.email, i.tutor && `Tutor: ${i.tutor}`, i.modalidad, i.fechas, i.experiencia].filter(Boolean).join(' · ')}
                  </div>
                  {i.observaciones && <div className="text-xs text-gray-500 mt-1">{i.observaciones}</div>}
                </div>
                <button onClick={() => { if (confirm('¿Eliminar esta inscripción?')) correr(() => eliminarInscripcionTaller(i.id)) }} disabled={pending}
                  className="text-gray-300 hover:text-red-500 text-lg px-1 shrink-0">✕</button>
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <label className="block">
                  <span className="block text-[11px] font-bold text-gray-400 uppercase">Estado</span>
                  <select value={i.estado} disabled={pending} onChange={e => correr(() => guardarInscripcionTaller(i.id, { estado: e.target.value }))} className={inp}>
                    {ESTADOS.map(s => <option key={s} value={s}>{ESTADO_LBL[s]}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-[11px] font-bold text-gray-400 uppercase">Pago</span>
                  <select value={i.pagoEstado} disabled={pending} onChange={e => correr(() => guardarInscripcionTaller(i.id, { pago_estado: e.target.value }))} className={inp}>
                    {PAGOS.map(p => <option key={p} value={p}>{PAGO_LBL[p]}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-[11px] font-bold text-gray-400 uppercase">Importe (€)</span>
                  <input defaultValue={i.pagoImporteCents ? eur(i.pagoImporteCents) : ''} disabled={pending} placeholder="0"
                    onBlur={e => { const c = aCents(e.target.value); if (c !== i.pagoImporteCents) correr(() => guardarInscripcionTaller(i.id, { pago_importe_cents: c })) }}
                    className={`${inp} w-20`} />
                </label>
                <label className="block">
                  <span className="block text-[11px] font-bold text-gray-400 uppercase">Fecha pago</span>
                  <input type="date" value={i.pagoFecha} disabled={pending} onChange={e => correr(() => guardarInscripcionTaller(i.id, { pago_fecha: e.target.value }))} className={inp} />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
