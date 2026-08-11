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
  cuota: {
    fechaLimiteReducida: string
    reducidaCents: number
    normalCents: number
    /** Beneficios de ser socio (editable). Punto 4. */
    beneficios: string[]
    /** Nº de cuenta para transferencias. Vacío = no se muestra la zona de transferencia. */
    iban: string
    /** Texto sugerido de concepto de la transferencia. */
    conceptoTransferencia: string
  }
  septiembre: {
    activo: boolean
    titulo: string
    intro: string
    semanas: { label: string; fechas: string }[]
    precios: { concepto: string; precio: string }[]
  }
  /** Prefijo del número de socio autogenerado (ej. "CDO-" → CDO-00231). */
  socioPrefijo: string
}

export const CLUB_CONFIG_DEFAULT: ClubConfig = {
  cuota: {
    fechaLimiteReducida: CUOTA.fechaLimiteReducida,
    reducidaCents: CUOTA.reducidaCents,
    normalCents: CUOTA.normalCents,
    beneficios: [
      'Equipación del participante',
      'Reserva de plaza para la temporada',
      'Número de socio',
      'Acceso al Portal de Familias del Club Deportivo Origen',
      'Consulta de la información de tus hijos inscritos',
      'Seguimiento de estados, cobros e información del club',
    ],
    iban: '',
    conceptoTransferencia: 'Cuota socio + nombre del participante',
  },
  septiembre: {
    activo: SEPTIEMBRE.activo,
    titulo: SEPTIEMBRE.titulo,
    intro: SEPTIEMBRE.intro,
    semanas: SEPTIEMBRE.semanas.map(s => ({ ...s })),
    precios: SEPTIEMBRE.precios.map(p => ({ ...p })),
  },
  socioPrefijo: 'CDO-',
}

/** Config de temporada (guardada o, si falta/no válida, la de por defecto). */
export async function getClubConfig(): Promise<ClubConfig> {
  const raw = await getConfig(CLAVE)
  if (!raw) return CLUB_CONFIG_DEFAULT
  try {
    const p = JSON.parse(raw) as Partial<ClubConfig>
    return {
      cuota: {
        ...CLUB_CONFIG_DEFAULT.cuota,
        ...(p.cuota ?? {}),
        beneficios: p.cuota?.beneficios?.length ? p.cuota.beneficios : CLUB_CONFIG_DEFAULT.cuota.beneficios,
      },
      septiembre: {
        ...CLUB_CONFIG_DEFAULT.septiembre,
        ...(p.septiembre ?? {}),
        semanas: p.septiembre?.semanas?.length ? p.septiembre.semanas : CLUB_CONFIG_DEFAULT.septiembre.semanas,
        precios: p.septiembre?.precios?.length ? p.septiembre.precios : CLUB_CONFIG_DEFAULT.septiembre.precios,
      },
      socioPrefijo: p.socioPrefijo || CLUB_CONFIG_DEFAULT.socioPrefijo,
    }
  } catch {
    return CLUB_CONFIG_DEFAULT
  }
}

/** Guarda la config de temporada (JSON). Devuelve ok/false. */
export async function saveClubConfig(cfg: ClubConfig, updatedBy?: string): Promise<boolean> {
  return setConfig(CLAVE, JSON.stringify(cfg), updatedBy)
}
