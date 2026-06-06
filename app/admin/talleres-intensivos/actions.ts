'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'
import { TALLERES } from '@/app/club/talleres-intensivos/config'

export async function guardarTaller(id: string, contenido: Record<string, unknown>, estado: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  const base = TALLERES.find(t => t.id === id)
  if (!base) return { ok: false, error: 'Taller desconocido' }

  const db = createAdminClient()
  const { error } = await db.from('talleres_intensivos').upsert({
    id, contenido, estado, updated_at: new Date().toISOString(), updated_by: admin.email,
  })
  if (error) return { ok: false, error: error.message }

  await logActivity({
    actorEmail: admin.email,
    accion: `Editó el taller intensivo "${contenido.nombre ?? base.nombre}" (${estado})`,
    entidad: 'taller_intensivo', entidadId: id,
  })
  revalidatePath('/admin/talleres-intensivos')
  revalidatePath('/club/talleres-intensivos')
  return { ok: true }
}
