'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'

// ─────────────────────────────────────────────────────────────────────────────
// Altas, cambios y cobros de los sueldos de los monitores (Balance → Sueldos).
// ─────────────────────────────────────────────────────────────────────────────

type Res = { ok: true } | { ok: false; error: string }

export type SueldoInput = {
  id?: string
  monitor_id: string
  ambito?: 'empresa' | 'club'
  fecha: string
  concepto: string
  detalle?: string
  bruto?: number
  neto?: number
  metodo?: string
  estado?: string
  fecha_pago?: string | null
  horas?: number | null
  notas?: string
}

const txt = (v?: string | null) => (typeof v === 'string' && v.trim() ? v.trim() : null)
const money = (v?: number | null) => Math.max(0, Math.round((Number(v) || 0) * 100) / 100)

async function exigir(nivel: 'editar' | 'borrar') {
  const admin = await getAdminUser()
  if (!admin) return { admin: null, error: 'Sin sesión' }
  if (nivel === 'borrar' && !can.manageFinance(admin.role)) return { admin: null, error: 'Solo el administrador principal puede borrar' }
  if (!can.editFinance(admin.role)) return { admin: null, error: 'No tienes permisos de edición' }
  return { admin, error: null as string | null }
}

export async function guardarSueldo(input: SueldoInput): Promise<Res> {
  const { admin, error: permErr } = await exigir('editar')
  if (!admin) return { ok: false, error: permErr! }
  if (!input.monitor_id) return { ok: false, error: 'Elige el monitor' }
  if (!input.fecha) return { ok: false, error: 'Indica la fecha del trabajo' }
  if (!input.concepto?.trim()) return { ok: false, error: 'Indica el concepto' }

  const bruto = money(input.bruto)
  const neto = money(input.neto) || bruto   // sin neto indicado, cobra el bruto
  const estado = input.estado === 'pagado' ? 'pagado' : 'pendiente'

  const fila = {
    monitor_id: input.monitor_id,
    ambito: input.ambito === 'club' ? 'club' : 'empresa',
    fecha: input.fecha,
    concepto: input.concepto.trim(),
    detalle: txt(input.detalle),
    bruto, neto,
    metodo: ['efectivo', 'nomina', 'transferencia'].includes(String(input.metodo)) ? input.metodo : 'efectivo',
    estado,
    // Si se marca pagado sin fecha, se da por pagado el día del trabajo.
    fecha_pago: estado === 'pagado' ? (txt(input.fecha_pago) ?? input.fecha) : null,
    horas: input.horas == null || input.horas === 0 ? null : Number(input.horas),
    notas: txt(input.notas),
    updated_at: new Date().toISOString(),
    updated_by: admin.email,
  }

  const db = createAdminClient()
  const { error } = input.id
    ? await db.from('sueldos').update(fila).eq('id', input.id)
    : await db.from('sueldos').insert(fila)
  if (error) return { ok: false, error: error.message }

  await logActivity({
    actorEmail: admin.email,
    accion: input.id ? 'Editó un sueldo de monitor' : 'Registró un sueldo de monitor',
    entidad: 'sueldo', entidadId: input.id, detalle: `${fila.concepto} · ${neto} €`,
  })
  revalidatePath('/admin/balance')
  revalidatePath('/admin/monitores')
  return { ok: true }
}

/** Marca una línea como pagada (o la devuelve a pendiente). */
export async function marcarPagoSueldo(id: string, pagado: boolean, fechaPago?: string): Promise<Res> {
  const { admin, error: permErr } = await exigir('editar')
  if (!admin) return { ok: false, error: permErr! }
  const db = createAdminClient()
  const { error } = await db.from('sueldos').update({
    estado: pagado ? 'pagado' : 'pendiente',
    fecha_pago: pagado ? (fechaPago || new Date().toISOString().slice(0, 10)) : null,
    updated_at: new Date().toISOString(), updated_by: admin.email,
  }).eq('id', id)
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: pagado ? 'Marcó un sueldo como pagado' : 'Devolvió un sueldo a pendiente', entidad: 'sueldo', entidadId: id })
  revalidatePath('/admin/balance')
  revalidatePath('/admin/monitores')
  return { ok: true }
}

/** Paga de golpe todo lo pendiente de un monitor (lo normal al cerrar el mes). */
export async function pagarPendientesMonitor(monitorId: string, ambito: 'empresa' | 'club', fechaPago?: string): Promise<Res> {
  const { admin, error: permErr } = await exigir('editar')
  if (!admin) return { ok: false, error: permErr! }
  const db = createAdminClient()
  const { error } = await db.from('sueldos').update({
    estado: 'pagado',
    fecha_pago: fechaPago || new Date().toISOString().slice(0, 10),
    updated_at: new Date().toISOString(), updated_by: admin.email,
  }).eq('monitor_id', monitorId).eq('ambito', ambito).eq('estado', 'pendiente')
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: 'Pagó todo lo pendiente de un monitor', entidad: 'sueldo', entidadId: monitorId })
  revalidatePath('/admin/balance')
  revalidatePath('/admin/monitores')
  return { ok: true }
}

export async function eliminarSueldo(id: string): Promise<Res> {
  const { admin, error: permErr } = await exigir('borrar')
  if (!admin) return { ok: false, error: permErr! }
  const db = createAdminClient()
  const { error } = await db.from('sueldos').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: 'Eliminó un sueldo de monitor', entidad: 'sueldo', entidadId: id })
  revalidatePath('/admin/balance')
  revalidatePath('/admin/monitores')
  return { ok: true }
}
