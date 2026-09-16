import { createAdminClient } from '@/lib/supabase/admin'

// ─────────────────────────────────────────────────────────────────────────────
// Número de socio a nivel FAMILIA (credencial del Portal de Familias).
// Formato: correlativo simple ("1", "2" … "43"), como los ya asignados.
// ─────────────────────────────────────────────────────────────────────────────

/** Normaliza para comparar credenciales: sin espacios, mayúsculas. */
export function normalizarNumeroSocio(v: string): string {
  return (v || '').trim().toUpperCase().replace(/\s+/g, '')
}

/**
 * Genera el siguiente nº de socio: el mayor ya usado + 1 (acepta antiguos con prefijo, "CDO-00042").
 * ponytail: correlativo por max+1; el índice único de la BD atrapa colisiones
 * concurrentes (volumen bajo). No reutiliza ni renumera los existentes.
 */
export async function siguienteNumeroSocio(): Promise<string> {
  const db = createAdminClient()
  const { data } = await db.from('club_familias').select('numero_socio').not('numero_socio', 'is', null)
  let max = 0
  for (const r of (data ?? []) as { numero_socio: string | null }[]) {
    const m = String(r.numero_socio ?? '').match(/(\d+)\s*$/)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  return String(max + 1)
}
