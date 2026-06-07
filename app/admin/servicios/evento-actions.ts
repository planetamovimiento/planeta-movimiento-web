'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'

const PERMITIDOS = ['dias-sin-cole', 'domingos', 'halloween', 'manana-magica', 'campamentos']

/** Guarda la configuración editable de un evento del centro en eventos_config. */
export async function guardarEventoConfig(id: string, contenido: Record<string, unknown>, estado: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  if (!PERMITIDOS.includes(id)) return { ok: false, error: 'Evento no válido' }

  const db = createAdminClient()
  const { error } = await db.from('eventos_config').upsert({
    id, contenido, estado, updated_at: new Date().toISOString(), updated_by: admin.email,
  })
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: `Editó el evento "${id}" (${estado})`, entidad: 'evento_config', entidadId: id })
  revalidatePath('/admin/servicios')
  revalidatePath('/servicios/eventos')
  return { ok: true }
}
