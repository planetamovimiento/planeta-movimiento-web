'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'

type Patch = {
  estado_reserva?: string
  estado_pago?: string
  total?: number | null
  pagado?: number | null
  metodo_pago?: string | null
  fecha_realizacion?: string | null
  participantes?: number | null
  observaciones?: string | null
}

/** Crea/actualiza la capa de gestión CRM de un registro (booking/form/order). */
export async function guardarGestionCRM(origen: string, origenId: string, patch: Patch) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()
  const { error } = await db.from('crm_gestion').upsert(
    { origen, origen_id: origenId, ...patch, updated_at: new Date().toISOString(), updated_by: admin.email },
    { onConflict: 'origen,origen_id' }
  )
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: 'Gestión CRM actualizada', entidad: 'crm', entidadId: `${origen}:${origenId}` })
  revalidatePath('/admin/reservas')
  revalidatePath('/admin/calendario')
  return { ok: true }
}

/** Registra un cobro: lo añade al historial y recalcula importe pagado y estado de pago. */
export async function registrarPagoCRM(origen: string, origenId: string, pago: { importe: number; metodo: string; nota?: string; total: number | null }) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  if (!pago.importe || pago.importe <= 0) return { ok: false, error: 'Importe no válido' }

  const db = createAdminClient()
  const { data } = await db.from('crm_gestion').select('pagos, total').eq('origen', origen).eq('origen_id', origenId).maybeSingle()
  const pagos = Array.isArray(data?.pagos) ? (data!.pagos as { importe: number }[]) : []
  const nuevos = [...pagos, { fecha: new Date().toISOString(), importe: pago.importe, metodo: pago.metodo, nota: pago.nota ?? '' }]
  const pagado = nuevos.reduce((s, p) => s + (Number(p.importe) || 0), 0)
  const total = pago.total ?? (data?.total != null ? Number(data.total) : null)
  const estado_pago = total && total > 0 ? (pagado >= total ? 'pagado' : 'parcial') : (pagado > 0 ? 'parcial' : 'pendiente')

  const { error } = await db.from('crm_gestion').upsert(
    { origen, origen_id: origenId, pagos: nuevos, pagado, total, estado_pago, metodo_pago: pago.metodo, updated_at: new Date().toISOString(), updated_by: admin.email },
    { onConflict: 'origen,origen_id' }
  )
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: `Cobro registrado: ${pago.importe} €`, entidad: 'crm', entidadId: `${origen}:${origenId}` })
  revalidatePath('/admin/reservas')
  return { ok: true, pagado, estado_pago }
}
