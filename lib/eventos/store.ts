import { createAdminClient } from '@/lib/supabase/admin'
import { MANANA_MAGICA_DEFAULT, type MananaMagica } from './manana-magica'

/** Lee la configuración de Mañanas Mágicas (BD + valores por defecto). Solo servidor. */
export async function getMananaMagica(): Promise<MananaMagica> {
  try {
    const db = createAdminClient()
    const { data } = await db.from('eventos_config').select('*').eq('id', 'manana-magica').maybeSingle()
    const c = (data?.contenido as Partial<MananaMagica>) || {}
    return {
      ...MANANA_MAGICA_DEFAULT,
      ...c,
      estado: (data?.estado as MananaMagica['estado']) ?? MANANA_MAGICA_DEFAULT.estado,
      updatedAt: (data?.updated_at as string) ?? null,
      updatedBy: (data?.updated_by as string) ?? null,
    }
  } catch {
    return { ...MANANA_MAGICA_DEFAULT }
  }
}
