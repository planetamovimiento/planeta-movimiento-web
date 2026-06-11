'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, logActivity } from '@/lib/admin/auth'
import { puedeVerSeccion } from '@/lib/admin/secciones'
import type { EstadoFamilia } from '@/lib/familias/tipos'
import { sincronizarFamilias } from '@/lib/familias/sync'

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
  revalidar()
  return { ok: true }
}

export async function desvincularAlumno(familiaId: string, submissionId: string) {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error }
  const db = createAdminClient()
  const { error: e } = await db.from('club_familia_alumnos').delete().eq('familia_id', familiaId).eq('submission_id', submissionId)
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
