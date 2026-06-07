'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'

export async function crearEventoManual(input: { fecha: string; titulo: string; servicio?: string; nota?: string }) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  if (!input.fecha || !input.titulo.trim()) return { ok: false, error: 'Fecha y título son obligatorios' }

  const db = createAdminClient()
  const { data, error } = await db.from('calendario_eventos').insert({
    fecha: input.fecha, titulo: input.titulo.trim(), servicio: input.servicio || null, nota: input.nota || null, created_by: admin.email,
  }).select('id').maybeSingle()
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: `Evento de calendario: ${input.titulo}`, entidad: 'calendario', entidadId: data?.id })
  revalidatePath('/admin/calendario')
  return { ok: true, id: data?.id as string }
}

export async function eliminarEventoManual(id: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()
  const { error } = await db.from('calendario_eventos').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/calendario')
  return { ok: true }
}
