// ─────────────────────────────────────────────────────────────────────────────
// Constantes y tipos del CRM de empresa (Reservas)
// Independiente del CRM del Club Deportivo Origen.
// ─────────────────────────────────────────────────────────────────────────────

export type Origen = 'booking' | 'form' | 'order'

// ── Estados de reserva (8) ──────────────────────────────────────────────────────
export const ESTADOS_RESERVA = [
  { id: 'nueva',          label: 'Nueva solicitud',       badge: 'bg-pm-red-light text-pm-red',  dot: 'bg-pm-red' },
  { id: 'revision',       label: 'Pendiente de revisión', badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500' },
  { id: 'pago_pendiente', label: 'Pendiente de pago',     badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  { id: 'confirmada',     label: 'Confirmada',            badge: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  { id: 'en_curso',       label: 'En curso',              badge: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  { id: 'finalizada',     label: 'Finalizada',            badge: 'bg-green-100 text-green-700',   dot: 'bg-green-500' },
  { id: 'cancelada',      label: 'Cancelada',             badge: 'bg-gray-100 text-gray-500',     dot: 'bg-gray-400' },
  { id: 'espera',         label: 'Lista de espera',       badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
] as const

// ── Estados de pago (5) ─────────────────────────────────────────────────────────
export const ESTADOS_PAGO = [
  { id: 'pagado',    label: 'Pagado',       badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  { id: 'pendiente', label: 'Pendiente',    badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  { id: 'impagado',  label: 'Impagado',     badge: 'bg-red-100 text-red-700',     dot: 'bg-red-500' },
  { id: 'parcial',   label: 'Pago parcial', badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  { id: 'na',        label: 'No aplica',    badge: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-400' },
] as const

export const METODOS_PAGO = ['Transferencia', 'Tarjeta', 'Efectivo', 'Bizum']

export const labelReserva = (id: string) => ESTADOS_RESERVA.find(e => e.id === id)?.label ?? id
export const badgeReserva = (id: string) => ESTADOS_RESERVA.find(e => e.id === id)?.badge ?? 'bg-gray-100 text-gray-500'
export const labelPago = (id: string) => ESTADOS_PAGO.find(e => e.id === id)?.label ?? id
export const badgePago = (id: string) => ESTADOS_PAGO.find(e => e.id === id)?.dot ?? 'bg-gray-400'

// Estados que cuentan como "activos" (ni finalizada ni cancelada)
export const ESTADOS_ACTIVOS = ['nueva', 'revision', 'pago_pendiente', 'confirmada', 'en_curso', 'espera']
export const ESTADOS_PENDIENTES = ['nueva', 'revision', 'pago_pendiente']

// ── Categorías de servicio (para agrupar/filtrar y el dashboard) ─────────────────
export const CATEGORIAS = ['Cumpleaños', 'Campamentos', 'Eventos', 'Talleres', 'Educación', 'PIEA', 'Licitaciones', 'Colchonetas', 'Otros']

export type Pago = { fecha: string; importe: number; metodo: string; nota?: string }

export type Registro = {
  origen: Origen
  id: string
  numero: string
  servicio: string
  categoria: string
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string
  fecha_reserva: string        // created_at
  fecha_realizacion: string | null
  hora: string
  participantes: number | null
  total: number | null
  pagado: number | null
  estado_reserva: string
  estado_pago: string
  metodo_pago: string
  observaciones: string
  pagos: Pago[]
  mensaje: string
  datos: Record<string, unknown>
}

// ── Helpers ──────────────────────────────────────────────────────────────────────
export function eur(n: number | null | undefined): string {
  if (n == null || isNaN(Number(n))) return '—'
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(Number(n))
}

export function pendienteDe(r: { total: number | null; pagado: number | null }): number {
  const t = Number(r.total) || 0
  const p = Number(r.pagado) || 0
  return Math.max(0, t - p)
}

export function fechaCorta(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-ES')
}
