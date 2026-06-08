'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminRole } from '@/lib/admin/auth'
import {
  eur, MESES, MESES_LARGO, ymd, colorCat,
  ESTADOS_INGRESO, ESTADOS_GASTO, badgeEstadoIngreso, badgeEstadoGasto, labelEstadoIngreso, labelEstadoGasto,
  INGRESO_CUENTA, GASTO_CUENTA, METODOS_PAGO,
  type IngresoMov, type GastoMov, type Categoria,
} from '@/lib/balance/constants'
import { MonthlyBars, HBars } from './Charts'
import GastoModal from './GastoModal'
import IngresoModal from './IngresoModal'
import ImportarGastosModal from './ImportarGastosModal'
import { eliminarGasto, eliminarIngresoManual, crearCategoria, editarCategoria, toggleCategoria } from './actions'

type Tab = 'resumen' | 'ingresos' | 'gastos' | 'mensual' | 'anual' | 'categorias'
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'resumen', label: 'Resumen', icon: '📊' },
  { id: 'ingresos', label: 'Ingresos', icon: '📈' },
  { id: 'gastos', label: 'Gastos', icon: '📉' },
  { id: 'mensual', label: 'Mensual', icon: '🗓️' },
  { id: 'anual', label: 'Anual', icon: '📅' },
  { id: 'categorias', label: 'Categorías', icon: '🏷️' },
]

const sel = 'border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-pm-red'
const TODO = '__all__'

// ── Exportación ───────────────────────────────────────────────────────────────
function descargar(nombre: string, href: string) {
  const a = document.createElement('a'); a.href = href; a.download = nombre; document.body.appendChild(a); a.click(); a.remove()
}
async function exportar(formato: 'csv' | 'xlsx', nombre: string, headers: string[], rows: (string | number)[][]) {
  if (formato === 'csv') {
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n')
    descargar(nombre + '.csv', 'data:text/csv;charset=utf-8,﻿' + encodeURIComponent(csv))
  } else {
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Datos')
    XLSX.writeFile(wb, nombre + '.xlsx')
  }
}

function ExportMenu({ onExport }: { onExport: (f: 'csv' | 'xlsx' | 'pdf') => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-pm-navy hover:border-pm-red flex items-center gap-1.5">
        ⬇ Exportar
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 z-20 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden text-sm w-40">
            {([['xlsx', '📊 Excel (.xlsx)'], ['csv', '📄 CSV'], ['pdf', '🖨️ PDF / Imprimir']] as const).map(([f, l]) => (
              <button key={f} onClick={() => { setOpen(false); onExport(f) }} className="w-full text-left px-3 py-2 hover:bg-pm-bg font-medium text-pm-navy">{l}</button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function BalanceClient({ ingresos, gastos, categorias, setupOk, role }: {
  ingresos: IngresoMov[]
  gastos: GastoMov[]
  categorias: Categoria[]
  setupOk: boolean
  role: AdminRole
}) {
  const router = useRouter()
  const puedeEditar = role === 'principal' || role === 'gestor'
  const puedeGestionar = role === 'principal'

  const [tab, setTab] = useState<Tab>('resumen')
  const añoActual = new Date().getFullYear()

  // ── Años disponibles ──
  const años = useMemo(() => {
    const s = new Set<number>()
    ;[...ingresos, ...gastos].forEach(m => { const y = ymd(m.fecha)?.y; if (y) s.add(y) })
    s.add(añoActual)
    return Array.from(s).sort((a, b) => b - a)
  }, [ingresos, gastos, añoActual])

  // ── Filtros ──
  const [fAnio, setFAnio] = useState<number | typeof TODO>(años.includes(añoActual) ? añoActual : (años[0] ?? TODO))
  const [fMes, setFMes] = useState<number | typeof TODO>(TODO)
  const [fDesde, setFDesde] = useState('')
  const [fHasta, setFHasta] = useState('')
  const [fTipo, setFTipo] = useState<'all' | 'ingreso' | 'gasto'>('all')
  const [fCat, setFCat] = useState(TODO)
  const [fServicio, setFServicio] = useState(TODO)
  const [fEstado, setFEstado] = useState(TODO)
  const [fMetodo, setFMetodo] = useState(TODO)
  const [q, setQ] = useState('')

  const añoGrafico = fAnio === TODO ? añoActual : fAnio

  function pasaFecha(fecha: string): boolean {
    const ym = ymd(fecha)
    if (fAnio !== TODO) { if (!ym || ym.y !== fAnio) return false }
    if (fMes !== TODO) { if (!ym || ym.m !== fMes) return false }
    if (fDesde && fecha < fDesde) return false
    if (fHasta && fecha > fHasta) return false
    return true
  }

  const ingresosF = useMemo(() => ingresos.filter(i => {
    if (!pasaFecha(i.fecha)) return false
    if (fCat !== TODO && i.categoria !== fCat) return false
    if (fServicio !== TODO && i.servicio !== fServicio) return false
    if (fEstado !== TODO && i.estado !== fEstado) return false
    if (fMetodo !== TODO && i.metodo !== fMetodo) return false
    if (q && ![i.cliente, i.servicio, i.referencia].some(x => x.toLowerCase().includes(q.toLowerCase()))) return false
    return true
  }), [ingresos, fAnio, fMes, fDesde, fHasta, fCat, fServicio, fEstado, fMetodo, q]) // eslint-disable-line

  const gastosF = useMemo(() => gastos.filter(g => {
    if (!pasaFecha(g.fecha)) return false
    if (fCat !== TODO && g.categoria !== fCat) return false
    if (fEstado !== TODO && g.estado !== fEstado) return false
    if (fMetodo !== TODO && g.metodo !== fMetodo) return false
    if (q && ![g.concepto, g.proveedor, g.categoria, g.subcategoria].some(x => (x || '').toLowerCase().includes(q.toLowerCase()))) return false
    return true
  }), [gastos, fAnio, fMes, fDesde, fHasta, fCat, fEstado, fMetodo, q]) // eslint-disable-line

  // ── Totales ──
  const T = useMemo(() => {
    const ingCuenta = ingresosF.filter(i => INGRESO_CUENTA.includes(i.estado))
    const gasCuenta = gastosF.filter(g => GASTO_CUENTA.includes(g.estado))
    const ingresosTotal = ingCuenta.reduce((s, i) => s + i.total, 0)
    const ingresosCobrados = ingresosF.reduce((s, i) => s + i.pagado, 0)
    const ingresosPendientes = ingresosF.reduce((s, i) => s + i.pendiente, 0)
    const gastosTotal = gasCuenta.reduce((s, g) => s + g.total, 0)
    const gastosPagados = gastosF.filter(g => g.estado === 'pagado').reduce((s, g) => s + g.total, 0)
    const gastosPendientes = gastosF.filter(g => g.estado === 'pendiente' || g.estado === 'programado').reduce((s, g) => s + g.total, 0)
    return { ingresosTotal, ingresosCobrados, ingresosPendientes, gastosTotal, gastosPagados, gastosPendientes, beneficio: ingresosTotal - gastosTotal, caja: ingresosCobrados - gastosPagados }
  }, [ingresosF, gastosF])

  // ── Serie mensual del año elegido ──
  const serieMensual = useMemo(() => {
    const arr = MESES.map(() => ({ ingresos: 0, gastos: 0, beneficio: 0 }))
    ingresos.filter(i => INGRESO_CUENTA.includes(i.estado)).forEach(i => { const ym = ymd(i.fecha); if (ym && ym.y === añoGrafico) arr[ym.m].ingresos += i.total })
    gastos.filter(g => GASTO_CUENTA.includes(g.estado)).forEach(g => { const ym = ymd(g.fecha); if (ym && ym.y === añoGrafico) arr[ym.m].gastos += g.total })
    arr.forEach(a => a.beneficio = a.ingresos - a.gastos)
    return arr
  }, [ingresos, gastos, añoGrafico])

  // ── Serie anual ──
  const serieAnual = useMemo(() => {
    const map = new Map<number, { ingresos: number; gastos: number }>()
    ingresos.filter(i => INGRESO_CUENTA.includes(i.estado)).forEach(i => { const y = ymd(i.fecha)?.y; if (y) { const o = map.get(y) || { ingresos: 0, gastos: 0 }; o.ingresos += i.total; map.set(y, o) } })
    gastos.filter(g => GASTO_CUENTA.includes(g.estado)).forEach(g => { const y = ymd(g.fecha)?.y; if (y) { const o = map.get(y) || { ingresos: 0, gastos: 0 }; o.gastos += g.total; map.set(y, o) } })
    return Array.from(map.entries()).map(([y, v]) => ({ y, ...v, beneficio: v.ingresos - v.gastos })).sort((a, b) => b.y - a.y)
  }, [ingresos, gastos])

  // ── Por categoría (gasto) y por servicio (ingreso) ──
  const porCategoria = useMemo(() => {
    const map = new Map<string, number>()
    gastosF.filter(g => GASTO_CUENTA.includes(g.estado)).forEach(g => map.set(g.categoria, (map.get(g.categoria) || 0) + g.total))
    return Array.from(map.entries()).map(([label, valor]) => ({ label, valor, color: colorCat(categorias.find(c => c.nombre === label)?.color || 'gray').bar })).sort((a, b) => b.valor - a.valor)
  }, [gastosF, categorias])

  const porServicio = useMemo(() => {
    const map = new Map<string, number>()
    ingresosF.filter(i => INGRESO_CUENTA.includes(i.estado)).forEach(i => map.set(i.servicio, (map.get(i.servicio) || 0) + i.total))
    return Array.from(map.entries()).map(([label, valor]) => ({ label, valor, color: '#22c55e' })).sort((a, b) => b.valor - a.valor)
  }, [ingresosF])

  const servicios = useMemo(() => Array.from(new Set(ingresos.map(i => i.servicio))).sort(), [ingresos])

  // ── Modales / acciones ──
  const [modalGasto, setModalGasto] = useState<GastoMov | null | 'nuevo'>(null)
  const [modalIngreso, setModalIngreso] = useState<IngresoMov | null | 'nuevo'>(null)
  const [modalImport, setModalImport] = useState(false)
  const [, startDel] = useTransition()

  function refrescar() { router.refresh() }

  function borrarGasto(g: GastoMov) {
    if (!confirm(`¿Eliminar el gasto «${g.concepto}» (${eur(g.total)})?`)) return
    startDel(async () => { await eliminarGasto(g.id); refrescar() })
  }
  function borrarIngreso(i: IngresoMov) {
    if (i.tipo !== 'manual') { alert('Solo se pueden eliminar ingresos manuales. Los de reservas se gestionan desde Reservas/Pagos.'); return }
    if (!confirm(`¿Eliminar el ingreso «${i.servicio}» (${eur(i.total)})?`)) return
    startDel(async () => { await eliminarIngresoManual(i.id.replace(/^manual:/, '')); refrescar() })
  }

  // ── Exportaciones por pestaña ──
  function exportTabla(formato: 'csv' | 'xlsx' | 'pdf', cual: 'ingresos' | 'gastos' | 'mensual' | 'anual') {
    if (formato === 'pdf') { window.print(); return }
    const suf = fAnio === TODO ? 'todos' : String(fAnio)
    if (cual === 'ingresos') {
      exportar(formato, `ingresos_${suf}`, ['Fecha', 'Cliente', 'Servicio', 'Categoría', 'Total', 'Cobrado', 'Pendiente', 'Método', 'Estado', 'Referencia'],
        ingresosF.map(i => [i.fecha, i.cliente, i.servicio, i.categoria, i.total, i.pagado, i.pendiente, i.metodo, labelEstadoIngreso(i.estado), i.referencia]))
    } else if (cual === 'gastos') {
      exportar(formato, `gastos_${suf}`, ['Fecha', 'Concepto', 'Categoría', 'Subcategoría', 'Proveedor', 'Base', 'IVA %', 'Total', 'Método', 'Estado', 'Nº factura', 'Observaciones'],
        gastosF.map(g => [g.fecha, g.concepto, g.categoria, g.subcategoria, g.proveedor, g.importe, g.iva ?? '', g.total, g.metodo, labelEstadoGasto(g.estado), g.facturaRef, g.observaciones]))
    } else if (cual === 'mensual') {
      exportar(formato, `balance_mensual_${añoGrafico}`, ['Mes', 'Ingresos', 'Gastos', 'Beneficio'],
        serieMensual.map((s, i) => [MESES_LARGO[i], s.ingresos, s.gastos, s.beneficio]))
    } else {
      exportar(formato, `balance_anual`, ['Año', 'Ingresos', 'Gastos', 'Beneficio'], serieAnual.map(s => [s.y, s.ingresos, s.gastos, s.beneficio]))
    }
  }

  return (
    <div className="space-y-5">
      {!setupOk && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <div className="font-black mb-1">⚙️ Falta ejecutar la migración</div>
          <p className="text-amber-700 leading-relaxed">
            Ya se muestran los <strong>ingresos automáticos</strong> de tus reservas y pedidos. Para guardar <strong>gastos</strong>,
            ingresos manuales y categorías, ejecuta una vez{' '}
            <code className="bg-amber-100 px-1.5 py-0.5 rounded">supabase/migration_balance.sql</code> en el SQL Editor de Supabase.
          </p>
        </div>
      )}

      {/* ── PESTAÑAS ── */}
      <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${tab === t.id ? 'bg-pm-navy text-white' : 'text-gray-500 hover:bg-pm-bg'}`}>
            <span className="mr-1">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── FILTROS ── */}
      {tab !== 'categorias' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-wrap items-center gap-2">
          <select value={String(fAnio)} onChange={e => setFAnio(e.target.value === TODO ? TODO : Number(e.target.value))} className={sel}>
            <option value={TODO}>Todos los años</option>
            {años.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={String(fMes)} onChange={e => setFMes(e.target.value === TODO ? TODO : Number(e.target.value))} className={sel}>
            <option value={TODO}>Todo el año</option>
            {MESES_LARGO.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <input type="date" value={fDesde} onChange={e => setFDesde(e.target.value)} className={sel} title="Desde" />
          <input type="date" value={fHasta} onChange={e => setFHasta(e.target.value)} className={sel} title="Hasta" />
          <select value={fCat} onChange={e => setFCat(e.target.value)} className={sel}>
            <option value={TODO}>Toda categoría</option>
            {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
          </select>
          {(tab === 'ingresos' || tab === 'resumen') && (
            <select value={fServicio} onChange={e => setFServicio(e.target.value)} className={sel}>
              <option value={TODO}>Todo servicio</option>
              {servicios.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          <select value={fEstado} onChange={e => setFEstado(e.target.value)} className={sel}>
            <option value={TODO}>Todo estado</option>
            {(tab === 'gastos' ? ESTADOS_GASTO : ESTADOS_INGRESO).map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>
          <select value={fMetodo} onChange={e => setFMetodo(e.target.value)} className={sel}>
            <option value={TODO}>Todo método</option>
            {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <div className="relative flex-1 min-w-[160px]">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar cliente, proveedor, concepto…" className={`${sel} w-full pl-8`} />
            <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          {(fAnio !== (años.includes(añoActual) ? añoActual : (años[0] ?? TODO)) || fMes !== TODO || fDesde || fHasta || fCat !== TODO || fServicio !== TODO || fEstado !== TODO || fMetodo !== TODO || q) && (
            <button onClick={() => { setFAnio(años.includes(añoActual) ? añoActual : (años[0] ?? TODO)); setFMes(TODO); setFDesde(''); setFHasta(''); setFCat(TODO); setFServicio(TODO); setFEstado(TODO); setFMetodo(TODO); setQ('') }}
              className="text-xs font-bold text-pm-red hover:underline px-2">Limpiar</button>
          )}
        </div>
      )}

      {/* ════════════════ RESUMEN ════════════════ */}
      {tab === 'resumen' && (
        <div className="space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi label="Ingresos" valor={eur(T.ingresosTotal)} tono="green" sub={fAnio === TODO ? 'todos los años' : `año ${fAnio}`} />
            <Kpi label="Gastos" valor={eur(T.gastosTotal)} tono="red" />
            <Kpi label="Beneficio neto" valor={eur(T.beneficio)} tono={T.beneficio >= 0 ? 'navy' : 'red'} sub={`Caja: ${eur(T.caja)}`} />
            <Kpi label="Margen" valor={T.ingresosTotal ? `${Math.round((T.beneficio / T.ingresosTotal) * 100)}%` : '—'} tono="amber" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi label="Ingresos cobrados" valor={eur(T.ingresosCobrados)} tono="green" small />
            <Kpi label="Ingresos pendientes" valor={eur(T.ingresosPendientes)} tono="amber" small />
            <Kpi label="Gastos pagados" valor={eur(T.gastosPagados)} tono="navy" small />
            <Kpi label="Gastos pendientes" valor={eur(T.gastosPendientes)} tono="red" small />
          </div>

          {/* Gráfica mensual */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-pm-navy text-sm">Ingresos, gastos y beneficio · {añoGrafico}</h3>
            </div>
            <MonthlyBars serie={serieMensual} />
          </div>

          {/* Top servicios / categorías */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-black text-pm-navy text-sm mb-4">🏆 Servicios que más ingresan</h3>
              <HBars items={porServicio.slice(0, 8)} />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-black text-pm-navy text-sm mb-4">💸 Categorías con más gasto</h3>
              <HBars items={porCategoria.slice(0, 8)} />
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ INGRESOS ════════════════ */}
      {tab === 'ingresos' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100">
            <div className="text-sm text-gray-500"><strong className="text-pm-navy">{ingresosF.length}</strong> ingresos · {eur(T.ingresosTotal)} · cobrado {eur(T.ingresosCobrados)}</div>
            <div className="flex gap-2">
              {puedeEditar && <button onClick={() => setModalIngreso('nuevo')} className="bg-green-700 hover:bg-green-800 text-white text-sm font-bold px-3 py-2 rounded-xl">+ Ingreso manual</button>}
              <ExportMenu onExport={f => exportTabla(f, 'ingresos')} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pm-bg text-gray-500 text-xs">
                <tr>{['Fecha', 'Cliente', 'Servicio', 'Categoría', 'Total', 'Cobrado', 'Pendiente', 'Estado', 'Origen', ''].map(h => <th key={h} className="text-left px-3 py-2 font-bold whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ingresosF.slice(0, 400).map(i => (
                  <tr key={i.id} className="hover:bg-pm-bg/50">
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500">{i.fecha || '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap font-semibold text-pm-navy max-w-[160px] truncate">{i.cliente}</td>
                    <td className="px-3 py-2 whitespace-nowrap max-w-[180px] truncate">{i.servicio}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500">{i.categoria}</td>
                    <td className="px-3 py-2 whitespace-nowrap font-black text-pm-navy">{eur(i.total)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-green-600 font-semibold">{eur(i.pagado)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-amber-600">{i.pendiente > 0 ? eur(i.pendiente) : '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeEstadoIngreso(i.estado)}`}>{labelEstadoIngreso(i.estado)}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="text-xs text-gray-400">{i.tipo === 'manual' ? '✍️ Manual' : i.origen === 'order' ? '🛒 Pedido' : '📋 Reserva'}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      {i.tipo === 'manual' && puedeEditar && <button onClick={() => setModalIngreso(i)} className="text-xs text-pm-navy hover:text-pm-red font-bold mr-2">Editar</button>}
                      {i.tipo === 'manual' && puedeGestionar && <button onClick={() => borrarIngreso(i)} className="text-xs text-gray-300 hover:text-red-500">✕</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ingresosF.length === 0 && <p className="text-center text-gray-400 italic py-10 text-sm">Sin ingresos para los filtros seleccionados.</p>}
            {ingresosF.length > 400 && <p className="text-center text-xs text-gray-400 py-2">Mostrando 400 de {ingresosF.length}. Afina los filtros o exporta para ver todos.</p>}
          </div>
        </div>
      )}

      {/* ════════════════ GASTOS ════════════════ */}
      {tab === 'gastos' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100">
            <div className="text-sm text-gray-500"><strong className="text-pm-navy">{gastosF.length}</strong> gastos · {eur(T.gastosTotal)}</div>
            <div className="flex gap-2">
              {puedeEditar && <button onClick={() => setModalGasto('nuevo')} className="bg-pm-red hover:bg-pm-red-dark text-white text-sm font-bold px-3 py-2 rounded-xl">+ Nuevo gasto</button>}
              {puedeGestionar && <button onClick={() => setModalImport(true)} className="border border-gray-200 text-pm-navy text-sm font-bold px-3 py-2 rounded-xl hover:border-pm-red">⬆ Importar Excel</button>}
              <ExportMenu onExport={f => exportTabla(f, 'gastos')} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pm-bg text-gray-500 text-xs">
                <tr>{['Fecha', 'Concepto', 'Categoría', 'Proveedor', 'Base', 'IVA', 'Total', 'Estado', 'Método', ''].map(h => <th key={h} className="text-left px-3 py-2 font-bold whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {gastosF.slice(0, 400).map(g => {
                  const cc = colorCat(categorias.find(c => c.nombre === g.categoria)?.color || 'gray')
                  return (
                    <tr key={g.id} className="hover:bg-pm-bg/50">
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500">{g.fecha || '—'}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-semibold text-pm-navy max-w-[200px] truncate">{g.concepto}{g.facturaRef && <span className="text-gray-300 font-normal"> · {g.facturaRef}</span>}</td>
                      <td className="px-3 py-2 whitespace-nowrap"><span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${cc.soft} ${cc.text}`}><span className={`w-1.5 h-1.5 rounded-full ${cc.dot}`} />{g.categoria}</span></td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500 max-w-[140px] truncate">{g.proveedor || '—'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-600">{eur(g.importe)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-400 text-xs">{g.iva != null ? `${g.iva}%` : '—'}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-black text-pm-navy">{eur(g.total)}</td>
                      <td className="px-3 py-2 whitespace-nowrap"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeEstadoGasto(g.estado)}`}>{labelEstadoGasto(g.estado)}</span></td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500 text-xs">{g.metodo || '—'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        {g.adjuntoUrl && <a href={g.adjuntoUrl} target="_blank" rel="noopener noreferrer" className="text-xs mr-2" title="Ver justificante">📎</a>}
                        {puedeEditar && <button onClick={() => setModalGasto(g)} className="text-xs text-pm-navy hover:text-pm-red font-bold mr-2">Editar</button>}
                        {puedeGestionar && <button onClick={() => borrarGasto(g)} className="text-xs text-gray-300 hover:text-red-500">✕</button>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {gastosF.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 italic text-sm mb-3">Sin gastos para los filtros seleccionados.</p>
                {puedeEditar && <button onClick={() => setModalGasto('nuevo')} className="bg-pm-red text-white text-sm font-bold px-4 py-2 rounded-xl">+ Añadir el primer gasto</button>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ MENSUAL ════════════════ */}
      {tab === 'mensual' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <h3 className="font-black text-pm-navy text-sm">Balance mensual · {añoGrafico}</h3>
            <ExportMenu onExport={f => exportTabla(f, 'mensual')} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pm-bg text-gray-500 text-xs">
                <tr>{['Mes', 'Ingresos', 'Gastos', 'Beneficio', 'Acumulado'].map(h => <th key={h} className="text-left px-4 py-2 font-bold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(() => { let acc = 0; return serieMensual.map((s, i) => { acc += s.beneficio; return (
                  <tr key={i} className="hover:bg-pm-bg/50">
                    <td className="px-4 py-2 font-semibold text-pm-navy">{MESES_LARGO[i]}</td>
                    <td className="px-4 py-2 text-green-600 font-semibold">{eur(s.ingresos)}</td>
                    <td className="px-4 py-2 text-red-600">{eur(s.gastos)}</td>
                    <td className={`px-4 py-2 font-black ${s.beneficio >= 0 ? 'text-pm-navy' : 'text-red-600'}`}>{eur(s.beneficio)}</td>
                    <td className={`px-4 py-2 font-semibold ${acc >= 0 ? 'text-gray-600' : 'text-red-600'}`}>{eur(acc)}</td>
                  </tr>
                ) }) })()}
              </tbody>
              <tfoot>
                <tr className="bg-pm-navy text-white font-black">
                  <td className="px-4 py-2.5">Total {añoGrafico}</td>
                  <td className="px-4 py-2.5">{eur(serieMensual.reduce((s, m) => s + m.ingresos, 0))}</td>
                  <td className="px-4 py-2.5">{eur(serieMensual.reduce((s, m) => s + m.gastos, 0))}</td>
                  <td className="px-4 py-2.5" colSpan={2}>{eur(serieMensual.reduce((s, m) => s + m.beneficio, 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════ ANUAL ════════════════ */}
      {tab === 'anual' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <h3 className="font-black text-pm-navy text-sm">Balance anual</h3>
            <ExportMenu onExport={f => exportTabla(f, 'anual')} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pm-bg text-gray-500 text-xs">
                <tr>{['Año', 'Ingresos', 'Gastos', 'Beneficio', 'Margen'].map(h => <th key={h} className="text-left px-4 py-2 font-bold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {serieAnual.map(s => (
                  <tr key={s.y} className="hover:bg-pm-bg/50">
                    <td className="px-4 py-2 font-black text-pm-navy">{s.y}</td>
                    <td className="px-4 py-2 text-green-600 font-semibold">{eur(s.ingresos)}</td>
                    <td className="px-4 py-2 text-red-600">{eur(s.gastos)}</td>
                    <td className={`px-4 py-2 font-black ${s.beneficio >= 0 ? 'text-pm-navy' : 'text-red-600'}`}>{eur(s.beneficio)}</td>
                    <td className="px-4 py-2 text-gray-500">{s.ingresos ? `${Math.round((s.beneficio / s.ingresos) * 100)}%` : '—'}</td>
                  </tr>
                ))}
                {serieAnual.length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 italic py-10">Aún no hay datos económicos.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════ CATEGORÍAS ════════════════ */}
      {tab === 'categorias' && (
        <Categorias categorias={categorias} puedeGestionar={puedeGestionar} onChange={refrescar} />
      )}

      {/* ── MODALES ── */}
      {modalGasto !== null && (
        <GastoModal gasto={modalGasto === 'nuevo' ? null : modalGasto} categorias={categorias}
          onClose={() => setModalGasto(null)} onSaved={() => { setModalGasto(null); refrescar() }} />
      )}
      {modalIngreso !== null && (
        <IngresoModal ingreso={modalIngreso === 'nuevo' ? null : modalIngreso}
          onClose={() => setModalIngreso(null)} onSaved={() => { setModalIngreso(null); refrescar() }} />
      )}
      {modalImport && <ImportarGastosModal categorias={categorias} onClose={() => setModalImport(false)} />}
    </div>
  )
}

// ── KPI ──
function Kpi({ label, valor, sub, tono = 'navy', small }: { label: string; valor: string; sub?: string; tono?: 'navy' | 'red' | 'green' | 'amber'; small?: boolean }) {
  const c = { navy: 'text-pm-navy', red: 'text-pm-red', green: 'text-green-600', amber: 'text-amber-600' }[tono]
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`${small ? 'text-xl' : 'text-2xl lg:text-3xl'} font-black ${c}`}>{valor}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

// ── Gestión de categorías ──
function Categorias({ categorias, puedeGestionar, onChange }: { categorias: Categoria[]; puedeGestionar: boolean; onChange: () => void }) {
  const [nuevo, setNuevo] = useState('')
  const [color, setColor] = useState('blue')
  const [edit, setEdit] = useState<{ id: string; nombre: string; color: string } | null>(null)
  const [, start] = useTransition()
  const [error, setError] = useState('')

  function crear() {
    if (!nuevo.trim()) return
    setError('')
    start(async () => { const r = await crearCategoria({ nombre: nuevo.trim(), color }); if (!r.ok) { setError(r.error || 'Error'); return } setNuevo(''); onChange() })
  }
  function guardarEdit() {
    if (!edit) return
    start(async () => { await editarCategoria(edit.id, { nombre: edit.nombre, color: edit.color }); setEdit(null); onChange() })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 max-w-3xl">
      <div>
        <h3 className="font-black text-pm-navy text-sm mb-1">Categorías de gasto</h3>
        <p className="text-xs text-gray-400">Configura las categorías para clasificar y filtrar tus gastos.</p>
      </div>

      {puedeGestionar && (
        <div className="flex flex-wrap items-center gap-2 bg-pm-bg rounded-xl p-3">
          <input value={nuevo} onChange={e => setNuevo(e.target.value)} placeholder="Nueva categoría…" className={sel} />
          <select value={color} onChange={e => setColor(e.target.value)} className={sel}>
            {['blue', 'green', 'red', 'amber', 'violet', 'pink', 'cyan', 'orange', 'teal', 'indigo', 'slate', 'rose', 'sky', 'lime', 'emerald', 'purple', 'fuchsia', 'stone', 'yellow', 'gray'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={crear} className="bg-pm-navy text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-pm-navy-md">+ Añadir</button>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {categorias.map(c => {
          const cc = colorCat(c.color)
          const editing = edit?.id === c.id
          return (
            <div key={c.id} className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${c.activa ? 'border-gray-200' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
              {editing ? (
                <>
                  <input value={edit.nombre} onChange={e => setEdit({ ...edit, nombre: e.target.value })} className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                  <select value={edit.color} onChange={e => setEdit({ ...edit, color: e.target.value })} className="border border-gray-200 rounded-lg px-1 py-1 text-xs">
                    {['blue', 'green', 'red', 'amber', 'violet', 'pink', 'cyan', 'orange', 'teal', 'indigo', 'slate', 'gray', 'rose', 'sky', 'lime', 'emerald', 'purple', 'fuchsia', 'stone', 'yellow'].map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                  <button onClick={guardarEdit} className="text-xs font-bold text-green-600">Guardar</button>
                  <button onClick={() => setEdit(null)} className="text-xs text-gray-400">✕</button>
                </>
              ) : (
                <>
                  <span className={`w-2.5 h-2.5 rounded-full ${cc.dot}`} />
                  <span className="flex-1 text-sm font-semibold text-pm-navy">{c.nombre}</span>
                  {puedeGestionar && (
                    <>
                      <button onClick={() => setEdit({ id: c.id, nombre: c.nombre, color: c.color })} className="text-xs text-gray-400 hover:text-pm-navy font-bold">Editar</button>
                      <button onClick={() => start(async () => { await toggleCategoria(c.id, !c.activa); onChange() })} className="text-xs text-gray-400 hover:text-pm-red">{c.activa ? 'Desactivar' : 'Activar'}</button>
                    </>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
      {categorias.some(c => c.id.startsWith('def-')) && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3">⚠️ Estas son categorías por defecto. Ejecuta <code>migration_balance.sql</code> para poder editarlas y guardarlas.</p>
      )}
    </div>
  )
}
