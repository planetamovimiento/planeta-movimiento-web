import { createAdminClient } from '@/lib/supabase/admin'

export type EventoSeguridad = {
  id: string
  created_at: string
  tipo: string
  ip: string
  form_tipo: string
  motivo: string | null
}

/** Últimos eventos de seguridad (más recientes primero). [] si falta la tabla. */
export async function getEventosSeguridad(limite = 300): Promise<EventoSeguridad[]> {
  try {
    const db = createAdminClient()
    const { data, error } = await db
      .from('security_events')
      .select('id, created_at, tipo, ip, form_tipo, motivo')
      .order('created_at', { ascending: false })
      .limit(limite)
    if (error) return []
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: String(r.id),
      created_at: String(r.created_at ?? ''),
      tipo: String(r.tipo ?? ''),
      ip: String(r.ip ?? ''),
      form_tipo: String(r.form_tipo ?? ''),
      motivo: r.motivo ? String(r.motivo) : null,
    }))
  } catch {
    return []
  }
}
