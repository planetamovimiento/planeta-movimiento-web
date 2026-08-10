'use server'

import { revalidatePath } from 'next/cache'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'
import { setConfig } from '@/lib/config/store'
import { saveClubConfig, type ClubConfig } from '@/lib/club/config'

/** Cambia la temporada activa del Club (afecta a nuevas inscripciones y al hero). */
export async function setTemporadaActiva(temporada: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  const val = (temporada || '').trim()
  if (!val) return { ok: false, error: 'Temporada no válida' }

  const ok = await setConfig('temporada_activa', val, admin.email)
  if (!ok) return { ok: false, error: 'No se pudo guardar. ¿Has ejecutado migration_global_config.sql en Supabase?' }

  await logActivity({ actorEmail: admin.email, accion: `Temporada activa del Club → ${val}`, entidad: 'club', entidadId: 'temporada_activa' })
  revalidatePath('/admin/club')
  revalidatePath('/club')
  return { ok: true }
}

/** Guarda la config editable de temporada (cuota + periodo de septiembre). */
export async function guardarConfigTemporada(cfg: ClubConfig) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const ok = await saveClubConfig(cfg, admin.email)
  if (!ok) return { ok: false, error: 'No se pudo guardar. ¿Has ejecutado migration_global_config.sql en Supabase?' }

  await logActivity({ actorEmail: admin.email, accion: 'Config de temporada del Club actualizada', entidad: 'club', entidadId: 'club_temporada_config' })
  revalidatePath('/admin/club')
  revalidatePath('/club')
  // Las páginas de servicio muestran cuota/septiembre → revalidarlas también.
  for (const s of ['gimnasia-acrobatica', 'telas-aereas', 'escuela-infantil', 'jiu-jitsu', 'escuela-bienestar', 'circo-inclusivo']) {
    revalidatePath(`/servicios/${s}`)
  }
  return { ok: true }
}
