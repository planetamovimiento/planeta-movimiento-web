import { createAdminClient } from '@/lib/supabase/admin'
import { TALLERES, type Taller } from '@/app/club/talleres-intensivos/config'

const MAP = new Map(TALLERES.map(t => [t.id, t]))

function merge(base: Taller, row?: Record<string, unknown>): Taller & { updatedAt?: string | null; updatedBy?: string | null } {
  const c = (row?.contenido as Partial<Taller>) || {}
  return {
    ...base,
    ...c,
    id: base.id, icon: base.icon, objetivos: c.objetivos ?? base.objetivos,
    grad: base.grad, colorLight: base.colorLight, colorText: base.colorText, colorBorder: base.colorBorder,
    estado: (row?.estado as Taller['estado']) ?? base.estado,
    updatedAt: (row?.updated_at as string) ?? null,
    updatedBy: (row?.updated_by as string) ?? null,
  }
}

export async function getTalleres(): Promise<Taller[]> {
  let rows: Record<string, unknown>[] = []
  try {
    const db = createAdminClient()
    const { data } = await db.from('talleres_intensivos').select('*')
    rows = data ?? []
  } catch { /* tabla sin migrar: usamos config base */ }
  const byId = new Map(rows.map(r => [r.id as string, r]))
  return TALLERES.map(base => merge(base, byId.get(base.id)))
}

export async function getTaller(id: string) {
  const base = MAP.get(id)
  if (!base) return null
  try {
    const db = createAdminClient()
    const { data } = await db.from('talleres_intensivos').select('*').eq('id', id).maybeSingle()
    return merge(base, data ?? undefined)
  } catch {
    return merge(base)
  }
}
