'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'
import { setAsignacionEvento } from '@/lib/calendario/asignaciones'

/** Asigna uno o varios monitores a un evento; les aparece en su calendario. */
export async function asignarMonitoresEvento(eventoId: string, monitorIds: string[], titulo?: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  if (!eventoId) return { ok: false, error: 'Evento no válido' }
  const ok = await setAsignacionEvento(eventoId, monitorIds, admin.email)
  if (!ok) return { ok: false, error: 'No se pudo guardar la asignación' }
  await logActivity({ actorEmail: admin.email, accion: `Monitores de «${titulo || eventoId}»: ${monitorIds.length}`, entidad: 'calendario', entidadId: eventoId })
  revalidatePath('/admin/calendario')
  revalidatePath('/admin/monitores')
  return { ok: true }
}

export async function crearEventoManual(input: { fecha: string; titulo: string; servicio?: string; hora?: string; nota?: string }) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  if (!input.fecha || !input.titulo.trim()) return { ok: false, error: 'Fecha y título son obligatorios' }

  const db = createAdminClient()
  const { data, error } = await db.from('calendario_eventos').insert({
    fecha: input.fecha, titulo: input.titulo.trim(), servicio: input.servicio || null,
    hora: input.hora?.trim() || null, nota: input.nota || null, created_by: admin.email,
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
