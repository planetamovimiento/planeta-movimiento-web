import { createAdminClient } from '@/lib/supabase/admin'
import { MANANA_MAGICA_DEFAULT, type MananaMagica } from './manana-magica'
import { EVENTOS_CENTRO_DEFAULT, type EventoCentroCfg, type EventoCentroId } from './centro'

/** Lee la configuración de un evento del centro (BD + valores por defecto). Solo servidor. */
export async function getEventoCentro(id: EventoCentroId): Promise<EventoCentroCfg> {
  const base = EVENTOS_CENTRO_DEFAULT[id]
  try {
    const db = createAdminClient()
    const { data } = await db.from('eventos_config').select('*').eq('id', id).maybeSingle()
    const c = (data?.contenido as Partial<EventoCentroCfg>) || {}
    return {
      ...base, ...c,
      estado: (data?.estado as EventoCentroCfg['estado']) ?? base.estado,
      updatedAt: (data?.updated_at as string) ?? null,
      updatedBy: (data?.updated_by as string) ?? null,
    }
  } catch {
    return { ...base }
  }
}

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
