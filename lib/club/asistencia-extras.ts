// ─────────────────────────────────────────────────────────────────────────────
// Alumnos añadidos a mano a una lista de asistencia (niños de otro grupo que
// vienen un día, recuperaciones…). No son inscripciones del CRM: solo salen en
// la hoja del grupo. Se guardan en global_config como JSON. SOLO SERVIDOR.
// ─────────────────────────────────────────────────────────────────────────────

import { getConfig } from '@/lib/config/store'

export const CLAVE_EXTRAS = 'club_asistencia_extras'

export type ExtraAsistencia = {
  id: string
  actividad: string
  grupo: string
  temporada: string
  nombre: string
  apellidos: string
  /** Texto libre, p. ej. «Viene de Medio 1». */
  nota: string
  /** Si viene solo un día (YYYY-MM-DD); vacío = en todas las listas del grupo. */
  fecha: string
}

export async function getExtras(): Promise<ExtraAsistencia[]> {
  try {
    const v = JSON.parse((await getConfig(CLAVE_EXTRAS)) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

/** Extras de un grupo y temporada; los de un solo día, si caen en el periodo. */
export function extrasDeLista(
  extras: ExtraAsistencia[],
  q: { actividad: string; grupo: string; temporada: string; desde: string; hasta: string },
): ExtraAsistencia[] {
  return extras.filter(e =>
    e.actividad === q.actividad && e.grupo === q.grupo && e.temporada === q.temporada &&
    (!e.fecha || (e.fecha >= q.desde && e.fecha <= q.hasta)))
}
