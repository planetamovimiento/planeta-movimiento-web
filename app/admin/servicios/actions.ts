'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'
import { CATALOGO_MAP } from '@/lib/servicios/catalogo'

const CAMPOS_LABEL: Record<string, string> = {
  nombre: 'Nombre', descripcionCorta: 'Descripción corta', descripcionLarga: 'Descripción larga',
  precio: 'Precio', precioDesde: 'Precio desde', iva: 'IVA', fianza: 'Fianza',
  edad: 'Edad', plazas: 'Plazas', horarios: 'Horarios', fechas: 'Fechas',
  estado: 'Estado', destacado: 'Destacado', botonTexto: 'Texto del botón', botonAccion: 'Acción del botón',
  enlace: 'Enlace', imagen: 'Imagen', profesores: 'Profesores', niveles: 'Niveles',
  condiciones: 'Condiciones', notasInternas: 'Notas internas', categoria: 'Categoría', tipo: 'Tipo',
}

/** Guarda un servicio completo y registra el diff (valor anterior → nuevo). */
export async function guardarServicio(id: string, contenido: Record<string, unknown>) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos para editar' }

  const base = CATALOGO_MAP.get(id)
  if (!base) return { ok: false, error: 'Servicio desconocido' }

  const db = createAdminClient()

  // Estado actual (para el diff)
  const { data: actual } = await db.from('services').select('contenido, estado').eq('id', id).maybeSingle()
  const antes: Record<string, unknown> = { ...(base as Record<string, unknown>), ...((actual?.contenido as object) ?? {}), estado: actual?.estado ?? base.estado }

  // Calcular diff legible
  const cambios: string[] = []
  for (const [k, v] of Object.entries(contenido)) {
    const prev = antes[k]
    const a = Array.isArray(prev) ? JSON.stringify(prev) : String(prev ?? '')
    const b = Array.isArray(v) ? JSON.stringify(v) : String(v ?? '')
    if (a !== b && CAMPOS_LABEL[k]) {
      const corto = (s: string) => (s.length > 40 ? s.slice(0, 40) + '…' : s)
      cambios.push(`${CAMPOS_LABEL[k]}: "${corto(a)}" → "${corto(b)}"`)
    }
  }

  const { error } = await db.from('services').upsert({
    id,
    nombre: contenido.nombre ?? base.nombre,
    categoria: contenido.categoria ?? base.categoria,
    entidad: base.entidad,
    estado: contenido.estado ?? base.estado,
    precio: contenido.precio ?? null,
    destacado: contenido.destacado ?? false,
    enlace: contenido.enlace ?? base.enlace,
    contenido,
    updated_at: new Date().toISOString(),
    updated_by: admin.email,
  })
  if (error) return { ok: false, error: error.message }

  await logActivity({
    actorEmail: admin.email,
    accion: `Editó el servicio "${contenido.nombre ?? base.nombre}"`,
    entidad: 'servicio', entidadId: id,
    detalle: cambios.length ? cambios.join(' · ') : 'Sin cambios de valor',
  })

  revalidatePath('/admin/servicios')
  revalidatePath(`/admin/servicios/${id}`)
  if (typeof base.enlace === 'string' && base.enlace.startsWith('/')) revalidatePath(base.enlace)
  return { ok: true, cambios: cambios.length }
}

/** Cambio rápido de estado desde el listado. */
export async function cambiarEstado(id: string, estado: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos' }
  const base = CATALOGO_MAP.get(id)
  const db = createAdminClient()
  const { error } = await db.from('services').upsert({
    id, nombre: base?.nombre, entidad: base?.entidad, estado, updated_at: new Date().toISOString(), updated_by: admin.email,
  })
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: `Servicio "${base?.nombre}" → ${estado}`, entidad: 'servicio', entidadId: id })
  revalidatePath('/admin/servicios')
  return { ok: true }
}
