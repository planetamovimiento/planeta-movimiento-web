'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, logActivity } from '@/lib/admin/auth'
import { puedeVerSeccion } from '@/lib/admin/secciones'
import type { EstadoFamilia } from '@/lib/familias/tipos'
import { sincronizarFamilias } from '@/lib/familias/sync'
import { siguienteNumeroSocio } from '@/lib/familias/socio'
import { saveAvisos, type Aviso } from '@/lib/familias/avisos'

const txt = (v?: string | null) => (typeof v === 'string' && v.trim() ? v.trim() : null)
const revalidar = () => revalidatePath('/admin/familias')

async function exigir() {
  const admin = await getAdminUser()
  if (!admin) return { admin: null, error: 'Sin sesión' }
  if (!puedeVerSeccion(admin.role, admin.secciones, 'familias')) return { admin: null, error: 'Sin acceso al Portal de Familias' }
  if (admin.role === 'lectura') return { admin: null, error: 'No tienes permisos de edición' }
  return { admin, error: null as string | null }
}

/** Sincroniza cuentas familiares y vínculos desde el CRM. Idempotente. */
export async function generarFamiliasDesdeCRM() {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error }
  const { nuevasFamilias, nuevosVinculos } = await sincronizarFamilias()
  if (nuevasFamilias || nuevosVinculos) {
    await logActivity({ actorEmail: admin.email, accion: `Sincronizó familias desde CRM (+${nuevasFamilias} cuentas, +${nuevosVinculos} vínculos)`, entidad: 'club_familia' })
  }
  revalidar()
  return { ok: true, nuevasFamilias, nuevosVinculos }
}

/** Publica/actualiza los avisos del club visibles para las familias. */
export async function guardarAvisosClub(avisos: Aviso[]) {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error }
  const limpios: Aviso[] = (avisos || [])
    .filter(a => (a.titulo?.trim() || a.cuerpo?.trim()))
    .map(a => ({
      id: a.id || crypto.randomUUID(),
      titulo: (a.titulo || '').trim().slice(0, 120),
      cuerpo: (a.cuerpo || '').trim().slice(0, 1000),
      activo: a.activo !== false,
    }))
  const ok = await saveAvisos(limpios, admin.email)
  if (!ok) return { ok: false, error: 'No se pudo guardar. ¿Has ejecutado migration_global_config.sql?' }
  await logActivity({ actorEmail: admin.email, accion: `Avisos del club (${limpios.length})`, entidad: 'club_familia' })
  revalidatePath('/familias')
  revalidar()
  return { ok: true }
}

export async function guardarFamilia(input: { id: string; nombre?: string; telefono?: string; email?: string }) {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error }
  const db = createAdminClient()
  const patch: Record<string, unknown> = {}
  if (input.nombre !== undefined) patch.nombre = txt(input.nombre)
  if (input.telefono !== undefined) patch.telefono = txt(input.telefono)
  if (input.email !== undefined) {
    const email = input.email.trim().toLowerCase()
    if (!email) return { ok: false, error: 'El email no puede estar vacío' }
    patch.email = email
  }
  const { error: e } = await db.from('club_familias').update(patch).eq('id', input.id)
  if (e) return { ok: false, error: e.message.includes('duplicate') ? 'Ya existe una cuenta con ese email.' : e.message }
  revalidar()
  return { ok: true }
}

/**
 * Activa a la familia como SOCIO: genera su nº de socio (si no lo tiene) y pone
 * estado activo → habilita el acceso al Portal de Familias (correo + nº socio).
 * Idempotente. El índice único de la BD evita duplicados en concurrencia.
 */
export async function generarNumeroSocioFamilia(familiaId: string) {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error }
  const db = createAdminClient()
  const { data } = await db.from('club_familias').select('numero_socio').eq('id', familiaId).maybeSingle()
  let numero = (data as { numero_socio: string | null } | null)?.numero_socio || null

  if (!numero) {
    for (let i = 0; i < 4 && !numero; i++) {
      const cand = await siguienteNumeroSocio()
      const { error: e } = await db.from('club_familias').update({ numero_socio: cand, estado: 'activo' }).eq('id', familiaId)
      if (!e) numero = cand
      else if (!e.message.toLowerCase().includes('duplicate')) return { ok: false, error: e.message }
    }
    if (!numero) return { ok: false, error: 'No se pudo generar el número. Inténtalo de nuevo.' }
  } else {
    await db.from('club_familias').update({ estado: 'activo' }).eq('id', familiaId)
  }
  await logActivity({ actorEmail: admin.email, accion: `Socio activo · nº ${numero}`, entidad: 'club_familia', entidadId: familiaId })
  revalidar()
  return { ok: true, numero }
}

/** Fija/edita manualmente el nº de socio (único). Vacío = lo quita. */
export async function guardarNumeroSocio(familiaId: string, numero: string) {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error }
  const db = createAdminClient()
  const n = (numero || '').trim().toUpperCase() || null
  const { error: e } = await db.from('club_familias').update({ numero_socio: n }).eq('id', familiaId)
  if (e) return { ok: false, error: e.message.toLowerCase().includes('duplicate') ? 'Ese número de socio ya está en uso.' : e.message }
  await logActivity({ actorEmail: admin.email, accion: `Nº de socio → ${n ?? '—'}`, entidad: 'club_familia', entidadId: familiaId })
  revalidar()
  return { ok: true }
}

export async function cambiarEstadoFamilia(id: string, estado: EstadoFamilia) {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error }
  const db = createAdminClient()
  const { error: e } = await db.from('club_familias').update({ estado }).eq('id', id)
  if (e) return { ok: false, error: e.message }
  await logActivity({ actorEmail: admin.email, accion: `Estado de familia → ${estado}`, entidad: 'club_familia', entidadId: id })
  revalidar()
  return { ok: true }
}

export async function vincularAlumno(familiaId: string, submissionId: string) {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error }
  const db = createAdminClient()
  const { error: e } = await db.from('club_familia_alumnos').upsert({ familia_id: familiaId, submission_id: submissionId }, { onConflict: 'familia_id,submission_id' })
  if (e) return { ok: false, error: e.message }
  // Se vuelve a vincular a mano → deja de estar excluido.
  try { await db.from('club_familia_excluidos').delete().eq('familia_id', familiaId).eq('submission_id', submissionId) } catch { /* tabla sin migrar */ }
  revalidar()
  return { ok: true }
}

export async function desvincularAlumno(familiaId: string, submissionId: string) {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error }
  const db = createAdminClient()
  const { error: e } = await db.from('club_familia_alumnos').delete().eq('familia_id', familiaId).eq('submission_id', submissionId)
  if (e) return { ok: false, error: e.message }
  // Registra la exclusión para que la sincronización automática no lo re-añada.
  try {
    await db.from('club_familia_excluidos').upsert({ familia_id: familiaId, submission_id: submissionId }, { onConflict: 'familia_id,submission_id' })
  } catch (ex) {
    return { ok: false, error: 'Se quitó, pero falta ejecutar migration_familia_excluidos.sql para que no vuelva a añadirse.' }
  }
  await logActivity({ actorEmail: admin.email, accion: 'Desvinculó alumno de familia', entidad: 'club_familia', entidadId: familiaId })
  revalidar()
  return { ok: true }
}

/**
 * Enlace del grupo de WhatsApp de un alumno concreto (club_gestion.whatsapp_url).
 * Es el mismo campo que ve la familia en la ficha del hijo (botón "Unirme al
 * grupo"). Vacío = usa el enlace por defecto del grupo del alumno.
 */
export async function guardarWhatsappAlumno(submissionId: string, url: string) {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error }
  const db = createAdminClient()
  const { error: e } = await db.from('club_gestion').upsert(
    { submission_id: submissionId, whatsapp_url: url.trim() || null, updated_at: new Date().toISOString(), updated_by: admin.email },
    { onConflict: 'submission_id' },
  )
  if (e) return { ok: false, error: e.message }
  revalidar()
  return { ok: true }
}

export async function eliminarFamilia(id: string) {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error }
  const db = createAdminClient()
  const { error: e } = await db.from('club_familias').delete().eq('id', id)
  if (e) return { ok: false, error: e.message }
  await logActivity({ actorEmail: admin.email, accion: 'Eliminó cuenta familiar', entidad: 'club_familia', entidadId: id })
  revalidar()
  return { ok: true }
}
