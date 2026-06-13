'use client'

import { useState, useMemo, useTransition, useCallback } from 'react'
import { Metric } from '@/components/admin/ui'
import { waCliente } from '@/lib/whatsapp'
import {
  ESTADOS_RESERVA, ESTADOS_PAGO, ESTADOS_ACTIVOS, ESTADOS_PENDIENTES, METODOS_PAGO,
  labelReserva, labelPago, badgePago, eur, pendienteDe, pagadoDe, totalDe, fechaCorta,
  type Registro,
} from '@/lib/crm/constants'
import { guardarGestionCRM, registrarPagoCRM } from './actions'

const HOY = new Date().toISOString().slice(0, 10)
const MES = HOY.slice(0, 7)
const ANIO = HOY.slice(0, 4)

/** Patch al cambiar el estado de pago: si pasa a 'Pagado', el importe pagado iguala al total. */
// El pendiente/pagado se derivan del estado (ver pagadoDe/pendienteDe), así que basta
// con guardar el nuevo estado de pago.
function patchPago(_r: Registro, estado: string): Partial<Registro> {
  return { estado_pago: estado }
}

export default function ReservasCRMClient({ registros, puedeEditar, gestionOk }: {
  registros: Registro[]; puedeEditar: boolean; gestionOk: boolean
}) {
  const [lista, setLista] = useState<Registro[]>(registros)
  const [, startTransition] = useTransition()
  const [error, setError] = useState('')

  const [q, setQ] = useState('')
  const [fCategoria, setFCategoria] = useState('')
  const [fServicio, setFServicio] = useState('')
  const [fReserva, setFReserva] = useState('')
  const [fPago, setFPago] = useState('')
  const [fMes, setFMes] = useState('')
  const [detalleKey, setDetalleKey] = useState<string | null>(null)

  const keyOf = (r: Registro) => `${r.origen}|${r.id}`
  const detalle = lista.find(r => keyOf(r) === detalleKey) ?? null

  const servicios = useMemo(() => Array.from(new Set(lista.map(r => r.servicio).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')), [lista])
  const categorias = useMemo(() => {
    const m = new Map<string, number>()
    lista.forEach(r => m.set(r.categoria, (m.get(r.categoria) || 0) + 1))
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0], 'es'))
  }, [lista])
  const meses = useMemo(() => Array.from(new Set(lista.map(r => (r.fecha_realizacion || r.fecha_reserva || '').slice(0, 7)).filter(Boolean))).sort().reverse(), [lista])

  const filtradas = useMemo(() => lista.filter(r => {
    if (q.trim()) {
      const t = q.trim().toLowerCase()
      if (!`${r.cliente_nombre} ${r.cliente_email} ${r.cliente_telefono} ${r.servicio} ${r.numero}`.toLowerCase().includes(t)) return false
    }
    if (fCategoria && r.categoria !== fCategoria) return false
    if (fServicio && r.servicio !== fServicio) return false
    if (fReserva && r.estado_reserva !== fReserva) return false
    if (fPago && r.estado_pago !== fPago) return false
    if (fMes && (r.fecha_realizacion || r.fecha_reserva || '').slice(0, 7) !== fMes) return false
    return true
  }), [lista, q, fCategoria, fServicio, fReserva, fPago, fMes])

  // ── Dashboard ────────────────────────────────────────────────────────────────
  const dash = useMemo(() => {
    const activas = lista.filter(r => ESTADOS_ACTIVOS.includes(r.estado_reserva)).length
    // Por gestionar: reservas pendientes de acción (estado de reserva).
    const pendientes = lista.filter(r => ESTADOS_PENDIENTES.includes(r.estado_reserva)).length
    // Por cobrar: reservas con pago pendiente y con importe realmente pendiente (>0 €).
    const porCobrar = lista.filter(r => ['pendiente', 'impagado', 'parcial'].includes(r.estado_pago) && pendienteDe(r) > 0).length
    const pagosPend = lista.filter(r => ['pendiente', 'impagado', 'parcial'].includes(r.estado_pago)).reduce((s, r) => s + pendienteDe(r), 0)
    // Importe cobrado de una reserva, derivado del estado de pago.
    const cobrado = (r: Registro) => pagadoDe(r)
    // Mes: por fecha de realización del servicio. Año: por fecha de realización o de alta.
    const ingMes = lista.reduce((s, r) => ((r.fecha_realizacion || '').slice(0, 7) === MES ? s + cobrado(r) : s), 0)
    const ingAnio = lista.reduce((s, r) => ((r.fecha_realizacion || r.fecha_reserva || '').slice(0, 4) === ANIO ? s + cobrado(r) : s), 0)
    const proximos = (cat: string) => lista
      .filter(r => r.categoria === cat && r.fecha_realizacion && r.fecha_realizacion >= HOY && r.estado_reserva !== 'cancelada')
      .sort((a, b) => (a.fecha_realizacion || '').localeCompare(b.fecha_realizacion || ''))
    return { activas, pendientes, porCobrar, pagosPend, ingMes, ingAnio, cumple: proximos('Cumpleaños'), talleres: proximos('Talleres'), eventos: proximos('Eventos') }
  }, [lista])

  const hayFiltros = !!(q || fCategoria || fServicio || fReserva || fPago || fMes)
  const limpiar = () => { setQ(''); setFCategoria(''); setFServicio(''); setFReserva(''); setFPago(''); setFMes('') }

  // ── Mutaciones ─────────────────────────────────────────────────────────────────
  const patchLocal = useCallback((key: string, patch: Partial<Registro>) => {
    setLista(prev => prev.map(r => (keyOf(r) === key ? { ...r, ...patch } : r)))
  }, [])

  function aplicar(r: Registro, patch: Partial<Registro>) {
    if (!puedeEditar) return
    patchLocal(keyOf(r), patch)
    startTransition(async () => {
      const res = await guardarGestionCRM(r.origen, r.id, patch as never)
      if (!res.ok) setError(res.error || 'No se pudo guardar')
    })
  }

  function cobrar(r: Registro, importe: number, metodo: string, nota: string) {
    if (!puedeEditar) return
    const nuevos = [...(r.pagos || []), { fecha: new Date().toISOString(), importe, metodo, nota }]
    const pagado = nuevos.reduce((s, p) => s + (Number(p.importe) || 0), 0)
    const total = r.total
    const estado_pago = total && total > 0 ? (pagado >= total ? 'pagado' : 'parcial') : (pagado > 0 ? 'parcial' : 'pendiente')
    patchLocal(keyOf(r), { pagos: nuevos, pagado, estado_pago, metodo_pago: metodo })
    startTransition(async () => {
      const res = await registrarPagoCRM(r.origen, r.id, { importe, metodo, nota, total })
      if (!res.ok) setError(res.error || 'No se pudo registrar el cobro')
    })
  }

  function exportarCSV() {
    const cols = ['Nº', 'Cliente', 'Email', 'Teléfono', 'Servicio', 'Categoría', 'Fecha reserva', 'Fecha realización', 'Participantes', 'Total', 'Pagado', 'Pendiente', 'Estado reserva', 'Estado pago', 'Método', 'Observaciones']
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const filas = filtradas.map(r => [
      r.numero, r.cliente_nombre, r.cliente_email, r.cliente_telefono, r.servicio, r.categoria,
      fechaCorta(r.fecha_reserva), fechaCorta(r.fecha_realizacion), r.participantes ?? '',
      totalDe(r) || '', pagadoDe(r) || '', pendienteDe(r) || '', labelReserva(r.estado_reserva), labelPago(r.estado_pago),
      r.metodo_pago, r.observaciones,
    ].map(esc).join(';'))
    const csv = '﻿' + [cols.map(esc).join(';'), ...filas].join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a')
    a.href = url; a.download = `reservas-crm-${HOY}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {!gestionOk && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <div className="font-black mb-1">⚙️ Falta una migración</div>
          Ejecuta una vez <code className="bg-amber-100 px-1.5 py-0.5 rounded">supabase/migration_crm.sql</code> en Supabase
          para poder guardar estados, cobros y observaciones del CRM. Mientras tanto puedes ver los datos pero los cambios no se guardarán.
        </div>
      )}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex justify-between"><span>{error}</span><button onClick={() => setError('')} className="font-bold">✕</button></div>}

      {/* Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Metric label="Reservas activas" valor={dash.activas} tono="navy" />
        <Metric label="Por gestionar" valor={dash.pendientes} tono="amber" />
        <Metric label="Por cobrar" valor={dash.porCobrar} tono="red" />
        <Metric label="Importe pendiente" valor={eur(dash.pagosPend)} tono="red" />
        <Metric label={`Ingresos · ${new Date().toLocaleDateString('es-ES', { month: 'long' })}`} valor={eur(dash.ingMes)} tono="green" />
        <Metric label={`Ingresos ${ANIO}`} valor={eur(dash.ingAnio)} tono="green" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Proximo titulo="Próximos cumpleaños" icon="🎂" items={dash.cumple} />
        <Proximo titulo="Próximos talleres" icon="🎯" items={dash.talleres} />
        <Proximo titulo="Próximos eventos" icon="🎉" items={dash.eventos} />
      </div>

      {/* Pestañas por categoría */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFCategoria('')}
          className={`text-sm rounded-full border px-3.5 py-1.5 font-semibold transition-colors ${fCategoria === '' ? 'bg-pm-navy border-pm-navy text-white' : 'bg-white border-gray-200 text-pm-navy hover:border-pm-navy'}`}>
          Todos <span className={fCategoria === '' ? 'text-white/70' : 'text-gray-400'}>{lista.length}</span>
        </button>
        {categorias.map(([cat, n]) => (
          <button key={cat} onClick={() => setFCategoria(cat === fCategoria ? '' : cat)}
            className={`text-sm rounded-full border px-3.5 py-1.5 font-semibold transition-colors ${fCategoria === cat ? 'bg-pm-red border-pm-red text-white' : 'bg-white border-gray-200 text-pm-navy hover:border-pm-red'}`}>
            {cat} <span className={fCategoria === cat ? 'text-white/80' : 'text-pm-red'}>{n}</span>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2.5">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar cliente, email, teléfono, servicio, nº…"
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm flex-1 min-w-[220px] focus:outline-none focus:border-pm-red" />
        <select value={fServicio} onChange={e => setFServicio(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-pm-red max-w-[15rem]">
          <option value="">Todos los servicios</option>
          {servicios.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={fReserva} onChange={e => setFReserva(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-pm-red">
          <option value="">Estado reserva</option>
          {ESTADOS_RESERVA.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
        <select value={fPago} onChange={e => setFPago(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-pm-red">
          <option value="">Estado pago</option>
          {ESTADOS_PAGO.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
        <select value={fMes} onChange={e => setFMes(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-pm-red">
          <option value="">Cualquier mes</option>
          {meses.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {hayFiltros && <button onClick={limpiar} className="text-xs font-semibold text-pm-red hover:underline px-2 py-1">Limpiar</button>}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold">{filtradas.length} reg.</span>
          <button onClick={exportarCSV} className="text-sm font-bold text-white bg-pm-navy hover:bg-pm-navy-md rounded-xl px-3 py-2 transition-colors">⬇ Exportar CSV/Excel</button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtradas.length === 0 ? (
          <div className="text-center py-16"><div className="text-5xl mb-3">📋</div><p className="font-bold text-pm-navy">Sin reservas</p><p className="text-gray-400 text-sm mt-1">Las reservas, solicitudes y pedidos de empresa aparecerán aquí.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pm-bg text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left font-bold px-4 py-3">Cliente / Servicio</th>
                  <th className="text-left font-bold px-3 py-3">Realización</th>
                  <th className="text-center font-bold px-3 py-3">Part.</th>
                  <th className="text-right font-bold px-3 py-3">Total</th>
                  <th className="text-right font-bold px-3 py-3">Pendiente</th>
                  <th className="text-left font-bold px-3 py-3">Estado reserva</th>
                  <th className="text-left font-bold px-3 py-3">Pago</th>
                  <th className="text-right font-bold px-4 py-3">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtradas.map(r => {
                  const pend = pendienteDe(r)
                  return (
                    <tr key={keyOf(r)} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-pm-navy whitespace-nowrap">{r.cliente_nombre || 'Sin nombre'}</div>
                        <div className="text-xs text-gray-400">{r.servicio} · <span className="text-gray-300">{r.numero}</span></div>
                        {r.entidad && <div className="text-xs text-gray-400">🏢 {r.entidad}</div>}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-gray-600 text-xs">{fechaCorta(r.fecha_realizacion)}{r.hora ? ` · ${r.hora}` : ''}</td>
                      <td className="px-3 py-2.5 text-center text-gray-600">{r.participantes ?? '—'}</td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap text-pm-navy font-semibold">{eur(totalDe(r))}</td>
                      <td className={`px-3 py-2.5 text-right whitespace-nowrap font-bold ${pend > 0 ? 'text-pm-red' : 'text-gray-300'}`}>{pend > 0 ? eur(pend) : '—'}</td>
                      <td className="px-3 py-2.5">
                        <select value={r.estado_reserva} disabled={!puedeEditar} onChange={e => aplicar(r, { estado_reserva: e.target.value })}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-pm-red disabled:opacity-60">
                          {ESTADOS_RESERVA.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${badgePago(r.estado_pago)}`} />
                          <select value={r.estado_pago} disabled={!puedeEditar} onChange={e => aplicar(r, patchPago(r, e.target.value))}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-pm-red disabled:opacity-60">
                            {ESTADOS_PAGO.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={() => setDetalleKey(keyOf(r))} className="text-pm-red font-bold text-xs hover:underline whitespace-nowrap">Ver ficha →</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detalle && (
        <FichaCliente
          r={detalle} todas={lista} puedeEditar={puedeEditar}
          onClose={() => setDetalleKey(null)}
          onGestion={p => aplicar(detalle, p)}
          onCobrar={(imp, met, nota) => cobrar(detalle, imp, met, nota)}
        />
      )}
    </div>
  )
}

// ─── Tarjeta "próximos" ─────────────────────────────────────────────────────────
function Proximo({ titulo, icon, items }: { titulo: string; icon: string; items: Registro[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{titulo}</div>
        <span className="text-2xl font-black text-pm-navy">{items.length}</span>
      </div>
      {items.length === 0 ? <div className="text-xs text-gray-300">Sin próximos</div> : (
        <ul className="space-y-1">
          {items.slice(0, 3).map(r => (
            <li key={`${r.origen}|${r.id}`} className="text-xs text-gray-600 flex justify-between gap-2">
              <span className="truncate">{icon} {r.cliente_nombre || r.servicio}</span>
              <span className="text-gray-400 shrink-0">{fechaCorta(r.fecha_realizacion)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Ficha del cliente / reserva ─────────────────────────────────────────────────
function FichaCliente({ r, todas, puedeEditar, onClose, onGestion, onCobrar }: {
  r: Registro; todas: Registro[]; puedeEditar: boolean
  onClose: () => void; onGestion: (p: Partial<Registro>) => void; onCobrar: (importe: number, metodo: string, nota: string) => void
}) {
  const [obs, setObs] = useState(r.observaciones)
  const [importe, setImporte] = useState('')
  const [metodo, setMetodo] = useState(METODOS_PAGO[0])
  const [nota, setNota] = useState('')
  const pend = pendienteDe(r)
  const historialCliente = r.cliente_email ? todas.filter(x => x.cliente_email && x.cliente_email === r.cliente_email) : [r]

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl">
        <div className="bg-pm-navy text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="font-black text-lg">{r.cliente_nombre || 'Cliente'}</div>
            <div className="text-white/60 text-xs">{r.servicio} · {r.numero}</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>

        <div className="p-5 space-y-5 text-sm">
          {/* Estado reserva */}
          <div>
            <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Estado de la reserva</div>
            <div className="flex flex-wrap gap-1.5">
              {ESTADOS_RESERVA.map(e => (
                <button key={e.id} disabled={!puedeEditar} onClick={() => onGestion({ estado_reserva: e.id })}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-full border transition-colors ${r.estado_reserva === e.id ? `${e.badge} border-transparent ring-2 ring-offset-1 ring-pm-navy/20` : 'border-gray-200 text-gray-500 hover:border-pm-navy'}`}>
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Económico */}
          <div className="bg-pm-bg rounded-xl p-3">
            <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Ficha económica</div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <CampoNum label="Total €" value={r.total} disabled={!puedeEditar} onSave={v => onGestion({ total: v })} />
              <div><div className="text-[11px] text-gray-400">Pagado</div><div className="font-black text-green-600">{eur(pagadoDe(r))}</div></div>
              <div><div className="text-[11px] text-gray-400">Pendiente</div><div className={`font-black ${pend > 0 ? 'text-pm-red' : 'text-gray-400'}`}>{eur(pend)}</div></div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${badgePago(r.estado_pago)}`} />
              <select value={r.estado_pago} disabled={!puedeEditar} onChange={e => onGestion(patchPago(r, e.target.value))}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-pm-red disabled:opacity-60">
                {ESTADOS_PAGO.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
              </select>
              {r.metodo_pago && <span className="text-xs text-gray-400">· {r.metodo_pago}</span>}
            </div>
            {/* Registrar cobro */}
            {puedeEditar && (
              <div className="mt-3 border-t border-gray-200 pt-3">
                <div className="text-[11px] font-bold text-gray-500 uppercase mb-1.5">Registrar cobro</div>
                <div className="flex gap-2">
                  <input type="number" value={importe} onChange={e => setImporte(e.target.value)} placeholder="€" className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-pm-red" />
                  <select value={metodo} onChange={e => setMetodo(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-pm-red">
                    {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <input value={nota} onChange={e => setNota(e.target.value)} placeholder="nota" className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-pm-red" />
                  <button onClick={() => { const n = parseFloat(importe); if (n > 0) { onCobrar(n, metodo, nota); setImporte(''); setNota('') } }}
                    className="bg-green-600 text-white font-bold px-3 py-1.5 rounded-lg text-sm">+</button>
                </div>
              </div>
            )}
            {/* Historial de pagos */}
            {r.pagos.length > 0 && (
              <div className="mt-3 space-y-1">
                {r.pagos.map((p, i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-600 border-b border-gray-100 pb-1">
                    <span>{fechaCorta(p.fecha)} · {p.metodo}{p.nota ? ` · ${p.nota}` : ''}</span>
                    <span className="font-bold text-green-600">{eur(p.importe)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Entidad contratante (eventos, licitaciones, colegios…) */}
          {r.entidad && (
            <div className="bg-pm-navy/5 border border-pm-navy/10 rounded-xl p-3">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Entidad contratante</div>
              <div className="text-pm-navy font-black">🏢 {r.entidad}</div>
              <div className="text-xs text-gray-500 mt-0.5">Contacto: {r.cliente_nombre || '—'}{r.cliente_telefono ? ` · ${r.cliente_telefono}` : ''}</div>
            </div>
          )}

          {/* Datos */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <Dato k="Email" v={r.cliente_email || '—'} />
            <Dato k="Teléfono" v={r.cliente_telefono || '—'} />
            <CampoFecha label="Fecha realización" value={r.fecha_realizacion} disabled={!puedeEditar} onSave={v => onGestion({ fecha_realizacion: v })} />
            <CampoNum label="Participantes" value={r.participantes} disabled={!puedeEditar} onSave={v => onGestion({ participantes: v })} />
            <Dato k="Solicitado el" v={fechaCorta(r.fecha_reserva)} />
            <Dato k="Categoría" v={r.categoria} />
          </div>

          {/* Detalles del servicio (semana/días/extras de campamentos, pack de eventos, medidas de colchonetas…) */}
          {(() => {
            const detalles = Object.entries(r.datos || {}).filter(([k, v]) => !k.startsWith('__') && v != null && String(v) !== '')
            if (detalles.length === 0) return null
            return (
              <div>
                <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Detalles del servicio</div>
                <div className="bg-pm-bg rounded-xl p-3 grid grid-cols-2 gap-x-3 gap-y-2">
                  {detalles.map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[11px] text-gray-400">{humanizar(k)}</div>
                      <div className="text-sm text-pm-navy font-medium break-words">{String(v)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-black text-pm-navy uppercase tracking-wider mb-1.5">Observaciones internas</label>
            <textarea value={obs} disabled={!puedeEditar} onChange={e => setObs(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pm-red resize-none disabled:opacity-60" />
            {puedeEditar && obs !== r.observaciones && <button onClick={() => onGestion({ observaciones: obs })} className="mt-2 bg-pm-navy text-white text-xs font-bold px-4 py-2 rounded-lg">Guardar observaciones</button>}
          </div>

          {/* Contacto */}
          <div className="flex gap-2 flex-wrap border-t border-gray-100 pt-4">
            {r.cliente_email && <a href={`mailto:${r.cliente_email}`} className="bg-pm-navy text-white text-sm font-bold px-4 py-2 rounded-xl">Email</a>}
            {r.cliente_telefono && <a href={waCliente(r.cliente_telefono, `Hola ${r.cliente_nombre || ''} 👋, te escribimos de Planeta Movimiento sobre tu reserva de ${r.servicio}.`)} target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-xl">WhatsApp</a>}
          </div>

          {r.mensaje && <div className="bg-pm-bg rounded-xl p-3"><div className="text-xs font-bold text-gray-400 uppercase mb-1">Mensaje del cliente</div><p className="text-gray-600 whitespace-pre-wrap text-sm">{r.mensaje}</p></div>}

          {/* Historial del cliente */}
          {historialCliente.length > 1 && (
            <div>
              <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Historial del cliente ({historialCliente.length})</div>
              <div className="space-y-1">
                {historialCliente.map(h => (
                  <div key={`${h.origen}|${h.id}`} className="flex justify-between text-xs border-b border-gray-50 py-1">
                    <span className="text-gray-600">{h.servicio} · {fechaCorta(h.fecha_realizacion || h.fecha_reserva)}</span>
                    <span className={`font-semibold ${ESTADOS_RESERVA.find(e => e.id === h.estado_reserva)?.badge ?? ''} px-1.5 rounded`}>{labelReserva(h.estado_reserva)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Dato({ k, v }: { k: string; v: string }) {
  return <div><div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{k}</div><div className="text-pm-navy font-semibold break-words">{v}</div></div>
}

/** Convierte una clave de datos (camelCase / snake) en una etiqueta legible. */
function humanizar(k: string): string {
  const s = k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').trim()
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function CampoNum({ label, value, disabled, onSave }: { label: string; value: number | null; disabled: boolean; onSave: (v: number | null) => void }) {
  return (
    <div>
      <div className="text-[11px] text-gray-400">{label}</div>
      <input type="number" defaultValue={value ?? ''} disabled={disabled}
        onBlur={e => { const v = e.target.value === '' ? null : Number(e.target.value); if (v !== value) onSave(v) }}
        className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-pm-red disabled:opacity-60" />
    </div>
  )
}

function CampoFecha({ label, value, disabled, onSave }: { label: string; value: string | null; disabled: boolean; onSave: (v: string | null) => void }) {
  return (
    <div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</div>
      <input type="date" defaultValue={value ? value.slice(0, 10) : ''} disabled={disabled}
        onBlur={e => { const v = e.target.value || null; if (v !== (value ? value.slice(0, 10) : null)) onSave(v) }}
        className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-pm-red disabled:opacity-60" />
    </div>
  )
}
