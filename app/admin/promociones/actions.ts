'use server'

import { revalidatePath } from 'next/cache'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'
import { savePromos, type Promo } from '@/lib/home/promos'
import { saveResenas, type ResenasHome } from '@/lib/home/resenas'

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

export async function guardarResenas(datos: ResenasHome): Promise<{ ok: boolean; error?: string }> {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }

  const limpio: ResenasHome = {
    nota: (datos.nota || '').trim().slice(0, 5),
    total: Math.max(0, Math.round(Number(datos.total) || 0)),
    enlace: (datos.enlace || '').trim().slice(0, 400),
    items: (datos.items || [])
      .filter(r => r.texto?.trim() && r.nombre?.trim())
      .map(r => ({
        id: r.id || crypto.randomUUID(),
        nombre: r.nombre.trim().slice(0, 60),
        rol: (r.rol || '').trim().slice(0, 60),
        texto: r.texto.trim().slice(0, 600),
        estrellas: Math.min(5, Math.max(1, Math.round(Number(r.estrellas) || 5))),
        activa: r.activa !== false,
      })),
  }

  const ok = await saveResenas(limpio, admin.email)
  if (!ok) return { ok: false, error: 'No se pudo guardar. ¿Has ejecutado migration_global_config.sql?' }

  await logActivity({ actorEmail: admin.email, accion: `Reseñas del inicio (${limpio.items.length})`, entidad: 'home' })
  revalidatePath('/')
  revalidatePath('/admin/promociones')
  return { ok: true }
}
