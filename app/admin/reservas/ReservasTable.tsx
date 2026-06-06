'use client'

import { useState, useMemo, useTransition } from 'react'
import { EstadoBadge, EmptyState } from '@/components/admin/ui'
import { actualizarEstadoReserva, actualizarEstadoPago, guardarNotasInternas } from './actions'
import type { Booking } from '@/lib/admin/data'

const ESTADOS_RESERVA = ['pendiente', 'confirmada', 'pagada', 'cancelada', 'espera', 'reembolsada']
const ESTADOS_PAGO = ['pendiente', 'pagado', 'fallido', 'reembolsado', 'parcial']

export default function ReservasTable({ reservas, puedeEditar }: { reservas: Booking[]; puedeEditar: boolean }) {
  const [busqueda, setBusqueda] = useState('')
  const [fServicio, setFServicio] = useState('')
  const [fEstado, setFEstado] = useState('')
  const [fFecha, setFFecha] = useState('')
  const [detalle, setDetalle] = useState<Booking | null>(null)
  const [pending, startTransition] = useTransition()

  const servicios = useMemo(() => Array.from(new Set(reservas.map(r => r.servicio).filter(Boolean))) as string[], [reservas])

  const filtradas = useMemo(() => reservas.filter(r => {
    if (busqueda) {
      const q = busqueda.toLowerCase()
      const hit = [r.cliente_nombre, r.cliente_email, r.cliente_telefono, r.numero, r.servicio]
        .some(v => v?.toLowerCase().includes(q))
      if (!hit) return false
    }
    if (fServicio && r.servicio !== fServicio) return false
    if (fEstado && r.estado_reserva !== fEstado) return false
    if (fFecha && r.fecha !== fFecha) return false
    return true
  }), [reservas, busqueda, fServicio, fEstado, fFecha])

  function exportCSV() {
    const headers = ['Numero', 'Cliente', 'Email', 'Telefono', 'Servicio', 'Fecha', 'Hora', 'Participantes', 'Precio', 'Estado reserva', 'Estado pago']
    const rows = filtradas.map(r => [r.numero, r.cliente_nombre, r.cliente_email, r.cliente_telefono, r.servicio, r.fecha, r.hora, r.participantes, r.precio, r.estado_reserva, r.estado_pago])
    const csv = [headers, ...rows].map(row => row.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `reservas-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar cliente, email, teléfono, nº..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-pm-red" />
        </div>
        <select value={fServicio} onChange={e => setFServicio(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-pm-red">
          <option value="">Todos los servicios</option>
          {servicios.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={fEstado} onChange={e => setFEstado(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-pm-red">
          <option value="">Todos los estados</option>
          {ESTADOS_RESERVA.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="date" value={fFecha} onChange={e => setFFecha(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red" />
        <button onClick={exportCSV} className="bg-pm-navy hover:bg-pm-navy-md text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Exportar CSV
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 text-sm text-gray-500 border-b border-gray-100">{filtradas.length} reserva(s)</div>
        {filtradas.length === 0 ? (
          <EmptyState titulo="Sin reservas" desc="No hay reservas que coincidan con los filtros." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Servicio</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Pers.</th>
                  <th className="px-4 py-3 font-semibold">Precio</th>
                  <th className="px-4 py-3 font-semibold">Reserva</th>
                  <th className="px-4 py-3 font-semibold">Pago</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtradas.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-pm-navy">{r.cliente_nombre || '—'}</div>
                      <div className="text-xs text-gray-400">{r.cliente_email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.servicio || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.fecha || '—'}<div className="text-xs text-gray-400">{r.hora}</div></td>
                    <td className="px-4 py-3 text-gray-600">{r.participantes ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-pm-navy">{r.precio != null ? `${r.precio} €` : '—'}</td>
                    <td className="px-4 py-3"><EstadoBadge estado={r.estado_reserva} /></td>
                    <td className="px-4 py-3"><EstadoBadge estado={r.estado_pago} /></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setDetalle(r)} className="text-pm-red font-semibold text-sm hover:underline">Gestionar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Panel de detalle / gestión */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetalle(null)} />
          <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
            <div className="bg-pm-navy text-white px-5 py-4 flex items-center justify-between sticky top-0">
              <div>
                <div className="font-black">{detalle.cliente_nombre || 'Reserva'}</div>
                <div className="text-white/60 text-xs">{detalle.numero || detalle.id.slice(0, 8)}</div>
              </div>
              <button onClick={() => setDetalle(null)} className="text-white/60 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="p-5 space-y-5 text-sm">
              {/* Datos */}
              <div className="space-y-2">
                {[
                  ['Servicio', detalle.servicio], ['Fecha', detalle.fecha], ['Hora', detalle.hora],
                  ['Participantes', detalle.participantes], ['Precio', detalle.precio != null ? `${detalle.precio} €` : null],
                  ['Email', detalle.cliente_email], ['Teléfono', detalle.cliente_telefono],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between gap-4 border-b border-gray-50 pb-1.5">
                    <span className="text-gray-400">{k}</span>
                    <span className="text-pm-navy font-semibold text-right">{v || '—'}</span>
                  </div>
                ))}
              </div>

              {detalle.observaciones && (
                <div className="bg-pm-bg rounded-xl p-3">
                  <div className="text-xs font-bold text-gray-400 uppercase mb-1">Observaciones del cliente</div>
                  <p className="text-gray-600">{detalle.observaciones}</p>
                </div>
              )}

              {puedeEditar ? (
                <>
                  {/* Estado reserva */}
                  <div>
                    <label className="block text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Estado de la reserva</label>
                    <div className="flex flex-wrap gap-1.5">
                      {ESTADOS_RESERVA.map(s => (
                        <button key={s} disabled={pending}
                          onClick={() => startTransition(async () => { await actualizarEstadoReserva(detalle.id, s); setDetalle({ ...detalle, estado_reserva: s }) })}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${detalle.estado_reserva === s ? 'bg-pm-red border-pm-red text-white' : 'border-gray-200 text-gray-600 hover:border-pm-red'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Estado pago */}
                  <div>
                    <label className="block text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Estado del pago</label>
                    <div className="flex flex-wrap gap-1.5">
                      {ESTADOS_PAGO.map(s => (
                        <button key={s} disabled={pending}
                          onClick={() => startTransition(async () => { await actualizarEstadoPago(detalle.id, s); setDetalle({ ...detalle, estado_pago: s }) })}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${detalle.estado_pago === s ? 'bg-pm-navy border-pm-navy text-white' : 'border-gray-200 text-gray-600 hover:border-pm-navy'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Notas internas */}
                  <NotasInternas reserva={detalle} />
                </>
              ) : (
                <div className="bg-gray-50 rounded-xl p-3 text-gray-500 text-xs">Tu rol es de solo lectura: no puedes modificar reservas.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NotasInternas({ reserva }: { reserva: Booking }) {
  const [notas, setNotas] = useState(reserva.notas_internas || '')
  const [pending, startTransition] = useTransition()
  const [guardado, setGuardado] = useState(false)
  return (
    <div>
      <label className="block text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Notas internas</label>
      <textarea rows={3} value={notas} onChange={e => { setNotas(e.target.value); setGuardado(false) }}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red resize-none" />
      <button disabled={pending}
        onClick={() => startTransition(async () => { await guardarNotasInternas(reserva.id, notas); setGuardado(true) })}
        className="mt-2 bg-pm-navy hover:bg-pm-navy-md text-white text-sm font-bold px-4 py-2 rounded-xl">
        {pending ? 'Guardando...' : guardado ? '✓ Guardado' : 'Guardar notas'}
      </button>
    </div>
  )
}
