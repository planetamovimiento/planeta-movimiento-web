'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, logActivity } from '@/lib/admin/auth'
import { puedeVerSeccion } from '@/lib/admin/secciones'

/** Comprueba sesión + acceso a la sección + nivel de permiso. */
async function exigir(nivel: 'principal' | 'editar') {
  const admin = await getAdminUser()
  if (!admin) return { admin: null, error: 'Sin sesión' }
  if (!puedeVerSeccion(admin.role, admin.secciones, 'circo-inclusivo')) return { admin: null, error: 'Sin acceso a Circo Inclusivo' }
  if (nivel === 'principal' && admin.role !== 'principal') return { admin: null, error: 'Solo el administrador principal puede hacer esto' }
  if (nivel === 'editar' && admin.role === 'lectura') return { admin: null, error: 'No tienes permisos de edición' }
  return { admin, error: null as string | null }
}

const txt = (v?: string | null) => (typeof v === 'string' && v.trim() ? v.trim() : null)

// ── Participantes (solo principal) ───────────────────────────────────────────
export type ParticipanteInput = {
  id?: string
  nombre: string
  apellidos?: string
  fecha_nacimiento?: string | null
  entidad?: string
  grupo_id?: string | null
  actividad?: string
  observaciones?: string
  necesidades_apoyo?: string
  info_monitor?: string
  estado?: string
}

export async function guardarParticipante(input: ParticipanteInput) {
  const { admin, error: permErr } = await exigir('principal')
  if (!admin) return { ok: false, error: permErr }
  if (!input.nombre?.trim()) return { ok: false, error: 'El nombre es obligatorio' }

  const db = createAdminClient()
  const row = {
    nombre: input.nombre.trim(),
    apellidos: txt(input.apellidos),
    fecha_nacimiento: input.fecha_nacimiento || null,
    entidad: txt(input.entidad),
    grupo_id: input.grupo_id || null,
    actividad: txt(input.actividad),
    observaciones: txt(input.observaciones),
    necesidades_apoyo: txt(input.necesidades_apoyo),
    info_monitor: txt(input.info_monitor),
    estado: input.estado || 'activo',
    updated_at: new Date().toISOString(),
  }

  const { error } = input.id
    ? await db.from('ci_participantes').update(row).eq('id', input.id)
    : await db.from('ci_participantes').insert(row)
  if (error) return { ok: false, error: error.message }

  await logActivity({
    actorEmail: admin.email,
    accion: input.id ? 'Editó participante (Circo Inclusivo)' : 'Creó participante (Circo Inclusivo)',
    entidad: 'ci_participante', entidadId: input.id, detalle: `${row.nombre} ${row.apellidos ?? ''}`.trim(),
  })
  revalidatePath('/admin/circo-inclusivo')
  if (input.id) revalidatePath(`/admin/circo-inclusivo/participantes/${input.id}`)
  return { ok: true }
}

export async function eliminarParticipante(id: string) {
  const { admin, error: permErr } = await exigir('principal')
  if (!admin) return { ok: false, error: permErr }
  const db = createAdminClient()
  const { error } = await db.from('ci_participantes').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: 'Eliminó participante (Circo Inclusivo)', entidad: 'ci_participante', entidadId: id })
  revalidatePath('/admin/circo-inclusivo')
  return { ok: true }
}

// ── Grupos (solo principal) ──────────────────────────────────────────────────
export type GrupoInput = {
  id?: string; nombre: string; entidad?: string; horario?: string; lugar?: string; monitor?: string; observaciones?: string
}

export async function guardarGrupo(input: GrupoInput) {
  const { admin, error: permErr } = await exigir('principal')
  if (!admin) return { ok: false, error: permErr }
  if (!input.nombre?.trim()) return { ok: false, error: 'El nombre del grupo es obligatorio' }

  const db = createAdminClient()
  const row = {
    nombre: input.nombre.trim(),
    entidad: txt(input.entidad),
    horario: txt(input.horario),
    lugar: txt(input.lugar),
    monitor: txt(input.monitor),
    observaciones: txt(input.observaciones),
    updated_at: new Date().toISOString(),
  }
  const { error } = input.id
    ? await db.from('ci_grupos').update(row).eq('id', input.id)
    : await db.from('ci_grupos').insert(row)
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: input.id ? 'Editó grupo (Circo Inclusivo)' : 'Creó grupo (Circo Inclusivo)', entidad: 'ci_grupo', entidadId: input.id, detalle: row.nombre })
  revalidatePath('/admin/circo-inclusivo/grupos')
  revalidatePath('/admin/circo-inclusivo')
  return { ok: true }
}

export async function eliminarGrupo(id: string) {
  const { admin, error: permErr } = await exigir('principal')
  if (!admin) return { ok: false, error: permErr }
  const db = createAdminClient()
  const { error } = await db.from('ci_grupos').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: 'Eliminó grupo (Circo Inclusivo)', entidad: 'ci_grupo', entidadId: id })
  revalidatePath('/admin/circo-inclusivo/grupos')
  return { ok: true }
}

// ── Actividades (solo principal) ─────────────────────────────────────────────
export type ActividadInput = { id?: string; nombre: string; descripcion?: string; orden?: number }

export async function guardarActividad(input: ActividadInput) {
  const { admin, error: permErr } = await exigir('principal')
  if (!admin) return { ok: false, error: permErr }
  if (!input.nombre?.trim()) return { ok: false, error: 'El nombre de la actividad es obligatorio' }

  const db = createAdminClient()
  const row = { nombre: input.nombre.trim(), descripcion: txt(input.descripcion), orden: input.orden ?? 0 }
  const { error } = input.id
    ? await db.from('ci_actividades').update(row).eq('id', input.id)
    : await db.from('ci_actividades').insert(row)
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: input.id ? 'Editó actividad (Circo Inclusivo)' : 'Creó actividad (Circo Inclusivo)', entidad: 'ci_actividad', entidadId: input.id, detalle: row.nombre })
  revalidatePath('/admin/circo-inclusivo/actividades')
  revalidatePath('/admin/circo-inclusivo')
  return { ok: true }
}

export async function eliminarActividad(id: string) {
  const { admin, error: permErr } = await exigir('principal')
  if (!admin) return { ok: false, error: permErr }
  const db = createAdminClient()
  const { error } = await db.from('ci_actividades').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: 'Eliminó actividad (Circo Inclusivo)', entidad: 'ci_actividad', entidadId: id })
  revalidatePath('/admin/circo-inclusivo/actividades')
  return { ok: true }
}

// ── Evaluaciones (principal o gestor) ────────────────────────────────────────
export type EvaluacionInput = {
  id?: string
  participante_id: string
  tipo: 'mensual' | 'trimestral'
  fecha: string
  periodo?: string
  profesional?: string
  items: Record<string, number>
  textos: Record<string, string>
  valoracion_global?: string | null
}

export async function guardarEvaluacion(input: EvaluacionInput) {
  const { admin, error: permErr } = await exigir('editar')
  if (!admin) return { ok: false, error: permErr }
  if (!input.participante_id) return { ok: false, error: 'Falta el participante' }

  const db = createAdminClient()
  const row = {
    participante_id: input.participante_id,
    tipo: input.tipo,
    fecha: input.fecha || new Date().toISOString().slice(0, 10),
    periodo: txt(input.periodo),
    profesional: txt(input.profesional),
    items: input.items ?? {},
    textos: input.textos ?? {},
    valoracion_global: input.valoracion_global || null,
    updated_at: new Date().toISOString(),
  }
  const { error } = input.id
    ? await db.from('ci_evaluaciones').update(row).eq('id', input.id)
    : await db.from('ci_evaluaciones').insert(row)
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: input.id ? `Editó evaluación ${input.tipo} (Circo Inclusivo)` : `Creó evaluación ${input.tipo} (Circo Inclusivo)`, entidad: 'ci_evaluacion', entidadId: input.id, detalle: input.participante_id })
  revalidatePath(`/admin/circo-inclusivo/participantes/${input.participante_id}`)
  revalidatePath('/admin/circo-inclusivo/evaluaciones')
  return { ok: true }
}

export async function eliminarEvaluacion(id: string, participanteId: string) {
  const { admin, error: permErr } = await exigir('editar')
  if (!admin) return { ok: false, error: permErr }
  const db = createAdminClient()
  const { error } = await db.from('ci_evaluaciones').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: 'Eliminó evaluación (Circo Inclusivo)', entidad: 'ci_evaluacion', entidadId: id })
  revalidatePath(`/admin/circo-inclusivo/participantes/${participanteId}`)
  revalidatePath('/admin/circo-inclusivo/evaluaciones')
  return { ok: true }
}
