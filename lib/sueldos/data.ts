import { createAdminClient } from '@/lib/supabase/admin'

// ─────────────────────────────────────────────────────────────────────────────
// Sueldos de los monitores. Cada línea es un trabajo que se le paga (una clase,
// un cumpleaños, un taller, la nómina del mes…) con su bruto, su neto, cómo se
// le paga y si ya está pagado. Requiere migration_sueldos.sql.
// ─────────────────────────────────────────────────────────────────────────────

export type MetodoSueldo = 'efectivo' | 'nomina' | 'transferencia'
export type EstadoSueldo = 'pendiente' | 'pagado'

export type Sueldo = {
  id: string
  monitor_id: string
  monitorNombre: string
  ambito: 'empresa' | 'club'
  fecha: string            // YYYY-MM-DD
  concepto: string
  detalle: string
  bruto: number
  neto: number
  metodo: MetodoSueldo
  estado: EstadoSueldo
  fecha_pago: string
  horas: number | null
  notas: string
}

export const METODOS: { id: MetodoSueldo; label: string; badge: string }[] = [
  { id: 'efectivo', label: 'Efectivo', badge: 'bg-amber-100 text-amber-700' },
  { id: 'nomina', label: 'Nómina', badge: 'bg-blue-100 text-blue-700' },
  { id: 'transferencia', label: 'Transferencia', badge: 'bg-purple-100 text-purple-700' },
]

export const ESTADOS: { id: EstadoSueldo; label: string; badge: string }[] = [
  { id: 'pendiente', label: 'Pendiente', badge: 'bg-red-100 text-red-700' },
  { id: 'pagado', label: 'Pagado', badge: 'bg-green-100 text-green-700' },
]

/** Conceptos habituales (se puede escribir cualquier otro). */
export const CONCEPTOS = [
  'Clases del club', 'Cumpleaños', 'Taller', 'Evento', 'Campamento',
  'Días Sin Cole', 'Domingos en Familia', 'Extraescolares', 'Nómina', 'Otros',
]

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))
const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }

type Row = Record<string, unknown>

/** true si la tabla existe (migración ejecutada). */
export async function sueldosListos(): Promise<boolean> {
  try {
    const db = createAdminClient()
    const { error } = await db.from('sueldos').select('id').limit(1)
    return !error
  } catch { return false }
}

/** Todos los sueldos, con el nombre del monitor resuelto. Más recientes primero. */
export async function getSueldos(monitorId?: string): Promise<Sueldo[]> {
  try {
    const db = createAdminClient()
    let q = db.from('sueldos').select('*').order('fecha', { ascending: false }).limit(5000)
    if (monitorId) q = q.eq('monitor_id', monitorId)
    const [{ data }, mons] = await Promise.all([
      q,
      db.from('monitores').select('id, nombre, apellidos'),
    ])
    const nombres = new Map(((mons.data ?? []) as Row[]).map(m =>
      [str(m.id), `${str(m.nombre)} ${str(m.apellidos)}`.trim()]))

    return ((data ?? []) as Row[]).map(s => ({
      id: str(s.id),
      monitor_id: str(s.monitor_id),
      monitorNombre: nombres.get(str(s.monitor_id)) || 'Sin monitor',
      ambito: (str(s.ambito) === 'club' ? 'club' : 'empresa') as Sueldo['ambito'],
      fecha: str(s.fecha).slice(0, 10),
      concepto: str(s.concepto),
      detalle: str(s.detalle),
      bruto: num(s.bruto),
      neto: num(s.neto),
      metodo: (METODOS.find(m => m.id === str(s.metodo))?.id ?? 'efectivo') as MetodoSueldo,
      estado: (str(s.estado) === 'pagado' ? 'pagado' : 'pendiente') as EstadoSueldo,
      fecha_pago: str(s.fecha_pago).slice(0, 10),
      horas: s.horas == null ? null : num(s.horas),
      notas: str(s.notas),
    }))
  } catch { return [] }
}

export type TotalesSueldos = {
  bruto: number
  neto: number
  pagado: number
  pendiente: number
  efectivo: number
  nomina: number
  transferencia: number
  lineas: number
}

/** Suma de una lista de sueldos (el neto es lo que se entrega de verdad). */
export function totales(lista: Sueldo[]): TotalesSueldos {
  const t: TotalesSueldos = { bruto: 0, neto: 0, pagado: 0, pendiente: 0, efectivo: 0, nomina: 0, transferencia: 0, lineas: lista.length }
  for (const s of lista) {
    t.bruto += s.bruto
    t.neto += s.neto
    if (s.estado === 'pagado') t.pagado += s.neto
    else t.pendiente += s.neto
    t[s.metodo] += s.neto
  }
  return t
}

/** Agrupa por monitor, para ver de un vistazo cuánto se le debe a cada uno. */
export function porMonitor(lista: Sueldo[]): { monitor_id: string; nombre: string; t: TotalesSueldos }[] {
  const mapa = new Map<string, Sueldo[]>()
  for (const s of lista) {
    const a = mapa.get(s.monitor_id) ?? []
    a.push(s)
    mapa.set(s.monitor_id, a)
  }
  return [...mapa.entries()]
    .map(([monitor_id, ss]) => ({ monitor_id, nombre: ss[0].monitorNombre, t: totales(ss) }))
    .sort((a, b) => b.t.pendiente - a.t.pendiente || a.nombre.localeCompare(b.nombre, 'es'))
}
