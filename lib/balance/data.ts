import { createAdminClient } from '@/lib/supabase/admin'
import { getRegistrosCRM } from '@/lib/crm/data'
import { pendienteDe } from '@/lib/crm/constants'
import {
  CATEGORIAS_GASTO_DEFAULT, gastoConIva,
  type Categoria, type IngresoMov, type GastoMov,
} from './constants'

async function safe<T>(fn: () => Promise<{ data: T[] | null; error: unknown }>): Promise<{ rows: T[]; ok: boolean }> {
  try { const { data, error } = await fn(); if (error) return { rows: [], ok: false }; return { rows: data ?? [], ok: true } }
  catch { return { rows: [], ok: false } }
}

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))
const num = (v: unknown) => { const n = Number(v); return isNaN(n) ? 0 : n }

export type BalanceData = {
  ingresos: IngresoMov[]
  gastos: GastoMov[]
  categorias: Categoria[]
  setupOk: boolean       // ¿están creadas las tablas?
}

/** ¿Se incluye el registro del CRM como ingreso? (transacciones reales) */
function incluirIngreso(r: { origen: string; total: number | null; estado_reserva: string }): boolean {
  if ((r.total ?? 0) <= 0) return false
  if (r.origen === 'form') return ['confirmada', 'en_curso', 'finalizada'].includes(r.estado_reserva)
  return true // booking, order
}

function estadoIngreso(r: { estado_reserva: string; estado_pago: string }): string {
  if (r.estado_reserva === 'cancelada') return 'cancelado'
  if (r.estado_pago === 'pagado') return 'pagado'
  if (r.estado_pago === 'parcial') return 'parcial'
  return 'pendiente'
}

export async function getBalanceData(): Promise<BalanceData> {
  const db = createAdminClient()

  // ── Ingresos automáticos (CRM: bookings + orders + forms cerrados) ──────────
  const ingresos: IngresoMov[] = []
  try {
    const { registros } = await getRegistrosCRM()
    for (const r of registros) {
      if (!incluirIngreso(r)) continue
      const total = num(r.total)
      const estado = estadoIngreso(r)
      const cobrado = estado === 'pagado' ? total : num(r.pagado)
      ingresos.push({
        id: `${r.origen}:${r.id}`,
        tipo: 'auto',
        origen: r.origen,
        fecha: (r.fecha_realizacion || r.fecha_reserva || '').slice(0, 10),
        cliente: r.cliente_nombre || r.entidad || '—',
        servicio: r.servicio,
        categoria: r.categoria,
        total,
        pagado: cobrado,
        pendiente: pendienteDe(r),
        metodo: r.metodo_pago || '',
        estado,
        referencia: r.numero,
      })
    }
  } catch { /* CRM no disponible */ }

  // ── Ingresos manuales ───────────────────────────────────────────────────────
  const im = await safe<Record<string, unknown>>(() => db.from('ingresos_manuales').select('*').order('fecha', { ascending: false }).limit(5000) as never)
  for (const m of im.rows) {
    const total = num(m.importe)
    const estado = str(m.estado) || 'pagado'
    const pagado = estado === 'pagado' ? total : (m.pagado != null ? num(m.pagado) : 0)
    ingresos.push({
      id: `manual:${str(m.id)}`,
      tipo: 'manual',
      origen: 'manual',
      fecha: str(m.fecha).slice(0, 10),
      cliente: str(m.cliente) || '—',
      servicio: str(m.servicio) || str(m.concepto),
      categoria: str(m.categoria) || 'Otros',
      total,
      pagado,
      pendiente: ['cancelado', 'reembolsado', 'pagado'].includes(estado) ? 0 : Math.max(0, total - pagado),
      metodo: str(m.metodo_pago),
      estado,
      referencia: str(m.referencia) || 'M-' + str(m.id).slice(0, 6),
    })
  }

  // ── Gastos ────────────────────────────────────────────────────────────────
  const gz = await safe<Record<string, unknown>>(() => db.from('gastos').select('*').order('fecha', { ascending: false }).limit(5000) as never)
  const gastos: GastoMov[] = gz.rows.map(g => {
    const importe = num(g.importe)
    const iva = g.iva == null || g.iva === '' ? null : num(g.iva)
    return {
      id: str(g.id),
      fecha: str(g.fecha).slice(0, 10),
      concepto: str(g.concepto),
      categoria: str(g.categoria) || 'Otros gastos',
      subcategoria: str(g.subcategoria),
      proveedor: str(g.proveedor),
      importe,
      iva,
      total: gastoConIva(importe, iva),
      metodo: str(g.metodo_pago),
      estado: str(g.estado) || 'pagado',
      observaciones: str(g.observaciones),
      adjuntoUrl: str(g.adjunto_url),
      facturaRef: str(g.factura_ref),
      createdBy: str(g.created_by),
      updatedAt: g.updated_at ? str(g.updated_at) : null,
      updatedBy: g.updated_by ? str(g.updated_by) : null,
    }
  })

  // ── Categorías (BD o por defecto) ───────────────────────────────────────────
  const cz = await safe<Record<string, unknown>>(() => db.from('gasto_categorias').select('*').order('orden', { ascending: true }) as never)
  const categorias: Categoria[] = cz.rows.length
    ? cz.rows.map(c => ({ id: str(c.id), nombre: str(c.nombre), color: str(c.color) || 'gray', activa: c.activa !== false, orden: num(c.orden) }))
    : CATEGORIAS_GASTO_DEFAULT.map((c, i) => ({ id: `def-${i}`, ...c }))

  const setupOk = gz.ok && cz.ok && im.ok
  ingresos.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
  return { ingresos, gastos, categorias, setupOk }
}
