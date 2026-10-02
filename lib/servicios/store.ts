import { createAdminClient } from '@/lib/supabase/admin'
import { CATALOGO_SERVICIOS, CATALOGO_MAP, type ServicioCatalogo } from './catalogo'

// Eventos del centro y Mañanas Mágicas no usan el estado del servicio: el suyo se
// edita en su propio editor (tablas eventos_config / manana_magica). Aquí se
// traduce para que la ficha del panel no diga «próximamente» con reservas abiertas.
const ESTADO_EVENTO: Record<string, ServicioCatalogo['estado']> = {
  abierto: 'activo', completo: 'completo', proximo: 'proximamente',
}

async function estadosDeEventos(): Promise<Record<string, ServicioCatalogo['estado']>> {
  const out: Record<string, ServicioCatalogo['estado']> = {}
  try {
    const db = createAdminClient()
    const { data } = await db.from('eventos_config').select('id, estado')
    for (const r of (data ?? []) as { id: string; estado: string }[]) {
      const e = ESTADO_EVENTO[r.estado]
      if (e) out[r.id] = e
    }
  } catch { /* sin tablas: se queda el estado del catálogo */ }
  return out
}

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
  const estadosEvento = await estadosDeEventos()
  return CATALOGO_SERVICIOS.map(base => {
    const s = merge(base, byId.get(base.id))
    return estadosEvento[base.id] ? { ...s, estado: estadosEvento[base.id] } : s
  })
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
