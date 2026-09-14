import { getConfig, setConfig } from '@/lib/config/store'

// ─────────────────────────────────────────────────────────────────────────────
// Monitores asignados a mano a un evento del calendario de la empresa.
// { [eventoId]: monitorId[] } — el eventoId es el mismo que usa el calendario
// (r-booking-…, dsc-AAAA-MM-DD, m-…). El monitor lo ve en su calendario.
// ─────────────────────────────────────────────────────────────────────────────

const CLAVE = 'calendario_monitores'

export async function getAsignacionesCalendario(): Promise<Record<string, string[]>> {
  const raw = await getConfig(CLAVE)
  try {
    const j = raw ? JSON.parse(raw) : {}
    return j && typeof j === 'object' && !Array.isArray(j) ? j : {}
  } catch {
    return {}
  }
}

/**
 * ponytail: un único valor en global_config (el último que guarda gana), igual
 * que las reglas de los monitores. Pasar a tabla si se edita desde varios sitios a la vez.
 */
export async function setAsignacionEvento(eventoId: string, monitorIds: string[], updatedBy?: string): Promise<boolean> {
  const todas = await getAsignacionesCalendario()
  const ids = [...new Set(monitorIds.filter(Boolean))]
  if (ids.length) todas[eventoId] = ids
  else delete todas[eventoId]
  return setConfig(CLAVE, JSON.stringify(todas), updatedBy)
}
