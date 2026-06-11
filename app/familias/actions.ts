'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getFamiliaUser } from '@/lib/familias/auth'
import { idsDeFamilia } from '@/lib/familias/data'

/** Comprueba que el alumno pertenece a la familia autenticada. Devuelve el email o null. */
async function autorizar(submissionId: string): Promise<string | null> {
  const familia = await getFamiliaUser()
  if (!familia) return null
  const ids = await idsDeFamilia(familia.id)
  if (!ids.includes(submissionId)) return null
  return familia.email
}

/**
 * Sube y fija la foto de perfil de un hijo, SOLO si pertenece a la familia.
 * Guarda en club_gestion.foto_url (mismo campo que ve/edita el admin).
 */
export async function guardarFotoHijo(submissionId: string, formData: FormData) {
  const email = await autorizar(submissionId)
  if (!email) return { ok: false, error: 'Sin permisos' }

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { ok: false, error: 'No se ha seleccionado ninguna imagen' }
  if (file.size > 10 * 1024 * 1024) return { ok: false, error: 'La imagen supera los 10 MB' }
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
    return { ok: false, error: 'Formato no válido (usa JPG, PNG o WebP)' }
  }

  const db = createAdminClient()
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `club-alumnos/${submissionId}-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const up = await db.storage.from('fotos').upload(path, buffer, { contentType: file.type, upsert: true })
  if (up.error) return { ok: false, error: up.error.message }

  const { data } = db.storage.from('fotos').getPublicUrl(path)
  const url = data.publicUrl

  const { error } = await db.from('club_gestion').upsert(
    { submission_id: submissionId, foto_url: url, updated_at: new Date().toISOString(), updated_by: email },
    { onConflict: 'submission_id' }
  )
  if (error) return { ok: false, error: error.message }

  revalidatePath('/familias')
  return { ok: true, url }
}

/** Quita la foto de perfil de un hijo, SOLO si pertenece a la familia. */
export async function quitarFotoHijo(submissionId: string) {
  const email = await autorizar(submissionId)
  if (!email) return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()
  const { error } = await db.from('club_gestion').upsert(
    { submission_id: submissionId, foto_url: null, updated_at: new Date().toISOString(), updated_by: email },
    { onConflict: 'submission_id' }
  )
  if (error) return { ok: false, error: error.message }

  revalidatePath('/familias')
  return { ok: true }
}
