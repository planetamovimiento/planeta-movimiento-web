import { getConfig, setConfig } from '@/lib/config/store'

// ─────────────────────────────────────────────────────────────────────────────
// Reseñas de Google que se ven en el inicio ("Lo que dicen de nosotros").
// Se copian desde la ficha de Google y se editan en el panel; se guardan como
// JSON en global_config('home_resenas') → sin tabla nueva.
// ─────────────────────────────────────────────────────────────────────────────

export type Resena = {
  id: string
  nombre: string      // quien la escribió, tal cual sale en Google
  rol: string         // línea pequeña de debajo ("Local Guide · hace 6 meses")
  texto: string
  estrellas: number   // 1-5
  activa: boolean
}

export type ResenasHome = {
  /** Nota media que se enseña ("4,9"). */
  nota: string
  /** Nº total de reseñas en Google. */
  total: number
  /** Enlace a la ficha de Google (ver todas / escribir una). */
  enlace: string
  items: Resena[]
}

const CLAVE = 'home_resenas'

export const ENLACE_GOOGLE_DEFAULT =
  'https://www.google.com/maps/place/Planeta+Movimiento/@40.0521677,-2.1279534,17z'

/** Reseñas reales de la ficha de Google (octubre 2026). Editables desde el panel. */
export const RESENAS_DEFAULT: ResenasHome = {
  nota: '4,9',
  total: 146,
  enlace: ENLACE_GOOGLE_DEFAULT,
  items: [
    {
      id: 'g1', nombre: 'Juan Carlos Armada', rol: 'Local Guide · hace 6 meses', estrellas: 5, activa: true,
      texto: 'Un lugar para niños que no olvidarán. El mejor de Cuenca por las experiencias diferentes que ofrecen y trato cercano y el excepcional cariño con los niños. Carlos y el resto del equipo son maravillosos.',
    },
    {
      id: 'g2', nombre: 'Ana Olivares', rol: 'Hace 5 meses', estrellas: 5, activa: true,
      texto: 'Cumpleaños de 10. Buena atención, buenos materiales y actividades y con personal cualificado. Solo hay un cumpleaños en el recinto, lo que hace que todos los niñ@s estén juntos y divirtiéndose.',
    },
    {
      id: 'g3', nombre: 'Victor Lopez Rendon', rol: 'Hace un año', estrellas: 5, activa: true,
      texto: 'Fantásticas instalaciones y personal muy agradable, perfecto para celebrar cumpleaños aparte de que imparten mucha variedad de actividades.',
    },
  ],
}

export async function getResenas(): Promise<ResenasHome> {
  const raw = await getConfig(CLAVE)
  if (!raw) return RESENAS_DEFAULT
  try {
    const j = JSON.parse(raw) as Partial<ResenasHome>
    return {
      nota: j.nota || RESENAS_DEFAULT.nota,
      total: Number(j.total) || RESENAS_DEFAULT.total,
      enlace: j.enlace || ENLACE_GOOGLE_DEFAULT,
      items: Array.isArray(j.items) ? (j.items as Resena[]) : [],
    }
  } catch {
    return RESENAS_DEFAULT
  }
}

/** Las que se pintan en la web (activas y con texto). */
export async function getResenasActivas(): Promise<ResenasHome> {
  const r = await getResenas()
  return { ...r, items: r.items.filter(x => x.activa && x.texto.trim()) }
}

export async function saveResenas(datos: ResenasHome, updatedBy?: string): Promise<boolean> {
  return setConfig(CLAVE, JSON.stringify(datos), updatedBy)
}
