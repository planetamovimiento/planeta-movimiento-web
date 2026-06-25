import { createAdminClient } from '@/lib/supabase/admin'

export type EmailLog = {
  id: string
  created_at: string
  tipo: string
  destinatario: string
  asunto: string
  estado: string
  error: string | null
}

/** Últimos correos registrados (más recientes primero). [] si falta la tabla. */
export async function getEmailLog(limite = 200): Promise<EmailLog[]> {
  try {
    const db = createAdminClient()
    const { data, error } = await db
      .from('email_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limite)
    if (error) return []
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: String(r.id),
      created_at: String(r.created_at ?? ''),
      tipo: String(r.tipo ?? ''),
      destinatario: String(r.destinatario ?? ''),
      asunto: String(r.asunto ?? ''),
      estado: String(r.estado ?? ''),
      error: r.error ? String(r.error) : null,
    }))
  } catch {
    return []
  }
}
