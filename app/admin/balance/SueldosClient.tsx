'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { guardarSueldo, marcarPagoSueldo, pagarPendientesMonitor, eliminarSueldo, type SueldoInput } from './sueldos-actions'
import { METODOS, ESTADOS, CONCEPTOS, totales, porMonitor, type Sueldo } from '@/lib/sueldos/data'

// ─────────────────────────────────────────────────────────────────────────────
// Balance → Sueldos. Lo que se le paga a cada monitor, con filtros por monitor,
// mes, forma de pago y estado, y el resumen de lo que queda por pagar.
// ─────────────────────────────────────────────────────────────────────────────

type MonitorSimple = { id: string; nombre: string }

const eur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n || 0)
const hoy = () => new Date().toISOString().slice(0, 10)
const mesDe = (f: string) => f.slice(0, 7)
const fechaCorta = (f: string) => (f ? f.split('-').reverse().join('/') : '—')

const sel = 'border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-pm-red'
const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'
const lbl = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'
const TODO = '__all__'

export default function SueldosClient({ sueldos, monitores, ambito, puedeEditar, puedeBorrar, setupOk }: {
  sueldos: Sueldo[]
  monitores: MonitorSimple[]
  ambito: 'empresa' | 'club'
  puedeEditar: boolean
  puedeBorrar: boolean
  setupOk: boolean
}) {
  const router = useRouter()
  const [fMonitor, setFMonitor] = useState(TODO)
  const [fMes, setFMes] = useState(TODO)
  const [fMetodo, setFMetodo] = useState(TODO)
  const [fEstado, setFEstado] = useState(TODO)
  const [modal, setModal] = useState<Sueldo | 'nuevo' | null>(null)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  const delAmbito = useMemo(() => sueldos.filter(s => s.ambito === ambito), [sueldos, ambito])
  const meses = useMemo(() => [...new Set(delAmbito.map(s => mesDe(s.fecha)))].sort().reverse(), [delAmbito])

  const lista = useMemo(() => delAmbito.filter(s =>
    (fMonitor === TODO || s.monitor_id === fMonitor) &&
    (fMes === TODO || mesDe(s.fecha) === fMes) &&
    (fMetodo === TODO || s.metodo === fMetodo) &&
    (fEstado === TODO || s.estado === fEstado)
  ), [delAmbito, fMonitor, fMes, fMetodo, fEstado])

  const T = useMemo(() => totales(lista), [lista])
  const resumenMonitores = useMemo(() => porMonitor(lista), [lista])

  const correr = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError('')
    start(async () => {
      const r = await fn()
      if (!r.ok) setError(r.error || 'No se pudo guardar')
      else router.refresh()
    })
  }

  if (!setupOk) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
        <div className="font-black mb-1">Falta crear la tabla de sueldos</div>
        Ejecuta una vez <code className="bg-amber-100 px-1.5 py-0.5 rounded">supabase/migration_sueldos.sql</code> en
        el SQL Editor de Supabase y vuelve a entrar aquí.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Totales */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Kpi label="Total bruto" valor={eur(T.bruto)} />
        <Kpi label="Total a pagar" valor={eur(T.neto)} fuerte />
        <Kpi label="Pagado" valor={eur(T.pagado)} tono="green" />
        <Kpi label="Pendiente" valor={eur(T.pendiente)} tono="red" />
        <Kpi label="En efectivo" valor={eur(T.efectivo)} tono="amber" />
        <Kpi label="Nómina y transferencia" valor={eur(T.nomina + T.transferencia)} tono="blue" />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <select value={fMonitor} onChange={e => setFMonitor(e.target.value)} className={sel}>
          <option value={TODO}>Todos los monitores</option>
          {monitores.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
        <select value={fMes} onChange={e => setFMes(e.target.value)} className={sel}>
          <option value={TODO}>Todos los meses</option>
          {meses.map(m => <option key={m} value={m}>{m.split('-').reverse().join('/')}</option>)}
        </select>
        <select value={fMetodo} onChange={e => setFMetodo(e.target.value)} className={sel}>
          <option value={TODO}>Cualquier forma de pago</option>
          {METODOS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        <select value={fEstado} onChange={e => setFEstado(e.target.value)} className={sel}>
          <option value={TODO}>Pagados y pendientes</option>
          {ESTADOS.map(e2 => <option key={e2.id} value={e2.id}>{e2.label}</option>)}
        </select>
        <span className="text-xs text-gray-400">{T.lineas} línea(s)</span>
        {puedeEditar && (
          <button onClick={() => setModal('nuevo')} className="ml-auto bg-pm-red hover:bg-pm-red-dark text-white font-bold text-sm px-4 py-2 rounded-xl">
            + Añadir trabajo
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}

      {/* Resumen por monitor */}
      {resumenMonitores.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-3">Por monitor</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {resumenMonitores.map(m => (
              <div key={m.monitor_id} className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-pm-navy text-sm truncate">{m.nombre}</div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${m.t.pendiente > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {m.t.pendiente > 0 ? `Debe ${eur(m.t.pendiente)}` : 'Al día'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Total {eur(m.t.neto)} · Efectivo {eur(m.t.efectivo)} · Nómina {eur(m.t.nomina)} · Transf. {eur(m.t.transferencia)}
                </div>
                {puedeEditar && m.t.pendiente > 0 && (
                  <button disabled={pending}
                    onClick={() => { if (confirm(`¿Marcar como pagado todo lo pendiente de ${m.nombre} (${eur(m.t.pendiente)})?`)) correr(() => pagarPendientesMonitor(m.monitor_id, ambito)) }}
                    className="mt-2 text-xs font-bold text-pm-red hover:underline">
                    Marcar todo como pagado
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detalle */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-pm-bg text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="text-left font-bold px-4 py-3">Fecha</th>
                <th className="text-left font-bold px-3 py-3">Monitor</th>
                <th className="text-left font-bold px-3 py-3">Concepto</th>
                <th className="text-right font-bold px-3 py-3">Bruto</th>
                <th className="text-right font-bold px-3 py-3">Neto</th>
                <th className="text-left font-bold px-3 py-3">Forma de pago</th>
                <th className="text-left font-bold px-3 py-3">Estado</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lista.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Sin trabajos registrados con estos filtros.</td></tr>
              )}
              {lista.map(s => {
                const met = METODOS.find(m => m.id === s.metodo)!
                const est = ESTADOS.find(e => e.id === s.estado)!
                return (
                  <tr key={s.id} className="hover:bg-pm-bg/50">
                    <td className="px-4 py-2.5 whitespace-nowrap text-gray-600">{fechaCorta(s.fecha)}</td>
                    <td className="px-3 py-2.5 font-semibold text-pm-navy whitespace-nowrap">{s.monitorNombre}</td>
                    <td className="px-3 py-2.5">
                      <div className="text-pm-navy">{s.concepto}</div>
                      {s.detalle && <div className="text-xs text-gray-400">{s.detalle}</div>}
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-500 whitespace-nowrap">{eur(s.bruto)}</td>
                    <td className="px-3 py-2.5 text-right font-black text-pm-navy whitespace-nowrap">{eur(s.neto)}</td>
                    <td className="px-3 py-2.5"><span className={`text-[11px] font-bold px-2 py-1 rounded-full ${met.badge}`}>{met.label}</span></td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${est.badge}`}>{est.label}</span>
                      {s.estado === 'pagado' && s.fecha_pago && <div className="text-[11px] text-gray-400 mt-0.5">{fechaCorta(s.fecha_pago)}</div>}
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      {puedeEditar && (
                        <>
                          <button disabled={pending} onClick={() => correr(() => marcarPagoSueldo(s.id, s.estado !== 'pagado'))}
                            className="text-xs font-bold text-pm-navy hover:text-pm-red px-2">
                            {s.estado === 'pagado' ? 'Pendiente' : 'Pagar'}
                          </button>
                          <button onClick={() => setModal(s)} className="text-xs font-bold text-gray-400 hover:text-pm-navy px-2">Editar</button>
                        </>
                      )}
                      {puedeBorrar && (
                        <button disabled={pending}
                          onClick={() => { if (confirm('¿Eliminar esta línea de sueldo?')) correr(() => eliminarSueldo(s.id)) }}
                          className="text-xs font-bold text-gray-400 hover:text-red-600 px-2">Borrar</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <ModalSueldo sueldo={modal === 'nuevo' ? null : modal} monitores={monitores} ambito={ambito}
          onClose={() => setModal(null)}
          onGuardar={datos => { correr(() => guardarSueldo(datos)); setModal(null) }} />
      )}
    </div>
  )
}

function Kpi({ label, valor, tono = 'navy', fuerte = false }: { label: string; valor: string; tono?: string; fuerte?: boolean }) {
  const color = tono === 'green' ? 'text-green-600' : tono === 'red' ? 'text-red-600' : tono === 'amber' ? 'text-amber-600' : tono === 'blue' ? 'text-blue-600' : 'text-pm-navy'
  return (
    <div className={`bg-white rounded-2xl border p-4 ${fuerte ? 'border-pm-navy/20' : 'border-gray-100'}`}>
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-black ${color}`}>{valor}</div>
    </div>
  )
}

function ModalSueldo({ sueldo, monitores, ambito, onClose, onGuardar }: {
  sueldo: Sueldo | null
  monitores: MonitorSimple[]
  ambito: 'empresa' | 'club'
  onClose: () => void
  onGuardar: (d: SueldoInput) => void
}) {
  const [f, setF] = useState({
    monitor_id: sueldo?.monitor_id ?? (monitores[0]?.id ?? ''),
    fecha: sueldo?.fecha || hoy(),
    concepto: sueldo?.concepto ?? CONCEPTOS[0],
    detalle: sueldo?.detalle ?? '',
    bruto: sueldo?.bruto ?? 0,
    neto: sueldo?.neto ?? 0,
    metodo: sueldo?.metodo ?? 'efectivo',
    estado: sueldo?.estado ?? 'pendiente',
    fecha_pago: sueldo?.fecha_pago ?? '',
    horas: sueldo?.horas ?? 0,
    notas: sueldo?.notas ?? '',
  })
  const set = (k: keyof typeof f, v: unknown) => setF(p => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-pm-navy text-white px-5 py-4 flex items-center justify-between sticky top-0">
          <div className="font-black">{sueldo ? 'Editar trabajo' : 'Nuevo trabajo'}</div>
          <button onClick={onClose} aria-label="Cerrar" className="text-white/60 hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className={lbl}>Monitor</label>
            <select className={`${inp} bg-white`} value={f.monitor_id} onChange={e => set('monitor_id', e.target.value)}>
              {monitores.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Fecha del trabajo</label>
              <input type="date" className={inp} value={f.fecha} onChange={e => set('fecha', e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Horas (opcional)</label>
              <input type="number" step="0.5" className={inp} value={f.horas || ''} onChange={e => set('horas', Number(e.target.value))} />
            </div>
          </div>

          <div>
            <label className={lbl}>Concepto</label>
            <input list="conceptos-sueldo" className={inp} value={f.concepto} onChange={e => set('concepto', e.target.value)} />
            <datalist id="conceptos-sueldo">{CONCEPTOS.map(c => <option key={c} value={c} />)}</datalist>
          </div>

          <div>
            <label className={lbl}>Detalle (opcional)</label>
            <input className={inp} value={f.detalle} onChange={e => set('detalle', e.target.value)} placeholder="Cumpleaños de Marta, taller en el CEIP…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Bruto (€)</label>
              <input type="number" step="0.01" className={inp} value={f.bruto || ''} onChange={e => set('bruto', Number(e.target.value))} />
            </div>
            <div>
              <label className={lbl}>Neto a entregar (€)</label>
              <input type="number" step="0.01" className={inp} value={f.neto || ''} onChange={e => set('neto', Number(e.target.value))} placeholder="Igual que el bruto" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Forma de pago</label>
              <select className={`${inp} bg-white`} value={f.metodo} onChange={e => set('metodo', e.target.value)}>
                {METODOS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Estado</label>
              <select className={`${inp} bg-white`} value={f.estado} onChange={e => set('estado', e.target.value)}>
                {ESTADOS.map(e2 => <option key={e2.id} value={e2.id}>{e2.label}</option>)}
              </select>
            </div>
          </div>

          {f.estado === 'pagado' && (
            <div>
              <label className={lbl}>Fecha de pago</label>
              <input type="date" className={inp} value={f.fecha_pago || f.fecha} onChange={e => set('fecha_pago', e.target.value)} />
            </div>
          )}

          <div>
            <label className={lbl}>Notas internas</label>
            <textarea rows={2} className={`${inp} resize-none`} value={f.notas} onChange={e => set('notas', e.target.value)} />
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => onGuardar({ ...f, id: sueldo?.id, ambito })}
              className="flex-1 bg-pm-red hover:bg-pm-red-dark text-white font-black py-3 rounded-xl">
              Guardar
            </button>
            <button onClick={onClose} className="px-5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
