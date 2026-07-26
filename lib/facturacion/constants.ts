// ─────────────────────────────────────────────────────────────────────────────
// Facturación · constantes y etiquetas puras (servidor + cliente).
// ─────────────────────────────────────────────────────────────────────────────

export type TipoDocumento = 'factura' | 'proforma'

/** Tipos de IVA habituales + los casos sin cuota. El % real se guarda por línea. */
export const IVA_TIPOS = [
  { id: 'normal', pct: 21, label: 'IVA 21 %' },
  { id: 'normal', pct: 10, label: 'IVA 10 %' },
  { id: 'normal', pct: 4, label: 'IVA 4 %' },
  { id: 'normal', pct: 0, label: 'IVA 0 %' },
  { id: 'exento', pct: 0, label: 'Exento' },
  { id: 'no_sujeto', pct: 0, label: 'No sujeto' },
] as const

export const IVA_PCTS = [21, 10, 4, 0] as const

export const TIPOS_CLIENTE = [
  { id: 'empresa', label: 'Empresa' },
  { id: 'autonomo', label: 'Autónomo' },
  { id: 'particular', label: 'Particular' },
  { id: 'administracion', label: 'Administración pública' },
  { id: 'otro', label: 'Otro' },
] as const

export const FORMAS_PAGO = [
  'Transferencia', 'Bizum', 'Efectivo', 'Tarjeta', 'Domiciliación', 'PayPal', 'Otra',
] as const

export const MONEDAS = ['EUR'] as const

// ── Estados ────────────────────────────────────────────────────────────────
// Facturas y proformas comparten tabla pero tienen su propio juego de estados.

export const ESTADOS_FACTURA = [
  { id: 'borrador', label: 'Borrador', dot: 'bg-gray-300', badge: 'bg-gray-100 text-gray-600' },
  { id: 'emitida', label: 'Emitida', dot: 'bg-blue-400', badge: 'bg-blue-50 text-blue-700' },
  { id: 'enviada', label: 'Enviada', dot: 'bg-indigo-400', badge: 'bg-indigo-50 text-indigo-700' },
  { id: 'parcial', label: 'Parcialmente pagada', dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700' },
  { id: 'pagada', label: 'Pagada', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
  { id: 'vencida', label: 'Vencida', dot: 'bg-red-500', badge: 'bg-red-50 text-red-700' },
  { id: 'rectificada', label: 'Rectificada', dot: 'bg-purple-400', badge: 'bg-purple-50 text-purple-700' },
  { id: 'anulada', label: 'Anulada', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-500 line-through' },
] as const

export const ESTADOS_PROFORMA = [
  { id: 'borrador', label: 'Borrador', dot: 'bg-gray-300', badge: 'bg-gray-100 text-gray-600' },
  { id: 'enviada', label: 'Enviada', dot: 'bg-indigo-400', badge: 'bg-indigo-50 text-indigo-700' },
  { id: 'aceptada', label: 'Aceptada', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
  { id: 'rechazada', label: 'Rechazada', dot: 'bg-red-500', badge: 'bg-red-50 text-red-700' },
  { id: 'caducada', label: 'Caducada', dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700' },
  { id: 'convertida', label: 'Convertida en factura', dot: 'bg-blue-400', badge: 'bg-blue-50 text-blue-700' },
] as const

/** Estados que YA no son borrador: no se borran físicamente ni se renumeran. */
export const ESTADOS_EMITIDOS = ['emitida', 'enviada', 'parcial', 'pagada', 'vencida', 'rectificada']

export function estadosDe(tipo: TipoDocumento) {
  return tipo === 'proforma' ? ESTADOS_PROFORMA : ESTADOS_FACTURA
}

export function estadoMeta(tipo: TipoDocumento, id: string) {
  return estadosDe(tipo).find(e => e.id === id) ?? estadosDe(tipo)[0]
}

// ── Series / numeración (vista previa; el número real lo asigna la BD) ─────

/** Vista previa del número: 'PM' + año + correlativo. */
export function numeroPreview(prefijo: string, ejercicio: number, proximo: number): string {
  return `${prefijo}-${ejercicio}-${String(proximo).padStart(4, '0')}`
}

export const TEXTO_PROFORMA = 'FACTURA PROFORMA'
export const AVISO_PROFORMA = 'Este documento no constituye una factura a efectos fiscales.'

/** Fecha ISO (yyyy-mm-dd) → "12 mar 2026". '' si vacía. */
export function fechaCorta(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso.slice(0, 10) + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
