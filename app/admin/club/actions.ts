'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'
import { TEMPORADA_ACTUAL } from '@/lib/club/constants'

const hoyISO = () => new Date().toISOString().slice(0, 10)

type GestionPatch = {
  grupo?: string | null
  estado_general?: string
  temporada?: string
  observaciones?: string | null
  observaciones_familia?: string | null
  foto_url?: string | null
  horario?: string | null
  whatsapp_url?: string | null
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

export async function fijarHorarioGrupo(id: string, horario: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()
  const { error } = await db.from('club_grupos').update({ horario: horario.trim() || null }).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/club')
  return { ok: true }
}

export async function fijarWhatsappGrupo(id: string, url: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()
  const { error } = await db.from('club_grupos').update({ whatsapp_url: url.trim() || null }).eq('id', id)
  if (error) return { ok: false, error: error.message }

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

// ── Importación masiva (CSV / Excel) ────────────────────────────────────────────

export type ImportRow = {
  nombre?: string
  apellidos?: string
  actividad?: string
  grupo?: string
  fechaNacimiento?: string
  tutorLegal?: string
  telefono?: string
  email?: string
  estado_general?: string
  observaciones?: string
  temporada?: string
  fechaInscripcion?: string
  pagos?: Record<string, string>
}

export async function importarInscripciones(rows: ImportRow[]) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  if (!Array.isArray(rows) || rows.length === 0) return { ok: false, error: 'No hay filas que importar' }

  const db = createAdminClient()
  const subs: Record<string, unknown>[] = []
  const gestiones: Record<string, unknown>[] = []
  let saltadas = 0

  for (const r of rows) {
    const nombre = `${r.nombre ?? ''} ${r.apellidos ?? ''}`.trim()
    if (!nombre) { saltadas++; continue }
    const id = crypto.randomUUID()
    subs.push({
      id,
      tipo: 'inscripcion_club',
      nombre,
      email: r.email || null,
      telefono: r.telefono || null,
      asunto: r.actividad ? `Inscripción Club · ${r.actividad}` : 'Inscripción Club (importada)',
      datos: {
        actividad: r.actividad ?? '',
        nombre: r.nombre ?? '',
        apellidos: r.apellidos ?? '',
        fechaNacimiento: r.fechaNacimiento ?? '',
        tutorLegal: r.tutorLegal ?? '',
        __import: true,
      },
      estado: 'cerrada',
      ...(r.fechaInscripcion ? { created_at: r.fechaInscripcion } : {}),
    })
    gestiones.push({
      submission_id: id,
      grupo: r.grupo || null,
      estado_general: r.estado_general || 'activo',
      temporada: r.temporada || TEMPORADA_ACTUAL,
      pagos: r.pagos ?? {},
      observaciones: r.observaciones || null,
      fecha_alta: r.fechaInscripcion ? r.fechaInscripcion.slice(0, 10) : null,
      updated_by: admin.email,
    })
  }

  if (subs.length === 0) return { ok: false, error: 'Ninguna fila tenía nombre. Revisa la asignación de columnas.' }

  const { error: e1 } = await db.from('form_submissions').insert(subs)
  if (e1) return { ok: false, error: e1.message }
  const { error: e2 } = await db.from('club_gestion').insert(gestiones)
  if (e2) return { ok: false, error: 'Alumnos creados, pero falló la gestión: ' + e2.message }

  await logActivity({ actorEmail: admin.email, accion: `Importadas ${subs.length} inscripciones del club`, entidad: 'club' })
  revalidatePath('/admin/club')
  return { ok: true, importadas: subs.length, saltadas }
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
