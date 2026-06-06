'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'

export async function cambiarEstadoFormulario(id: string, estado: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()
  const { error } = await db.from('form_submissions').update({ estado }).eq('id', id)
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: `Solicitud marcada como "${estado}"`, entidad: 'formulario', entidadId: id })
  revalidatePath('/admin/formularios')
  return { ok: true }
}
