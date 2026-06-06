import { createAdminClient } from '@/lib/supabase/admin'
import { CATALOGO_SERVICIOS, CATALOGO_MAP, type ServicioCatalogo } from './catalogo'

export type ServicioFull = ServicioCatalogo & { updatedAt?: string | null; updatedBy?: string | null }

/** Fusiona los valores por defecto del catálogo con lo guardado en BD. */
function merge(base: ServicioCatalogo, row?: Record<string, unknown>): ServicioFull {
  if (!row) return { ...base }
  const contenido = (row.contenido as Partial<ServicioCatalogo>) || {}
  return {
    ...base,
    ...contenido,
    // estado/entidad viven como columnas para filtrado y RLS
    estado: (row.estado as ServicioCatalogo['estado']) ?? contenido.estado ?? base.estado,
    entidad: (row.entidad as ServicioCatalogo['entidad']) ?? base.entidad,
    id: base.id, icon: base.icon,
    updatedAt: (row.updated_at as string) ?? null,
    updatedBy: (row.updated_by as string) ?? null,
  }
}

/** Lista completa de servicios (catálogo + cambios guardados). */
export async function getServicios(): Promise<ServicioFull[]> {
  let rows: Record<string, unknown>[] = []
  try {
    const db = createAdminClient()
    const { data } = await db.from('services').select('*')
    rows = data ?? []
  } catch { /* tabla sin migrar: usamos catálogo base */ }
  const byId = new Map(rows.map(r => [r.id as string, r]))
  return CATALOGO_SERVICIOS.map(base => merge(base, byId.get(base.id)))
}

export async function getServicio(id: string): Promise<ServicioFull | null> {
  const base = CATALOGO_MAP.get(id)
  if (!base) return null
  try {
    const db = createAdminClient()
    const { data } = await db.from('services').select('*').eq('id', id).maybeSingle()
    return merge(base, data ?? undefined)
  } catch {
    return { ...base }
  }
}
