import { resend } from '@/lib/resend'
import { createAdminClient } from '@/lib/supabase/admin'

// ─────────────────────────────────────────────────────────────────────────────
// Envío centralizado de correos. TODO pasa por aquí para registrarse en
// `email_log` (auditoría de entregas/fallos) y para unificar el destinatario
// interno en info@planetamovimiento.com.
// ─────────────────────────────────────────────────────────────────────────────

/** Remitente público de la web. */
export const FROM_PUBLICO = `Planeta Movimiento <${process.env.RESEND_CONFIRM_FROM || 'info@planetamovimiento.com'}>`

/** Bandeja interna del negocio: TODAS las notificaciones llegan aquí. */
export const NOTIF_TO = process.env.NOTIF_EMAIL || 'info@planetamovimiento.com'

type EnviarArgs = {
  to: string
  subject: string
  html: string
  /** Categoría del correo (para el registro): aviso-interno, confirmacion-cliente, aviso-reserva… */
  tipo: string
  from?: string
  meta?: Record<string, unknown>
}

/**
 * Envía un correo por Resend y lo REGISTRA SIEMPRE en `email_log`
 * (estado enviado/fallido + motivo). Silencioso: nunca rompe el flujo que lo
 * llama (una reserva no falla porque el correo falle).
 */
export async function enviarEmail(p: EnviarArgs): Promise<{ ok: boolean; error?: string }> {
  const to = (p.to || '').trim()
  let ok = false
  let error: string | undefined

  if (!to) {
    error = 'Sin destinatario'
  } else {
    try {
      const r = await resend.emails.send({ from: p.from || FROM_PUBLICO, to, subject: p.subject, html: p.html })
      if (r.error) error = r.error.message || String(r.error)
      else ok = true
    } catch (e) {
      error = e instanceof Error ? e.message : 'Error de envío'
    }
  }

  // Registro de auditoría (nunca rompe el envío).
  try {
    const db = createAdminClient()
    await db.from('email_log').insert({
      tipo: p.tipo,
      destinatario: to || null,
      asunto: p.subject,
      estado: ok ? 'enviado' : 'fallido',
      error: error ?? null,
      meta: p.meta ?? null,
    })
  } catch { /* el log nunca rompe el envío */ }

  return { ok, error }
}
