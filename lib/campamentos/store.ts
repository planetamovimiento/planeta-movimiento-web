import { createAdminClient } from '@/lib/supabase/admin'
import { CAMPAMENTOS_DEFAULT, type CampamentosConfig } from './editable'

/** Lee la configuración de campamentos (BD + valores por defecto). Solo servidor. */
export async function getCampamentosConfig(): Promise<CampamentosConfig> {
  try {
    const db = createAdminClient()
    const { data } = await db.from('eventos_config').select('*').eq('id', 'campamentos').maybeSingle()
    const c = (data?.contenido as Partial<CampamentosConfig>) || {}
    return {
      ...CAMPAMENTOS_DEFAULT,
      ...c,
      // arrays/objetos: si no hay guardado, usar el por defecto
      veranoSemanas: c.veranoSemanas?.length ? c.veranoSemanas : CAMPAMENTOS_DEFAULT.veranoSemanas,
      updatedAt: (data?.updated_at as string) ?? null,
      updatedBy: (data?.updated_by as string) ?? null,
    }
  } catch {
    return { ...CAMPAMENTOS_DEFAULT }
  }
}
