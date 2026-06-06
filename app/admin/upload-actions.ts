'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can } from '@/lib/admin/auth'

/**
 * Sube una imagen (jpg/png/webp) al bucket "fotos" de Supabase Storage
 * y devuelve su URL pública. Recibe un FormData con el campo "file".
 */
export async function subirImagen(formData: FormData) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const file = formData.get('file') as File | null
  const carpeta = (formData.get('carpeta') as string) || 'general'
  if (!file || file.size === 0) return { ok: false, error: 'No se ha seleccionado ningún archivo' }
  if (file.size > 10 * 1024 * 1024) return { ok: false, error: 'La imagen supera los 10 MB' }
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
    return { ok: false, error: 'Formato no válido (usa JPG, PNG o WebP)' }
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const nombre = file.name.replace(/\.[^.]+$/, '').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
  const path = `${carpeta}/${nombre || 'img'}-${Date.now()}.${ext}`

  const db = createAdminClient()
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error } = await db.storage.from('fotos').upload(path, buffer, { contentType: file.type, upsert: true })
  if (error) return { ok: false, error: error.message }

  const { data } = db.storage.from('fotos').getPublicUrl(path)
  return { ok: true, url: data.publicUrl }
}
