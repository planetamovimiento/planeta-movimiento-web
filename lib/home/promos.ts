import { getConfig, setConfig } from '@/lib/config/store'

// ─────────────────────────────────────────────────────────────────────────────
// Promociones del inicio: tiras destacadas editables desde el admin (inicio de
// temporada del Club, campamentos, un intensivo…). Se guardan como JSON en
// global_config('home_promos') → sin tabla nueva. Estilo de la tira de 50 días.
// ─────────────────────────────────────────────────────────────────────────────

export type Promo = {
  id: string
  etiqueta: string    // texto corto a la izquierda (ej. "Nueva temporada")
  titulo: string      // línea principal
  texto: string       // descripción
  botonTexto: string  // ej. "Apúntate"
  enlace: string      // ruta o URL de destino
  activo: boolean
}

const CLAVE = 'home_promos'

export async function getPromos(): Promise<Promo[]> {
  const raw = await getConfig(CLAVE)
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? (arr as Promo[]) : []
  } catch {
    return []
  }
}

export async function getPromosActivas(): Promise<Promo[]> {
  return (await getPromos()).filter(p => p.activo && (p.titulo?.trim() || p.texto?.trim()) && p.enlace?.trim())
}

export async function savePromos(promos: Promo[], updatedBy?: string): Promise<boolean> {
  return setConfig(CLAVE, JSON.stringify(promos), updatedBy)
}
