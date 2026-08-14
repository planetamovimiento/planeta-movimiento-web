'use server'

import { revalidatePath } from 'next/cache'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'
import { savePromos, type Promo } from '@/lib/home/promos'

export async function guardarPromos(promos: Promo[]): Promise<{ ok: boolean; error?: string }> {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const limpios: Promo[] = (promos || [])
    .filter(p => (p.titulo?.trim() || p.texto?.trim()) && p.enlace?.trim())
    .map(p => ({
      id: p.id || crypto.randomUUID(),
      etiqueta: (p.etiqueta || '').trim().slice(0, 40),
      titulo: (p.titulo || '').trim().slice(0, 90),
      texto: (p.texto || '').trim().slice(0, 240),
      botonTexto: (p.botonTexto || '').trim().slice(0, 30) || 'Ver más',
      enlace: (p.enlace || '').trim().slice(0, 300),
      activo: p.activo !== false,
    }))

  const ok = await savePromos(limpios, admin.email)
  if (!ok) return { ok: false, error: 'No se pudo guardar. ¿Has ejecutado migration_global_config.sql?' }

  await logActivity({ actorEmail: admin.email, accion: `Promociones del inicio (${limpios.length})`, entidad: 'home' })
  revalidatePath('/')
  revalidatePath('/admin/promociones')
  return { ok: true }
}
