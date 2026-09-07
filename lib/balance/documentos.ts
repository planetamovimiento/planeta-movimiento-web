import { createAdminClient } from '@/lib/supabase/admin'

// ─────────────────────────────────────────────────────────────────────────────
// Facturas y justificantes del Balance Económico.
//
// Cada documento (PDF, foto o ticket) se guarda en el bucket PRIVADO "facturas"
// y su ficha vive en la tabla `facturas`. Hasta que no se CONFIRMA no toca el
// balance: al confirmar se crea su movimiento (gasto o ingreso manual) y queda
// enlazado, para que una factura no se contabilice dos veces.
//
// Fase 1: los datos se revisan a mano. El hueco de la lectura automática está
// preparado en la columna `extraido` (datos + confianza por campo).
// ─────────────────────────────────────────────────────────────────────────────

export const BUCKET_FACTURAS = 'facturas'

export type Ambito = 'empresa' | 'club'
export type TipoDoc = 'gasto' | 'ingreso'

export const ESTADOS_DOC = [
  { id: 'procesando', label: 'Procesando',           badge: 'bg-blue-100 text-blue-700' },
  { id: 'revision',   label: 'Pendiente de revisión', badge: 'bg-amber-100 text-amber-700' },
  { id: 'confirmada', label: 'Confirmada',            badge: 'bg-green-100 text-green-700' },
  { id: 'duplicada',  label: 'Duplicada',             badge: 'bg-fuchsia-100 text-fuchsia-700' },
  { id: 'error',      label: 'Error de lectura',      badge: 'bg-red-100 text-red-700' },
  { id: 'rechazada',  label: 'Rechazada',             badge: 'bg-gray-100 text-gray-500' },
  { id: 'archivada',  label: 'Archivada',             badge: 'bg-gray-100 text-gray-500' },
] as const

export const ESTADOS_PAGO_DOC = [
  { id: 'pendiente', label: 'Pendiente de pago', badge: 'bg-amber-100 text-amber-700' },
  { id: 'parcial',   label: 'Parcial',           badge: 'bg-blue-100 text-blue-700' },
  { id: 'pagado',    label: 'Pagado',            badge: 'bg-green-100 text-green-700' },
  { id: 'vencido',   label: 'Vencido',           badge: 'bg-red-100 text-red-700' },
] as const

export const labelEstadoDoc = (id: string) => ESTADOS_DOC.find(e => e.id === id)?.label ?? id
export const badgeEstadoDoc = (id: string) => ESTADOS_DOC.find(e => e.id === id)?.badge ?? 'bg-gray-100 text-gray-500'
export const labelEstadoPagoDoc = (id: string) => ESTADOS_PAGO_DOC.find(e => e.id === id)?.label ?? id
export const badgeEstadoPagoDoc = (id: string) => ESTADOS_PAGO_DOC.find(e => e.id === id)?.badge ?? 'bg-gray-100 text-gray-500'

export type Factura = {
  id: string
  ambito: Ambito
  tipo: TipoDoc
  esTicket: boolean
  categoria: string
  subcategoria: string
  categoriaId: string | null
  proveedor: string
  cif: string
  numero: string
  concepto: string
  fechaEmision: string
  fechaVencimiento: string
  fechaPago: string
  base: number | null
  ivaPct: number | null
  ivaImporte: number | null
  retencion: number | null
  total: number | null
  metodoPago: string
  estadoDoc: string
  estadoPago: string
  archivoNombre: string
  archivoMime: string
  archivoTamano: number
  archivoHash: string
  tieneArchivo: boolean
  notas: string
  gastoId: string | null
  ingresoId: string | null
  createdAt: string
  createdBy: string
}

/** Carpeta del balance (categoría o subcategoría). */
export type Carpeta = {
  id: string
  nombre: string
  color: string
  icono: string
  descripcion: string
  activa: boolean
  orden: number
  ambito: Ambito
  tipo: TipoDoc
  parentId: string | null
}

type Row = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))
const numOrNull = (v: unknown) => { const n = Number(v); return v == null || v === '' || Number.isNaN(n) ? null : n }

async function filas(fn: () => Promise<{ data: unknown; error: unknown }>): Promise<{ rows: Row[]; ok: boolean }> {
  try {
    const { data, error } = await fn()
    if (error || !Array.isArray(data)) return { rows: [], ok: false }
    return { rows: data as Row[], ok: true }
  } catch {
    return { rows: [], ok: false }
  }
}

export function aFactura(r: Row): Factura {
  return {
    id: str(r.id),
    ambito: (str(r.ambito) || 'empresa') as Ambito,
    tipo: (str(r.tipo) || 'gasto') as TipoDoc,
    esTicket: r.es_ticket === true,
    categoria: str(r.categoria),
    subcategoria: str(r.subcategoria),
    categoriaId: r.categoria_id ? str(r.categoria_id) : null,
    proveedor: str(r.proveedor),
    cif: str(r.cif),
    numero: str(r.numero),
    concepto: str(r.concepto),
    fechaEmision: str(r.fecha_emision).slice(0, 10),
    fechaVencimiento: str(r.fecha_vencimiento).slice(0, 10),
    fechaPago: str(r.fecha_pago).slice(0, 10),
    base: numOrNull(r.base),
    ivaPct: numOrNull(r.iva_pct),
    ivaImporte: numOrNull(r.iva_importe),
    retencion: numOrNull(r.retencion),
    total: numOrNull(r.total),
    metodoPago: str(r.metodo_pago),
    estadoDoc: str(r.estado_doc) || 'revision',
    estadoPago: str(r.estado_pago) || 'pendiente',
    archivoNombre: str(r.archivo_nombre),
    archivoMime: str(r.archivo_mime),
    archivoTamano: Number(r.archivo_tamano ?? 0) || 0,
    archivoHash: str(r.archivo_hash),
    tieneArchivo: !!str(r.archivo_path),
    notas: str(r.notas),
    gastoId: r.gasto_id ? str(r.gasto_id) : null,
    ingresoId: r.ingreso_id ? str(r.ingreso_id) : null,
    createdAt: str(r.created_at),
    createdBy: str(r.created_by),
  }
}

function aCarpeta(r: Row): Carpeta {
  return {
    id: str(r.id),
    nombre: str(r.nombre),
    color: str(r.color) || 'gray',
    icono: str(r.icono),
    descripcion: str(r.descripcion),
    activa: r.activa !== false,
    orden: Number(r.orden ?? 0) || 0,
    ambito: (str(r.ambito) || 'empresa') as Ambito,
    tipo: (str(r.tipo) || 'gasto') as TipoDoc,
    parentId: r.parent_id ? str(r.parent_id) : null,
  }
}

/** Carpetas (categorías y subcategorías) de las dos entidades. */
export async function getCarpetas(): Promise<{ carpetas: Carpeta[]; ok: boolean }> {
  const db = createAdminClient()
  const { rows, ok } = await filas(() => db.from('gasto_categorias').select('*').order('orden', { ascending: true }) as never)
  return {
    carpetas: rows.map(aCarpeta).sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, 'es')),
    ok,
  }
}

/** Facturas y justificantes subidos (los más nuevos primero). */
export async function getFacturas(): Promise<{ facturas: Factura[]; ok: boolean }> {
  const db = createAdminClient()
  const { rows, ok } = await filas(() => db.from('facturas').select('*').order('created_at', { ascending: false }).limit(2000) as never)
  return { facturas: rows.map(aFactura), ok }
}

/** Historial de una factura (auditoría). */
export async function getAuditoriaFactura(facturaId: string) {
  const db = createAdminClient()
  const { rows } = await filas(() => db.from('facturas_auditoria').select('*').eq('factura_id', facturaId).order('created_at', { ascending: false }).limit(100) as never)
  return rows.map(r => ({
    id: str(r.id), accion: str(r.accion), campo: str(r.campo),
    anterior: str(r.valor_anterior), nuevo: str(r.valor_nuevo),
    actor: str(r.actor), fecha: str(r.created_at),
  }))
}
