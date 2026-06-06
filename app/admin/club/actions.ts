'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'

const hoyISO = () => new Date().toISOString().slice(0, 10)

type GestionPatch = {
  grupo?: string | null
  estado_general?: string
  temporada?: string
  observaciones?: string | null
  fecha_alta?: string | null
  fecha_baja?: string | null
}

/** Crea/actualiza la capa de gestión de una inscripción del club. */
export async function guardarGestion(submissionId: string, patch: GestionPatch) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()

  // Automatismos de fechas según el estado general
  const extra: GestionPatch = {}
  if (patch.estado_general === 'baja' && patch.fecha_baja === undefined) extra.fecha_baja = hoyISO()
  if (patch.estado_general === 'activo') {
    extra.fecha_baja = null
    const { data: actual } = await db.from('club_gestion').select('fecha_alta').eq('submission_id', submissionId).maybeSingle()
    if (!actual?.fecha_alta && patch.fecha_alta === undefined) extra.fecha_alta = hoyISO()
  }

  const { error } = await db.from('club_gestion').upsert(
    { submission_id: submissionId, ...patch, ...extra, updated_at: new Date().toISOString(), updated_by: admin.email },
    { onConflict: 'submission_id' }
  )
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: 'Gestión de inscripción actualizada', entidad: 'club', entidadId: submissionId })
  revalidatePath('/admin/club')
  return { ok: true }
}

/** Marca el estado de pago de un mes concreto (o lo borra si estado = ''). */
export async function setPagoMes(submissionId: string, mes: string, estado: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()
  const { data } = await db.from('club_gestion').select('pagos').eq('submission_id', submissionId).maybeSingle()
  const pagos: Record<string, string> = (data?.pagos as Record<string, string>) ?? {}
  if (estado) pagos[mes] = estado
  else delete pagos[mes]

  const { error } = await db.from('club_gestion').upsert(
    { submission_id: submissionId, pagos, updated_at: new Date().toISOString(), updated_by: admin.email },
    { onConflict: 'submission_id' }
  )
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/club')
  return { ok: true }
}

// ── Grupos ────────────────────────────────────────────────────────────────────

export async function crearGrupo(nombre: string, actividad: string | null) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  if (!nombre.trim()) return { ok: false, error: 'El nombre es obligatorio' }

  const db = createAdminClient()
  const { error } = await db.from('club_grupos').insert({ nombre: nombre.trim(), actividad: actividad || null })
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: `Grupo creado: ${nombre}`, entidad: 'club_grupo' })
  revalidatePath('/admin/club')
  return { ok: true }
}

export async function renombrarGrupo(id: string, nombre: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  if (!nombre.trim()) return { ok: false, error: 'El nombre es obligatorio' }

  const db = createAdminClient()
  const { error } = await db.from('club_grupos').update({ nombre: nombre.trim() }).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/club')
  return { ok: true }
}

export async function eliminarGrupo(id: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()
  const { error } = await db.from('club_grupos').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: 'Grupo eliminado', entidad: 'club_grupo', entidadId: id })
  revalidatePath('/admin/club')
  return { ok: true }
}
