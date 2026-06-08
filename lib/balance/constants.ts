// ─────────────────────────────────────────────────────────────────────────────
// Balance Económico — tipos, estados, categorías por defecto y helpers.
// Archivo puro (sin imports de servidor) → usable en cliente y servidor.
// ─────────────────────────────────────────────────────────────────────────────

export type TipoMov = 'ingreso' | 'gasto'

// ── Estados ──────────────────────────────────────────────────────────────────
export const ESTADOS_INGRESO = [
  { id: 'pagado',      label: 'Pagado',      badge: 'bg-green-100 text-green-700' },
  { id: 'parcial',     label: 'Parcial',     badge: 'bg-blue-100 text-blue-700' },
  { id: 'pendiente',   label: 'Pendiente',   badge: 'bg-amber-100 text-amber-700' },
  { id: 'cancelado',   label: 'Cancelado',   badge: 'bg-gray-100 text-gray-500' },
  { id: 'reembolsado', label: 'Reembolsado', badge: 'bg-rose-100 text-rose-700' },
] as const

export const ESTADOS_GASTO = [
  { id: 'pagado',     label: 'Pagado',     badge: 'bg-green-100 text-green-700' },
  { id: 'pendiente',  label: 'Pendiente',  badge: 'bg-amber-100 text-amber-700' },
  { id: 'programado', label: 'Programado', badge: 'bg-blue-100 text-blue-700' },
  { id: 'cancelado',  label: 'Cancelado',  badge: 'bg-gray-100 text-gray-500' },
] as const

export const METODOS_PAGO = ['Transferencia', 'Tarjeta', 'Efectivo', 'Bizum', 'Domiciliación']

export const labelEstadoIngreso = (id: string) => ESTADOS_INGRESO.find(e => e.id === id)?.label ?? id
export const badgeEstadoIngreso = (id: string) => ESTADOS_INGRESO.find(e => e.id === id)?.badge ?? 'bg-gray-100 text-gray-500'
export const labelEstadoGasto = (id: string) => ESTADOS_GASTO.find(e => e.id === id)?.label ?? id
export const badgeEstadoGasto = (id: string) => ESTADOS_GASTO.find(e => e.id === id)?.badge ?? 'bg-gray-100 text-gray-500'

// Estados que cuentan como ingreso/gasto "real" (no cancelados/reembolsados)
export const INGRESO_CUENTA = ['pagado', 'parcial', 'pendiente']
export const GASTO_CUENTA   = ['pagado', 'pendiente', 'programado']

// ── Categorías de gasto por defecto (sincronizadas con la migración) ─────────
export type Categoria = { id: string; nombre: string; color: string; activa: boolean; orden: number }

// Estructura real de la empresa (Excel de tesorería 2026).
export const CATEGORIAS_GASTO_DEFAULT: Omit<Categoria, 'id'>[] = [
  { nombre: 'EQUIPO',                     color: 'rose',    activa: true, orden: 10 },
  { nombre: 'EQUIPO EXTERNO',             color: 'orange',  activa: true, orden: 20 },
  { nombre: 'INSTALACIONES',             color: 'slate',   activa: true, orden: 30 },
  { nombre: 'MARKETING',                 color: 'fuchsia', activa: true, orden: 40 },
  { nombre: 'SEGUROS',                   color: 'indigo',  activa: true, orden: 50 },
  { nombre: 'ACTIVIDAD',                 color: 'green',   activa: true, orden: 60 },
  { nombre: 'PATROCINIOS Y APORTACIONES', color: 'amber',  activa: true, orden: 70 },
  { nombre: 'OTROS GASTOS',              color: 'gray',    activa: true, orden: 80 },
]

// Subcategorías sugeridas por categoría (datalist en el formulario de gasto).
export const SUBCATEGORIAS_GASTO: Record<string, string[]> = {
  'EQUIPO': ['Sueldos / Nóminas', 'Seguridad Social', 'Pagos Metálico'],
  'EQUIPO EXTERNO': ['Equipo limpieza', 'Gestoría', 'Protección de datos', 'Prevención de riesgos laborales', 'Protección de incendios'],
  'INSTALACIONES': ['Alquiler / Hipoteca', 'Reformas / Mantenimiento / Decoración', 'Suministros (agua, luz, internet y higiene)', 'Impuestos (IBI, IVA, basuras, transmisiones...)', 'Material deportivo'],
  'MARKETING': ['Mantenimiento y actualización WEB', 'Pauta publicitaria', 'Papelería'],
  'SEGUROS': ['Seguro Responsabilidad Civil', 'Seguro Instalación', 'Seguro Hipotecario'],
  'ACTIVIDAD': ['Compras meriendas', 'Desplazamientos, gasolina/diesel', 'Dietas y celebraciones internas'],
  'PATROCINIOS Y APORTACIONES': [],
  'OTROS GASTOS': [],
}

// Paleta de colores (clase de fondo suave + texto + punto) por clave
export const COLOR_CAT: Record<string, { soft: string; text: string; dot: string; bar: string }> = {
  slate:   { soft: 'bg-slate-100',   text: 'text-slate-700',   dot: 'bg-slate-500',   bar: '#64748b' },
  amber:   { soft: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500',   bar: '#f59e0b' },
  sky:     { soft: 'bg-sky-100',     text: 'text-sky-700',     dot: 'bg-sky-500',     bar: '#0ea5e9' },
  rose:    { soft: 'bg-rose-100',    text: 'text-rose-700',    dot: 'bg-rose-500',    bar: '#f43f5e' },
  red:     { soft: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500',     bar: '#ef4444' },
  orange:  { soft: 'bg-orange-100',  text: 'text-orange-700',  dot: 'bg-orange-500',  bar: '#f97316' },
  green:   { soft: 'bg-green-100',   text: 'text-green-700',   dot: 'bg-green-500',   bar: '#22c55e' },
  teal:    { soft: 'bg-teal-100',    text: 'text-teal-700',    dot: 'bg-teal-500',    bar: '#14b8a6' },
  fuchsia: { soft: 'bg-fuchsia-100', text: 'text-fuchsia-700', dot: 'bg-fuchsia-500', bar: '#d946ef' },
  indigo:  { soft: 'bg-indigo-100',  text: 'text-indigo-700',  dot: 'bg-indigo-500',  bar: '#6366f1' },
  violet:  { soft: 'bg-violet-100',  text: 'text-violet-700',  dot: 'bg-violet-500',  bar: '#8b5cf6' },
  stone:   { soft: 'bg-stone-100',   text: 'text-stone-700',   dot: 'bg-stone-500',   bar: '#78716c' },
  cyan:    { soft: 'bg-cyan-100',    text: 'text-cyan-700',    dot: 'bg-cyan-500',    bar: '#06b6d4' },
  lime:    { soft: 'bg-lime-100',    text: 'text-lime-700',    dot: 'bg-lime-500',    bar: '#84cc16' },
  blue:    { soft: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500',    bar: '#3b82f6' },
  emerald: { soft: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', bar: '#10b981' },
  purple:  { soft: 'bg-purple-100',  text: 'text-purple-700',  dot: 'bg-purple-500',  bar: '#a855f7' },
  pink:    { soft: 'bg-pink-100',    text: 'text-pink-700',    dot: 'bg-pink-500',    bar: '#ec4899' },
  yellow:  { soft: 'bg-yellow-100',  text: 'text-yellow-700',  dot: 'bg-yellow-600',  bar: '#eab308' },
  gray:    { soft: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400',    bar: '#9ca3af' },
}
export const colorCat = (c: string) => COLOR_CAT[c] ?? COLOR_CAT.gray
export const COLORES_DISPONIBLES = Object.keys(COLOR_CAT)

// ── Movimientos (normalizados para la app) ───────────────────────────────────
export type IngresoMov = {
  id: string
  tipo: 'auto' | 'manual'
  origen: string           // booking | order | form | manual
  fecha: string            // YYYY-MM-DD
  cliente: string
  servicio: string
  categoria: string
  total: number
  pagado: number
  pendiente: number
  metodo: string
  estado: string           // pagado|parcial|pendiente|cancelado|reembolsado
  referencia: string
}

export type GastoMov = {
  id: string
  fecha: string            // YYYY-MM-DD
  concepto: string
  categoria: string
  subcategoria: string
  proveedor: string
  importe: number          // base
  iva: number | null       // %
  total: number            // importe + IVA
  metodo: string
  estado: string           // pagado|pendiente|programado|cancelado
  observaciones: string
  adjuntoUrl: string
  facturaRef: string
  createdBy?: string
  updatedAt?: string | null
  updatedBy?: string | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────
export function eur(n: number | null | undefined): string {
  if (n == null || isNaN(Number(n))) return '0 €'
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(Number(n))
}

export const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
export const MESES_LARGO = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

/** Año-mes (0-11) de una fecha ISO; null si inválida. */
export function ymd(fecha: string): { y: number; m: number } | null {
  if (!fecha) return null
  const d = new Date(fecha.length <= 10 ? fecha + 'T12:00:00' : fecha)
  if (isNaN(d.getTime())) return null
  return { y: d.getFullYear(), m: d.getMonth() }
}

/** Total con IVA de un gasto. */
export function gastoConIva(base: number, iva: number | null): number {
  return iva ? Math.round((base * (1 + iva / 100)) * 100) / 100 : base
}
