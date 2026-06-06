'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'

export async function actualizarEstadoReserva(id: string, estado_reserva: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()
  const { error } = await db.from('bookings').update({ estado_reserva }).eq('id', id)
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: `Cambió estado a "${estado_reserva}"`, entidad: 'reserva', entidadId: id })
  revalidatePath('/admin/reservas')
  return { ok: true }
}

export async function actualizarEstadoPago(id: string, estado_pago: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()
  const { error } = await db.from('bookings').update({ estado_pago }).eq('id', id)
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: `Pago marcado como "${estado_pago}"`, entidad: 'reserva', entidadId: id })
  revalidatePath('/admin/reservas')
  return { ok: true }
}

export async function guardarNotasInternas(id: string, notas_internas: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()
  const { error } = await db.from('bookings').update({ notas_internas }).eq('id', id)
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: 'Editó notas internas', entidad: 'reserva', entidadId: id })
  revalidatePath('/admin/reservas')
  return { ok: true }
}
