import { createAdminClient } from '@/lib/supabase/admin'
import { getClubConfig } from '@/lib/club/config'

// ─────────────────────────────────────────────────────────────────────────────
// Número de socio a nivel FAMILIA (credencial del Portal de Familias).
// Formato: <prefijo><correlativo 5 díg> (ej. CDO-00231). Prefijo configurable.
// ─────────────────────────────────────────────────────────────────────────────

/** Normaliza para comparar credenciales: sin espacios, mayúsculas. */
export function normalizarNumeroSocio(v: string): string {
  return (v || '').trim().toUpperCase().replace(/\s+/g, '')
}

/**
 * Genera el siguiente nº de socio libre para el prefijo configurado.
 * ponytail: correlativo por max+1; el índice único de la BD atrapa colisiones
 * concurrentes (volumen bajo). No reutiliza ni renumera los existentes.
 */
export async function siguienteNumeroSocio(): Promise<string> {
  const cfg = await getClubConfig()
  const prefijo = (cfg.socioPrefijo || 'CDO-').trim()
  const db = createAdminClient()
  const { data } = await db.from('club_familias').select('numero_socio').ilike('numero_socio', `${prefijo}%`)
  let max = 0
  for (const r of (data ?? []) as { numero_socio: string | null }[]) {
    const m = String(r.numero_socio ?? '').match(/(\d+)\s*$/)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  return `${prefijo}${String(max + 1).padStart(5, '0')}`
}
