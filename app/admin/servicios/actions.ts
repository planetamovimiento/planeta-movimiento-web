'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'

export async function guardarServicio(servicio: {
  id: string; nombre: string; categoria: string; estado: string; precio: number | null
}) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()
  const { error } = await db.from('services').upsert({
    id: servicio.id, nombre: servicio.nombre, categoria: servicio.categoria,
    estado: servicio.estado, precio: servicio.precio, updated_at: new Date().toISOString(),
  })
  if (error) return { ok: false, error: error.message }

  await logActivity({ actorEmail: admin.email, accion: `Servicio "${servicio.nombre}" → ${servicio.estado}`, entidad: 'servicio', entidadId: servicio.id })
  revalidatePath('/admin/servicios')
  return { ok: true }
}
