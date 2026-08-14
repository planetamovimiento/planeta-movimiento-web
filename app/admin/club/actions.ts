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
  // Cuota de socio (requiere migration_club_cuota.sql).
  cuota_estado?: string | null
  cuota_importe_cents?: number | null
  cuota_fecha_pago?: string | null
  cuota_forma_pago?: string | null
  talla?: string | null
  numero_socio?: string | null
}

/** Crea/actualiza la capa de gestión de una inscripción del club. */
export async function guardarGestion(submissionId: string, patch: GestionPatch) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()

  // Columnas date/opcionales: '' no es válido para una columna date → null.
  if (patch.cuota_fecha_pago === '') patch.cuota_fecha_pago = null
  if (patch.cuota_forma_pago === '') patch.cuota_forma_pago = null
  if (patch.talla === '') patch.talla = null
  if (patch.numero_socio === '') patch.numero_socio = null

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

/**
 * Crea la fila de gestión (sincroniza con el CRM) de inscripciones que llegaron
 * pero no la tienen. Red de seguridad del punto 28: no se pierde ninguna. Usa la
 * temporada indicada (la activa) y estado 'pendiente'. No pisa filas existentes.
 */
export async function sincronizarPendientes(submissionIds: string[], temporada: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  if (!Array.isArray(submissionIds) || submissionIds.length === 0) return { ok: true }

  const db = createAdminClient()
  const now = new Date().toISOString()
  const filas = submissionIds.map(id => ({
    submission_id: id, temporada: temporada || TEMPORADA_ACTUAL, estado_general: 'pendiente',
    updated_at: now, updated_by: admin.email,
  }))
  const { error } = await db.from('club_gestion').upsert(filas, { onConflict: 'submission_id' })
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: `Sincronizadas ${filas.length} inscripciones pendientes`, entidad: 'club' })
  revalidatePath('/admin/club')
  return { ok: true }
}

type MesPatch = { estado?: string; importe_cents?: number | null; fecha?: string | null; obs?: string | null }

/**
 * Guarda el detalle económico de un mes: estado (color) + importe + fecha + obs.
 * El estado sigue en `pagos`; el importe/fecha/obs en `pagos_meta[mes]`. Registra
 * el historial de cambios (punto 29). Si aún no existe la columna pagos_meta
 * (migración sin ejecutar), guarda al menos el estado y avisa (metaGuardado=false).
 */
export async function guardarMesDetalle(submissionId: string, mes: string, patch: MesPatch) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()
  const { data } = await db.from('club_gestion').select('pagos, pagos_meta').eq('submission_id', submissionId).maybeSingle()
  const pagos: Record<string, string> = (data?.pagos as Record<string, string>) ?? {}
  const meta: Record<string, { importe_cents?: number; fecha?: string; obs?: string }> =
    (data?.pagos_meta as Record<string, { importe_cents?: number; fecha?: string; obs?: string }>) ?? {}

  const estadoAnt = pagos[mes] ?? ''
  const importeAnt = meta[mes]?.importe_cents ?? null

  // Estado (color)
  if (patch.estado !== undefined) {
    if (patch.estado) pagos[mes] = patch.estado
    else delete pagos[mes]
  }
  // Detalle económico del mes
  const m = { ...(meta[mes] ?? {}) }
  if (patch.importe_cents !== undefined) { if (patch.importe_cents != null) m.importe_cents = patch.importe_cents; else delete m.importe_cents }
  if (patch.fecha !== undefined) { if (patch.fecha) m.fecha = patch.fecha; else delete m.fecha }
  if (patch.obs !== undefined) { if (patch.obs) m.obs = patch.obs; else delete m.obs }
  if (Object.keys(m).length) meta[mes] = m
  else delete meta[mes]

  const base = { submission_id: submissionId, updated_at: new Date().toISOString(), updated_by: admin.email }
  let metaGuardado = true
  const { error } = await db.from('club_gestion').upsert({ ...base, pagos, pagos_meta: meta }, { onConflict: 'submission_id' })
  if (error) {
    // Probablemente falta la columna pagos_meta: guarda al menos el estado.
    metaGuardado = false
    const r2 = await db.from('club_gestion').upsert({ ...base, pagos }, { onConflict: 'submission_id' })
    if (r2.error) return { ok: false, error: r2.error.message }
  }

  const importeNew = meta[mes]?.importe_cents ?? null
  const estadoNew = pagos[mes] ?? ''
  if (metaGuardado && (estadoAnt !== estadoNew || importeAnt !== importeNew)) {
    try {
      await db.from('club_pagos_historial').insert({
        submission_id: submissionId, mes,
        estado_ant: estadoAnt || null, estado_new: estadoNew || null,
        importe_ant_cents: importeAnt, importe_new_cents: importeNew,
        usuario: admin.email,
      })
    } catch { /* la tabla de historial es opcional */ }
  }

  revalidatePath('/admin/club')
  return { ok: true, metaGuardado }
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
