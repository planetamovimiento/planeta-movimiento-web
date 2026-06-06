import { createClient } from '@supabase/supabase-js'

/**
 * Cliente con service-role (SOLO servidor).
 * Salta las políticas RLS — nunca usar en el navegador.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
