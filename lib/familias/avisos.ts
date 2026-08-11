import { getConfig, setConfig } from '@/lib/config/store'

// ─────────────────────────────────────────────────────────────────────────────
// Avisos del club visibles para las familias (cambio de horario, gala, festivo,
// reunión, equipación…). Se guardan como JSON en global_config('club_avisos') →
// sin tabla nueva. Los publica el admin; el portal muestra solo los activos.
// ─────────────────────────────────────────────────────────────────────────────

export type Aviso = { id: string; titulo: string; cuerpo: string; activo: boolean }

const CLAVE = 'club_avisos'

export async function getAvisos(): Promise<Aviso[]> {
  const raw = await getConfig(CLAVE)
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? (arr as Aviso[]) : []
  } catch {
    return []
  }
}

export async function getAvisosActivos(): Promise<Aviso[]> {
  return (await getAvisos()).filter(a => a.activo && (a.titulo?.trim() || a.cuerpo?.trim()))
}

export async function saveAvisos(avisos: Aviso[], updatedBy?: string): Promise<boolean> {
  return setConfig(CLAVE, JSON.stringify(avisos), updatedBy)
}
