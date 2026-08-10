// ─────────────────────────────────────────────────────────────────────────────
// Configuración editable de la temporada del Club (global_config, clave JSON
// 'club_temporada_config'). Los valores de lib/club/{cuota,septiembre}.ts son el
// FALLBACK por defecto; el admin los puede sobrescribir sin tocar código.
// SOLO servidor (usa lib/config/store). Importes en céntimos.
// ─────────────────────────────────────────────────────────────────────────────

import { getConfig, setConfig } from '@/lib/config/store'
import { CUOTA } from './cuota'
import { SEPTIEMBRE } from './septiembre'

const CLAVE = 'club_temporada_config'

export type ClubConfig = {
  cuota: { fechaLimiteReducida: string; reducidaCents: number; normalCents: number }
  septiembre: {
    activo: boolean
    titulo: string
    intro: string
    semanas: { label: string; fechas: string }[]
    precios: { concepto: string; precio: string }[]
  }
}

export const CLUB_CONFIG_DEFAULT: ClubConfig = {
  cuota: {
    fechaLimiteReducida: CUOTA.fechaLimiteReducida,
    reducidaCents: CUOTA.reducidaCents,
    normalCents: CUOTA.normalCents,
  },
  septiembre: {
    activo: SEPTIEMBRE.activo,
    titulo: SEPTIEMBRE.titulo,
    intro: SEPTIEMBRE.intro,
    semanas: SEPTIEMBRE.semanas.map(s => ({ ...s })),
    precios: SEPTIEMBRE.precios.map(p => ({ ...p })),
  },
}

/** Config de temporada (guardada o, si falta/no válida, la de por defecto). */
export async function getClubConfig(): Promise<ClubConfig> {
  const raw = await getConfig(CLAVE)
  if (!raw) return CLUB_CONFIG_DEFAULT
  try {
    const p = JSON.parse(raw) as Partial<ClubConfig>
    return {
      cuota: { ...CLUB_CONFIG_DEFAULT.cuota, ...(p.cuota ?? {}) },
      septiembre: {
        ...CLUB_CONFIG_DEFAULT.septiembre,
        ...(p.septiembre ?? {}),
        semanas: p.septiembre?.semanas?.length ? p.septiembre.semanas : CLUB_CONFIG_DEFAULT.septiembre.semanas,
        precios: p.septiembre?.precios?.length ? p.septiembre.precios : CLUB_CONFIG_DEFAULT.septiembre.precios,
      },
    }
  } catch {
    return CLUB_CONFIG_DEFAULT
  }
}

/** Guarda la config de temporada (JSON). Devuelve ok/false. */
export async function saveClubConfig(cfg: ClubConfig, updatedBy?: string): Promise<boolean> {
  return setConfig(CLAVE, JSON.stringify(cfg), updatedBy)
}
