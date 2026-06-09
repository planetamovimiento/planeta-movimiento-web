'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, logActivity, type AdminRole } from '@/lib/admin/auth'
import { SECCIONES_ASIGNABLES } from '@/lib/admin/secciones'

const IDS_VALIDOS = new Set<string>(SECCIONES_ASIGNABLES.map(s => s.id))
/** Deja solo ids de sección válidos y sin duplicados. */
function limpiarSecciones(secciones: string[]): string[] {
  return [...new Set(secciones)].filter(s => IDS_VALIDOS.has(s))
}

export async function añadirAdmin(email: string, nombre: string, role: AdminRole, secciones: string[] = []) {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'principal') return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()
  // El principal tiene acceso total (secciones = null). El resto, solo lo asignado.
  const secs = role === 'principal' ? null : limpiarSecciones(secciones)
  const { error } = await db.from('admin_users').insert({
    email: email.trim().toLowerCase(), nombre: nombre.trim() || null, role, secciones: secs, invited_by: admin.email, activo: true,
  })
  if (error) return { ok: false, error: error.message.includes('duplicate') ? 'Ese email ya está autorizado.' : error.message }

  await logActivity({ actorEmail: admin.email, accion: `Añadió administrador (${role})`, entidad: 'admin_user', entidadId: email, detalle: email })
  revalidatePath('/admin/administradores')
  return { ok: true }
}

export async function cambiarRol(id: string, email: string, role: AdminRole) {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'principal') return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()
  // Al pasar a principal, acceso total (secciones = null).
  const patch: Record<string, unknown> = { role }
  if (role === 'principal') patch.secciones = null
  const { error } = await db.from('admin_users').update(patch).eq('id', id)
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: `Cambió rol a "${role}"`, entidad: 'admin_user', entidadId: email, detalle: email })
  revalidatePath('/admin/administradores')
  return { ok: true }
}

export async function cambiarSecciones(id: string, email: string, secciones: string[]) {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'principal') return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()
  const { error } = await db.from('admin_users').update({ secciones: limpiarSecciones(secciones) }).eq('id', id)
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: 'Actualizó apartados visibles', entidad: 'admin_user', entidadId: email, detalle: email })
  revalidatePath('/admin/administradores')
  return { ok: true }
}

export async function eliminarAdmin(id: string, email: string) {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'principal') return { ok: false, error: 'Sin permisos' }
  if (email === admin.email) return { ok: false, error: 'No puedes eliminarte a ti mismo.' }

  const db = createAdminClient()
  const { error } = await db.from('admin_users').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: 'Eliminó administrador', entidad: 'admin_user', entidadId: email, detalle: email })
  revalidatePath('/admin/administradores')
  return { ok: true }
}
