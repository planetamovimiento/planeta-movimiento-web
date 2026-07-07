// ─────────────────────────────────────────────────────────────────────────────
// Configuración global editable (tabla global_config, clave/valor). SOLO servidor.
// Uso actual: 'temporada_activa' del Club Deportivo Origen.
// ─────────────────────────────────────────────────────────────────────────────

import { createAdminClient } from '@/lib/supabase/admin'
import { TEMPORADA_ACTUAL } from '@/lib/club/constants'

/** Lee un valor de configuración global (o null si no existe / falta la tabla). */
export async function getConfig(clave: string): Promise<string | null> {
  try {
    const db = createAdminClient()
    const { data } = await db.from('global_config').select('valor').eq('clave', clave).maybeSingle()
    return (data as { valor?: string } | null)?.valor ?? null
  } catch {
    return null
  }
}

/** Guarda (upsert) un valor de configuración global. */
export async function setConfig(clave: string, valor: string, updatedBy?: string): Promise<boolean> {
  try {
    const db = createAdminClient()
    const { error } = await db.from('global_config').upsert(
      { clave, valor, updated_at: new Date().toISOString(), updated_by: updatedBy ?? null },
      { onConflict: 'clave' },
    )
    return !error
  } catch {
    return false
  }
}

/** Temporada activa del Club (config editable desde admin; fallback a la constante). */
export async function getTemporadaActiva(): Promise<string> {
  return (await getConfig('temporada_activa')) || TEMPORADA_ACTUAL
}
