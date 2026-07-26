// ─────────────────────────────────────────────────────────────────────────────
// Facturación · lecturas (solo servidor, service-role).
// Las escrituras viven en app/admin/facturacion/actions.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { createAdminClient } from '@/lib/supabase/admin'

/** ¿Se ha ejecutado ya migration_facturacion.sql? Avisa en el panel si falta. */
export async function hayTablasFacturacion(): Promise<boolean> {
  const db = createAdminClient()
  try {
    const { error } = await db.from('billing_profiles').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}
