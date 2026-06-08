'use client'

import { useState, useMemo, useTransition } from 'react'
import { ESTADOS_GASTO, eur, type Categoria } from '@/lib/balance/constants'
import { importarGastos, type GastoInput } from './actions'

const CAMPOS: { key: keyof GastoInput; label: string; alias: string[]; req?: boolean }[] = [
  { key: 'fecha', label: 'Fecha', alias: ['fecha', 'date', 'dia', 'día'], req: true },
  { key: 'concepto', label: 'Concepto', alias: ['concepto', 'descrip', 'detalle', 'gasto', 'nombre'], req: true },
  { key: 'importe', label: 'Importe', alias: ['importe', 'total', 'cantidad', 'coste', 'precio', 'base', 'euros', '€'], req: true },
  { key: 'categoria', label: 'Categoría', alias: ['categoria', 'categoría', 'tipo', 'partida'] },
  { key: 'subcategoria', label: 'Subcategoría', alias: ['subcategoria', 'subcategoría', 'subtipo'] },
  { key: 'proveedor', label: 'Proveedor', alias: ['proveedor', 'acreedor', 'empresa', 'comercio'] },
  { key: 'iva', label: 'IVA (%)', alias: ['iva', 'impuesto'] },
  { key: 'metodo_pago', label: 'Método de pago', alias: ['metodo', 'método', 'pago', 'forma'] },
  { key: 'estado', label: 'Estado', alias: ['estado', 'situacion', 'situación'] },
  { key: 'factura_ref', label: 'Nº factura', alias: ['factura', 'referencia', 'ref', 'num'] },
  { key: 'observaciones', label: 'Observaciones', alias: ['observ', 'notas', 'obs', 'comentario'] },
]

const SIN = '__none__'
const MESES_NORM = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const MESES_CORTO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
const autoMatch = (headers: string[], alias: string[]) => headers.find(x => alias.some(a => norm(x).includes(norm(a)))) ?? SIN

function toISODate(v: unknown): string {
  if (v == null || v === '') return ''
  if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString().slice(0, 10)
  if (typeof v === 'number' && v > 20000 && v < 80000) {
    const d = new Date(Math.round((v - 25569) * 86400 * 1000))
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
  }
  const s = String(v).trim()
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
  m = s.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})/)
  if (m) { const yyyy = m[3].length === 2 ? '20' + m[3] : m[3]; return `${yyyy}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` }
  const d = new Date(s)
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}
function toNum(v: unknown): number {
  if (typeof v === 'number') return isNaN(v) ? 0 : v
  let s = String(v ?? '').replace(/[€\s]/g, '').replace(/[^\d.,-]/g, '')
  if (!s) return 0
  if (s.includes('.') && s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  else if (s.includes(',')) s = s.replace(',', '.')
  const n = Number(s); return isNaN(n) ? 0 : n
}
function normEstadoGasto(v: unknown): string {
  const s = norm(String(v ?? ''))
  if (!s) return 'pagado'
  if (s.includes('pag')) return 'pagado'
  if (s.includes('pend')) return 'pendiente'
  if (s.includes('program')) return 'programado'
  if (s.includes('cancel') || s.includes('anul')) return 'cancelado'
  return 'pagado'
}

type Crudo = Record<string, unknown>
type MatrizRaw = { mes: number; categoria: string; sub: string; importe: number }

// ── Parser de plantilla mensual (matriz: categorías en filas, meses en columnas) ──
function parseMatriz(aoa: unknown[][]): { año: number; raw: MatrizRaw[]; cats: string[] } {
  // Año
  let año = new Date().getFullYear()
  for (let i = 0; i < 6 && i < aoa.length; i++) {
    for (const c of (aoa[i] || [])) { const m = String(c ?? '').match(/(20\d{2})/); if (m) { año = Number(m[1]); break } }
  }
  // Columnas de meses
  let headerRow = -1; const monthCol: Record<number, number> = {}
  for (let i = 0; i < 10 && i < aoa.length; i++) {
    const row = aoa[i] || []; const found: Record<number, number> = {}
    row.forEach((c, j) => { const k = MESES_NORM.indexOf(norm(String(c ?? ''))); if (k >= 0) found[k] = j })
    if (Object.keys(found).length >= 3) { headerRow = i; Object.assign(monthCol, found); break }
  }
  if (headerRow < 0) throw new Error('No se encontró una fila con nombres de meses (Enero, Febrero…).')
  const monthCols = Object.entries(monthCol).map(([m, col]) => ({ m: Number(m), col }))
  const firstMonthCol = Math.min(...monthCols.map(x => x.col))
  // Columna de etiquetas: la de más texto antes del primer mes
  let labelCol = 0, best = -1
  for (let j = 0; j < firstMonthCol; j++) {
    let cnt = 0
    for (let i = headerRow + 1; i < aoa.length; i++) { const v = String(aoa[i]?.[j] ?? '').trim(); if (v && isNaN(Number(v.replace(/[€,.\s]/g, '')))) cnt++ }
    if (cnt > best) { best = cnt; labelCol = j }
  }
  // Recorrer filas
  let main: string | null = null; let mainVals: Record<number, number> = {}
  const cats: Record<string, true> = {}; const raw: MatrizRaw[] = []
  const flush = () => { if (main && !raw.some(r => r.categoria === main)) { for (const { m } of monthCols) { const v = mainVals[m] || 0; if (v > 0) raw.push({ mes: m + 1, categoria: main!, sub: '', importe: v }) } } }
  for (let i = headerRow + 1; i < aoa.length; i++) {
    const row = aoa[i] || []; const label = String(row[labelCol] ?? '').trim()
    if (!label) continue
    if (/^total/i.test(label)) { flush(); main = null; continue }
    if (label.startsWith('-')) {
      const sub = label.replace(/^[-\s]+/, '').replace(/\s+/g, ' ').trim()
      if (main) { for (const { m, col } of monthCols) { const v = toNum(row[col]); if (v > 0) raw.push({ mes: m + 1, categoria: main, sub, importe: v }) } }
    } else {
      flush()
      main = label.replace(/\s+/g, ' ').trim(); cats[main] = true; mainVals = {}
      for (const { m, col } of monthCols) mainVals[m] = toNum(row[col])
    }
  }
  flush()
  if (raw.length === 0) throw new Error('No se detectaron importes. Revisa que la plantilla tenga categorías en filas y meses en columnas.')
  return { año, raw, cats: Object.keys(cats) }
}

export default function ImportarGastosModal({ categorias, onClose }: { categorias: Categoria[]; onClose: () => void }) {
  const [modo, setModo] = useState<'matriz' | 'lista'>('matriz')
  const [paso, setPaso] = useState<'subir' | 'mapear' | 'matriz' | 'fin'>('subir')
  const [headers, setHeaders] = useState<string[]>([])
  const [datos, setDatos] = useState<Crudo[]>([])
  const [nombreArchivo, setNombreArchivo] = useState('')
  const [map, setMap] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState<{ importadas: number; saltadas: number } | null>(null)
  const [pending, startTransition] = useTransition()

  // Estado del modo matriz
  const [matrizRaw, setMatrizRaw] = useState<MatrizRaw[]>([])
  const [matrizCats, setMatrizCats] = useState<string[]>([])
  const [añoMatriz, setAñoMatriz] = useState(new Date().getFullYear())

  const catLookup = useMemo(() => { const m = new Map<string, string>(); categorias.forEach(c => m.set(norm(c.nombre), c.nombre)); return m }, [categorias])
  function resolverCategoria(raw: string): string {
    const n = norm(raw)
    if (!n) return 'Otros gastos'
    if (catLookup.has(n)) return catLookup.get(n)!
    for (const [k, v] of catLookup) { if (k.includes(n) || n.includes(k)) return v }
    return raw.trim()
  }

  async function leerAOA(file: File): Promise<unknown[][]> {
    const XLSX = await import('xlsx')
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array', cellDates: false, raw: true })
    const ws = wb.Sheets[wb.SheetNames[0]]
    return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true, blankrows: false }) as unknown[][]
  }

  async function onFile(file: File) {
    setError('')
    setNombreArchivo(file.name)
    try {
      if (modo === 'matriz') {
        const aoa = await leerAOA(file)
        const { año, raw, cats } = parseMatriz(aoa)
        setMatrizRaw(raw); setMatrizCats(cats); setAñoMatriz(año); setPaso('matriz')
      } else {
        const XLSX = await import('xlsx')
        const buf = await file.arrayBuffer()
        const wb = XLSX.read(buf, { type: 'array', cellDates: false, raw: true })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Crudo>(ws, { defval: '', raw: true })
        if (json.length === 0) { setError('El archivo no tiene filas de datos.'); return }
        const hs = Object.keys(json[0])
        setHeaders(hs); setDatos(json)
        const m: Record<string, string> = {}; CAMPOS.forEach(c => { m[c.key as string] = autoMatch(hs, c.alias) }); setMap(m)
        setPaso('mapear')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo leer el archivo. Asegúrate de que es un .csv o .xlsx válido.')
    }
  }

  // ── Filas (modo lista) ──
  const filasLista = useMemo<{ row: GastoInput; valida: boolean; motivo?: string }[]>(() => {
    const val = (row: Crudo, col: string) => (col && col !== SIN ? row[col] : '')
    return datos.map(row => {
      const fecha = toISODate(val(row, map.fecha))
      const concepto = String(val(row, map.concepto) ?? '').trim()
      const importe = toNum(val(row, map.importe))
      const r: GastoInput = {
        fecha, concepto, importe,
        categoria: resolverCategoria(String(val(row, map.categoria) ?? '')),
        subcategoria: String(val(row, map.subcategoria) ?? '').trim(),
        proveedor: String(val(row, map.proveedor) ?? '').trim(),
        iva: map.iva && map.iva !== SIN && val(row, map.iva) !== '' ? toNum(val(row, map.iva)) : null,
        metodo_pago: String(val(row, map.metodo_pago) ?? '').trim(),
        estado: map.estado && map.estado !== SIN ? normEstadoGasto(val(row, map.estado)) : 'pagado',
        factura_ref: String(val(row, map.factura_ref) ?? '').trim(),
        observaciones: String(val(row, map.observaciones) ?? '').trim(),
      }
      let motivo = ''
      if (!fecha) motivo = 'Sin fecha válida'
      else if (!concepto) motivo = 'Sin concepto'
      else if (!(importe > 0)) motivo = 'Importe no válido'
      return { row: r, valida: !motivo, motivo }
    })
  }, [datos, map]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filas (modo matriz) — dependen del año elegido ──
  const filasMatriz = useMemo<GastoInput[]>(() => matrizRaw.map(r => ({
    fecha: `${añoMatriz}-${String(r.mes).padStart(2, '0')}-01`,
    concepto: r.sub || r.categoria,
    categoria: resolverCategoria(r.categoria),
    subcategoria: r.sub,
    importe: r.importe,
    iva: null, metodo_pago: '', estado: 'pagado', factura_ref: '', observaciones: '',
  })), [matrizRaw, añoMatriz]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalesMes = useMemo(() => {
    const t = Array(12).fill(0)
    filasMatriz.forEach(f => { const m = Number(f.fecha.slice(5, 7)) - 1; if (m >= 0 && m < 12) t[m] += f.importe })
    return t
  }, [filasMatriz])

  const validasLista = filasLista.filter(f => f.valida)
  const invalidasLista = filasLista.filter(f => !f.valida)

  function importar(rows: GastoInput[]) {
    setError('')
    startTransition(async () => {
      const r = await importarGastos(rows)
      if (!r.ok) { setError(r.error || 'No se pudo importar'); return }
      setResultado({ importadas: r.importadas ?? 0, saltadas: r.saltadas ?? 0 })
      setPaso('fin')
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="bg-pm-navy text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="font-black">Importar gastos (CSV / Excel)</div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700">{error}</div>}

          {/* PASO 1 — Subir + elegir modo */}
          {paso === 'subir' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={() => setModo('matriz')} className={`text-left border-2 rounded-2xl p-4 transition-all ${modo === 'matriz' ? 'border-pm-red bg-pm-red-light' : 'border-gray-200 hover:border-pm-red/40'}`}>
                  <div className="text-2xl mb-1">🗂️</div>
                  <div className="font-black text-pm-navy text-sm">Plantilla mensual (matriz)</div>
                  <div className="text-xs text-gray-500 mt-1">Tu Excel de tesorería: categorías en filas y meses en columnas. Se reparte solo por mes.</div>
                </button>
                <button onClick={() => setModo('lista')} className={`text-left border-2 rounded-2xl p-4 transition-all ${modo === 'lista' ? 'border-pm-red bg-pm-red-light' : 'border-gray-200 hover:border-pm-red/40'}`}>
                  <div className="text-2xl mb-1">📋</div>
                  <div className="font-black text-pm-navy text-sm">Lista de movimientos</div>
                  <div className="text-xs text-gray-500 mt-1">Una fila por gasto (Fecha · Concepto · Importe…). Mapeas las columnas.</div>
                </button>
              </div>

              <label className="block border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-pm-red transition-colors">
                <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
                <div className="text-4xl mb-2">📄</div>
                <div className="font-bold text-pm-navy">Haz clic para elegir un archivo</div>
                <div className="text-xs text-gray-400 mt-1">Modo seleccionado: <strong>{modo === 'matriz' ? 'Plantilla mensual (matriz)' : 'Lista de movimientos'}</strong></div>
              </label>
              {modo === 'matriz'
                ? <div className="bg-pm-bg rounded-xl p-3 text-xs text-gray-500">💡 Detecta automáticamente el año, los meses y las categorías. Las subcategorías van con guion (« - Gestoría»). Se evitan duplicados.</div>
                : <div className="bg-pm-bg rounded-xl p-3 text-xs text-gray-500">💡 Columnas recomendadas: Fecha · Concepto · Categoría · Proveedor · Importe · IVA · Método · Estado.</div>}
            </div>
          )}

          {/* PASO 2A — Mapear (modo lista) */}
          {paso === 'mapear' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-gray-600"><strong>{datos.length}</strong> filas leídas de <strong>{nombreArchivo}</strong></div>
                <button onClick={() => { setPaso('subir'); setError('') }} className="text-xs text-pm-red font-semibold hover:underline">Cambiar archivo</button>
              </div>
              <div>
                <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Asignar columnas</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CAMPOS.map(c => (
                    <div key={c.key as string} className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 w-32 shrink-0">{c.label}{c.req && ' *'}</label>
                      <select value={map[c.key as string] ?? SIN} onChange={e => setMap(m => ({ ...m, [c.key as string]: e.target.value }))}
                        className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-pm-red">
                        <option value={SIN}>— No importar —</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">
                  Previsualización · <span className="text-green-600">{validasLista.length} válidas</span>
                  {invalidasLista.length > 0 && <span className="text-red-600"> · {invalidasLista.length} con errores</span>}
                </div>
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-xs">
                    <thead className="bg-pm-bg text-gray-500"><tr>{['Fecha', 'Concepto', 'Categoría', 'Proveedor', 'Importe', 'Estado', ''].map(h => <th key={h} className="text-left px-2 py-1.5 font-bold whitespace-nowrap">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {filasLista.slice(0, 8).map((f, i) => (
                        <tr key={i} className={f.valida ? '' : 'bg-red-50/50'}>
                          <td className="px-2 py-1.5 whitespace-nowrap">{f.row.fecha || '—'}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap max-w-[160px] truncate">{f.row.concepto || '—'}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{f.row.categoria}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{f.row.proveedor || '—'}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap font-semibold">{eur(f.row.importe)}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{ESTADOS_GASTO.find(e => e.id === f.row.estado)?.label}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{f.valida ? <span className="text-green-600">✓</span> : <span className="text-red-500" title={f.motivo}>⚠ {f.motivo}</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {datos.length > 8 && <p className="text-[11px] text-gray-400 mt-1">…y {datos.length - 8} filas más.</p>}
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button onClick={onClose} className="text-sm font-semibold text-gray-500 px-4 py-2.5">Cancelar</button>
                <button onClick={() => importar(validasLista.map(v => v.row))} disabled={pending || validasLista.length === 0}
                  className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-xl transition-colors">
                  {pending ? 'Importando…' : `Importar ${validasLista.length} gastos`}
                </button>
              </div>
            </div>
          )}

          {/* PASO 2B — Previsualización (modo matriz) */}
          {paso === 'matriz' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-gray-600"><strong>{matrizRaw.length}</strong> apuntes detectados en <strong>{nombreArchivo}</strong></div>
                <button onClick={() => { setPaso('subir'); setError('') }} className="text-xs text-pm-red font-semibold hover:underline">Cambiar archivo</button>
              </div>

              <div className="flex items-center gap-3 bg-pm-bg rounded-xl p-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Año del balance</label>
                <input type="number" value={añoMatriz} onChange={e => setAñoMatriz(Number(e.target.value) || new Date().getFullYear())} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-28 bg-white focus:outline-none focus:border-pm-red" />
                <span className="text-xs text-gray-400">Cada apunte se fechará el día 1 de su mes.</span>
              </div>

              <div>
                <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Categorías detectadas ({matrizCats.length})</div>
                <div className="flex flex-wrap gap-1.5">
                  {matrizCats.map(c => <span key={c} className="text-xs font-semibold bg-pm-navy/5 text-pm-navy px-2.5 py-1 rounded-full">{c}</span>)}
                </div>
              </div>

              <div>
                <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Total por mes ({añoMatriz})</div>
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-xs">
                    <thead className="bg-pm-bg text-gray-500"><tr>{MESES_CORTO.map(m => <th key={m} className="px-2 py-1.5 font-bold text-center">{m}</th>)}</tr></thead>
                    <tbody>
                      <tr>{totalesMes.map((t, i) => <td key={i} className={`px-2 py-2 text-center whitespace-nowrap ${t > 0 ? 'font-semibold text-pm-navy' : 'text-gray-300'}`}>{t > 0 ? eur(t) : '—'}</td>)}</tr>
                    </tbody>
                  </table>
                </div>
                <div className="text-right text-xs text-gray-500 mt-1">Total año: <strong className="text-pm-navy">{eur(totalesMes.reduce((a, b) => a + b, 0))}</strong></div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                ℹ️ Se crearán <strong>{filasMatriz.length} gastos</strong> (uno por categoría/subcategoría y mes con importe). Los duplicados ya existentes se omiten automáticamente.
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button onClick={onClose} className="text-sm font-semibold text-gray-500 px-4 py-2.5">Cancelar</button>
                <button onClick={() => importar(filasMatriz)} disabled={pending || filasMatriz.length === 0}
                  className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-xl transition-colors">
                  {pending ? 'Importando…' : `Importar ${filasMatriz.length} gastos`}
                </button>
              </div>
            </div>
          )}

          {/* PASO 3 — Fin */}
          {paso === 'fin' && resultado && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
              </div>
              <h3 className="text-xl font-black text-pm-navy mb-1">¡Importación completada!</h3>
              <p className="text-gray-500 text-sm">Se han añadido <strong className="text-pm-navy">{resultado.importadas}</strong> gastos
                {resultado.saltadas > 0 && <> · {resultado.saltadas} saltados (duplicados o sin datos)</>}.</p>
              <button onClick={() => window.location.reload()} className="mt-6 bg-pm-navy text-white font-bold px-6 py-3 rounded-xl">Ver el balance actualizado</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
