import { createAdminClient } from '@/lib/supabase/admin'

export type TipoEvento = 'envio' | 'bot' | 'spam' | 'rate-limit' | 'login' | 'bloqueo'

/** Registra un evento de seguridad. Silencioso: nunca rompe el flujo que lo llama. */
export async function registrarEvento(e: {
  tipo: TipoEvento
  ip?: string
  formTipo?: string
  motivo?: string | null
  detalle?: Record<string, unknown>
}): Promise<void> {
  try {
    const db = createAdminClient()
    await db.from('security_events').insert({
      tipo: e.tipo,
      ip: e.ip || null,
      form_tipo: e.formTipo || null,
      motivo: e.motivo ?? null,
      detalle: e.detalle ?? null,
    })
  } catch { /* el log nunca rompe el envío */ }
}

/** Nº de eventos de una IP en los últimos `ventanaMs` (para rate-limit). */
export async function contarEventosIp(ip: string, ventanaMs: number): Promise<number> {
  if (!ip) return 0
  try {
    const db = createAdminClient()
    const desde = new Date(Date.now() - ventanaMs).toISOString()
    const { count } = await db
      .from('security_events')
      .select('id', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', desde)
    return count ?? 0
  } catch {
    return 0
  }
}
