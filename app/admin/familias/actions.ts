'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, logActivity } from '@/lib/admin/auth'
import { puedeVerSeccion } from '@/lib/admin/secciones'
import type { EstadoFamilia } from '@/lib/familias/tipos'

type Row = Record<string, unknown>
const txt = (v?: string | null) => (typeof v === 'string' && v.trim() ? v.trim() : null)
const str = (v: unknown) => (typeof v === 'string' ? v : '')
const revalidar = () => revalidatePath('/admin/familias')

async function exigir() {
  const admin = await getAdminUser()
  if (!admin) return { admin: null, error: 'Sin sesión' }
  if (!puedeVerSeccion(admin.role, admin.secciones, 'familias')) return { admin: null, error: 'Sin acceso al Portal de Familias' }
  if (admin.role === 'lectura') return { admin: null, error: 'No tienes permisos de edición' }
  return { admin, error: null as string | null }
}

/** Crea cuentas familiares (por correo del tutor) y vincula sus alumnos. Idempotente. */
export async function generarFamiliasDesdeCRM() {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error }
  const db = createAdminClient()

  const [subsRes, famsRes, linksRes] = await Promise.all([
    db.from('form_submissions').select('id, email, telefono, datos').eq('tipo', 'inscripcion_club'),
    db.from('club_familias').select('id, email'),
    db.from('club_familia_alumnos').select('familia_id, submission_id'),
  ])
  const subs = (subsRes.data ?? []) as Row[]
  const famByEmail = new Map<string, string>(((famsRes.data ?? []) as Row[]).map(f => [str(f.email), str(f.id)]))
  const linkSet = new Set(((linksRes.data ?? []) as Row[]).map(l => `${str(l.familia_id)}|${str(l.submission_id)}`))

  // Datos de tutor por email (primera aparición).
  const infoEmail = new Map<string, { nombre: string | null; telefono: string | null }>()
  const subsValidos = subs.filter(s => str(s.email).trim())
  for (const s of subsValidos) {
    const email = str(s.email).trim().toLowerCase()
    if (infoEmail.has(email)) continue
    const datos = (s.datos ?? {}) as Record<string, unknown>
    infoEmail.set(email, { nombre: txt(str(datos.tutorLegal)), telefono: txt(str(s.telefono)) })
  }

  // Crear familias nuevas (bloque).
  let nuevasFamilias = 0
  const nuevosEmails = [...infoEmail.keys()].filter(e => !famByEmail.has(e))
  if (nuevosEmails.length) {
    const rows = nuevosEmails.map(e => ({ email: e, nombre: infoEmail.get(e)!.nombre, telefono: infoEmail.get(e)!.telefono, estado: 'activo' }))
    const { data: creadas } = await db.from('club_familias').insert(rows).select('id, email')
    for (const f of (creadas ?? []) as Row[]) { famByEmail.set(str(f.email), str(f.id)); nuevasFamilias++ }
  }

  // Vínculos nuevos (bloque).
  const nuevosLinks: { familia_id: string; submission_id: string }[] = []
  for (const s of subsValidos) {
    const famId = famByEmail.get(str(s.email).trim().toLowerCase())
    if (!famId) continue
    const key = `${famId}|${str(s.id)}`
    if (!linkSet.has(key)) { linkSet.add(key); nuevosLinks.push({ familia_id: famId, submission_id: str(s.id) }) }
  }
  let nuevosVinculos = 0
  if (nuevosLinks.length) {
    const { error: e } = await db.from('club_familia_alumnos').insert(nuevosLinks)
    if (!e) nuevosVinculos = nuevosLinks.length
  }

  await logActivity({ actorEmail: admin.email, accion: `Generó familias desde CRM (+${nuevasFamilias} cuentas, +${nuevosVinculos} vínculos)`, entidad: 'club_familia' })
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
