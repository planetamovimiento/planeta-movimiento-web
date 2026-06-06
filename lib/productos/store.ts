import { createAdminClient } from '@/lib/supabase/admin'
import { PRODUCTOS, type Producto } from '@/app/colchonetas/productos'

export type ProductoFull = Producto & {
  activo: boolean
  stock: number | null
  estado: string
  updatedAt?: string | null
  updatedBy?: string | null
}

const MAP = new Map(PRODUCTOS.map(p => [p.id, p]))

function merge(base: Producto, row?: Record<string, unknown>): ProductoFull {
  const contenido = (row?.contenido as Partial<Producto> & { activo?: boolean; stock?: number; estado?: string }) || {}
  return {
    ...base,
    ...contenido,
    id: base.id,
    activo: row?.activo as boolean ?? contenido.activo ?? true,
    stock: (row?.stock as number) ?? contenido.stock ?? null,
    estado: contenido.estado ?? (row?.activo === false ? 'inactivo' : 'activo'),
    updatedAt: (row?.updated_at as string) ?? null,
    updatedBy: (row?.updated_by as string) ?? null,
  }
}

export async function getProductos(): Promise<ProductoFull[]> {
  let rows: Record<string, unknown>[] = []
  try {
    const db = createAdminClient()
    const { data } = await db.from('products').select('*')
    rows = data ?? []
  } catch { /* sin migrar */ }
  const byId = new Map(rows.map(r => [r.id as string, r]))
  return PRODUCTOS.map(base => merge(base, byId.get(base.id)))
}

export async function getProducto(id: string): Promise<ProductoFull | null> {
  const base = MAP.get(id)
  if (!base) return null
  try {
    const db = createAdminClient()
    const { data } = await db.from('products').select('*').eq('id', id).maybeSingle()
    return merge(base, data ?? undefined)
  } catch {
    return merge(base)
  }
}
