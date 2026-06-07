'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'

export async function guardarMananaMagica(contenido: Record<string, unknown>, estado: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()
  const { error } = await db.from('eventos_config').upsert({
    id: 'manana-magica', contenido, estado, updated_at: new Date().toISOString(), updated_by: admin.email,
  })
  if (error) return { ok: false, error: error.message }

  await logActivity({
    actorEmail: admin.email,
    accion: `Editó Mañanas Mágicas — personaje: ${contenido.personaje ?? '—'} (${estado})`,
    entidad: 'evento_config', entidadId: 'manana-magica',
  })
  revalidatePath('/admin/manana-magica')
  revalidatePath('/servicios/eventos')
  return { ok: true }
}
