'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'
import { PRODUCTOS } from '@/app/colchonetas/productos'

export async function guardarProducto(id: string, contenido: Record<string, unknown>) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  const base = PRODUCTOS.find(p => p.id === id)
  if (!base) return { ok: false, error: 'Producto desconocido' }

  const db = createAdminClient()
  const { data: actual } = await db.from('products').select('contenido').eq('id', id).maybeSingle()
  const antes = { ...(base as Record<string, unknown>), ...((actual?.contenido as object) ?? {}) }

  const cambios: string[] = []
  for (const [k, v] of Object.entries(contenido)) {
    const a = JSON.stringify((antes as Record<string, unknown>)[k] ?? '')
    const b = JSON.stringify(v ?? '')
    if (a !== b) cambios.push(k)
  }

  const { error } = await db.from('products').upsert({
    id,
    nombre: contenido.nombre ?? base.nombre,
    precio: contenido.precioDesde ?? base.precioDesde,
    activo: contenido.activo ?? true,
    stock: contenido.stock ?? null,
    contenido,
    updated_at: new Date().toISOString(),
    updated_by: admin.email,
  })
  if (error) return { ok: false, error: error.message }

  await logActivity({
    actorEmail: admin.email,
    accion: `Editó el producto "${contenido.nombre ?? base.nombre}"`,
    entidad: 'producto', entidadId: id,
    detalle: cambios.length ? `Campos: ${cambios.join(', ')}` : 'Sin cambios',
  })
  revalidatePath('/admin/productos')
  revalidatePath('/colchonetas')
  return { ok: true, cambios: cambios.length }
}
