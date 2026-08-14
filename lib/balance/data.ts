import { createAdminClient } from '@/lib/supabase/admin'
import { getRegistrosCRM } from '@/lib/crm/data'
import { pendienteDe } from '@/lib/crm/constants'
import { MESES_TEMPORADA } from '@/lib/club/constants'
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

/** Fecha (día 1) del mes de temporada de una cuota, cuando no hay fecha de pago. */
function fechaMesCuota(temporada: string, mesNum: number): string {
  const y = parseInt(String(temporada).slice(0, 4), 10) || new Date().getFullYear()
  const year = mesNum >= 9 ? y : y + 1
  return `${year}-${String(mesNum).padStart(2, '0')}-01`
}

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
        ambito: 'empresa',
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
      ambito: str(m.ambito) || 'empresa',
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
      ambito: str(g.ambito) || 'empresa',
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

  // ── Ingresos del Club: cuotas mensuales COBRADAS (club_gestion.pagos_meta) ────
  // Cada mes marcado "pagado" con importe cuenta como ingreso del Club (ámbito club).
  try {
    const cg = await safe<Record<string, unknown>>(() => db.from('club_gestion').select('submission_id, temporada, pagos, pagos_meta').limit(5000) as never)
    const conPagos = cg.rows.filter(g => g.pagos_meta && typeof g.pagos_meta === 'object')
    if (conPagos.length) {
      const ids = conPagos.map(g => str(g.submission_id)).filter(Boolean)
      const subs = await safe<Record<string, unknown>>(() => db.from('form_submissions').select('id, nombre, datos').in('id', ids) as never)
      const subMap = new Map(subs.rows.map(s => [str(s.id), s]))
      for (const g of conPagos) {
        const pagos = (g.pagos ?? {}) as Record<string, string>
        const meta = (g.pagos_meta ?? {}) as Record<string, { importe_cents?: number; fecha?: string }>
        const s = subMap.get(str(g.submission_id))
        const d = (s?.datos ?? {}) as Record<string, unknown>
        const actividad = str(d.actividad) || 'Club Deportivo Origen'
        const nombre = `${str(d.nombre)} ${str(d.apellidos)}`.trim() || str(s?.nombre) || '—'
        for (const mes of MESES_TEMPORADA) {
          if (pagos[mes.key] !== 'pagado') continue
          const cents = meta[mes.key]?.importe_cents
          if (!(typeof cents === 'number' && cents > 0)) continue
          const importe = cents / 100
          ingresos.push({
            id: `cuota:${str(g.submission_id)}:${mes.key}`,
            tipo: 'auto', origen: 'cuota', ambito: 'club',
            fecha: meta[mes.key]?.fecha || fechaMesCuota(str(g.temporada), mes.mes),
            cliente: nombre, servicio: actividad, categoria: 'Cuotas',
            total: importe, pagado: importe, pendiente: 0,
            metodo: '', estado: 'pagado', referencia: `Cuota ${mes.nombre}`,
          })
        }
      }
    }
  } catch { /* CRM del club no disponible */ }

  // ── Categorías (BD o por defecto) ───────────────────────────────────────────
  const cz = await safe<Record<string, unknown>>(() => db.from('gasto_categorias').select('*').order('orden', { ascending: true }) as never)
  const categorias: Categoria[] = cz.rows.length
    ? cz.rows.map(c => ({ id: str(c.id), nombre: str(c.nombre), color: str(c.color) || 'gray', activa: c.activa !== false, orden: num(c.orden) }))
    : CATEGORIAS_GASTO_DEFAULT.map((c, i) => ({ id: `def-${i}`, ...c }))

  const setupOk = gz.ok && cz.ok && im.ok
  ingresos.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
  return { ingresos, gastos, categorias, setupOk }
}
