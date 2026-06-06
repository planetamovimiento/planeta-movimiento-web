// ─── Configuración de campamentos ────────────────────────────────────────────
// Actualizar aquí cada año sin tocar el resto del código

export const PRECIO_DIA_SUELTO = 25        // €
export const PRECIO_SEMANA     = 95        // €
export const PRECIO_MATINAL    = 5         // € por niño y día (8:00–9:00)
export const PRECIO_VESPERTINO = 5         // € por niño y día (14:00–15:00)
export const DESCUENTO_HERMANOS = 0.15     // 15%
export const CUPON_HERMANOS    = 'HERMANOS'

// ── Navidad 2025-2026 ──────────────────────────────────────────────────────
export const FECHAS_NAVIDAD: string[] = [
  '2025-12-26', '2025-12-27', '2025-12-28', '2025-12-29', '2025-12-30',
]

// ── Semana Santa 2026 ──────────────────────────────────────────────────────
export const FECHAS_SEMANA_SANTA: string[] = [
  '2026-03-30', '2026-03-31', '2026-04-01', '2026-04-02', '2026-04-03',
]

// ── Verano 2026 — 8 semanas (22 jun – 14 ago, L-V) ────────────────────────
export type SemanaVerano = {
  id: number
  elemento: 'Tierra' | 'Agua' | 'Fuego' | 'Aire'
  emoji: string
  color: string       // Tailwind bg class
  colorText: string   // Tailwind text class
  colorBorder: string
  colorLight: string
  inicio: string      // YYYY-MM-DD lunes
  fin: string         // YYYY-MM-DD viernes
  sentido: string     // sentido sensorial protagonista
  lema: string
  descripcion: string
}

// Cada elemento trabaja un sentido a través de experiencias sensoriales,
// exploración, creatividad y juego (temática Escuela de Superhéroes).
const TIERRA = {
  sentido: 'El tacto', emoji: '🌍',
  lema: 'Tierra · El sentido del tacto',
  descripcion: 'Una semana para tocar, sentir y descubrir. Exploramos texturas, materiales y la percepción del propio cuerpo a través del movimiento y el juego sensorial.',
  color: 'bg-amber-700', colorText: 'text-amber-700', colorBorder: 'border-amber-400', colorLight: 'bg-amber-50',
}
const AGUA = {
  sentido: 'Olfato y gusto', emoji: '💧',
  lema: 'Agua · Olfato y gusto',
  descripcion: 'Aromas, sabores y experimentación. Una semana refrescante de descubrimiento a través del olfato y el gusto, con dinámicas creativas y juegos de agua.',
  color: 'bg-sky-600', colorText: 'text-sky-600', colorBorder: 'border-sky-400', colorLight: 'bg-sky-50',
}
const FUEGO = {
  sentido: 'La vista', emoji: '🔥',
  lema: 'Fuego · El sentido de la vista',
  descripcion: 'Color, luz y observación. Estimulamos la percepción visual y la creatividad con retos de atención, contrastes y experiencias llenas de color.',
  color: 'bg-orange-600', colorText: 'text-orange-600', colorBorder: 'border-orange-400', colorLight: 'bg-orange-50',
}
const AIRE = {
  sentido: 'El oído', emoji: '🌬️',
  lema: 'Aire · El sentido del oído',
  descripcion: 'Sonidos, ritmo y música. Exploramos el mundo a través de la escucha, con juegos sonoros, percusión y actividades que despiertan el oído.',
  color: 'bg-indigo-500', colorText: 'text-indigo-500', colorBorder: 'border-indigo-400', colorLight: 'bg-indigo-50',
}

export const SEMANAS_VERANO: SemanaVerano[] = [
  { id: 1, elemento: 'Tierra', ...TIERRA, inicio: '2026-06-22', fin: '2026-06-26' },
  { id: 2, elemento: 'Agua',   ...AGUA,   inicio: '2026-06-29', fin: '2026-07-03' },
  { id: 3, elemento: 'Fuego',  ...FUEGO,  inicio: '2026-07-06', fin: '2026-07-10' },
  { id: 4, elemento: 'Aire',   ...AIRE,   inicio: '2026-07-13', fin: '2026-07-17' },
  { id: 5, elemento: 'Tierra', ...TIERRA, inicio: '2026-07-20', fin: '2026-07-24' },
  { id: 6, elemento: 'Agua',   ...AGUA,   inicio: '2026-07-27', fin: '2026-07-31' },
  { id: 7, elemento: 'Fuego',  ...FUEGO,  inicio: '2026-08-03', fin: '2026-08-07' },
  { id: 8, elemento: 'Aire',   ...AIRE,   inicio: '2026-08-10', fin: '2026-08-14' },
]

// Genera los días L-V de una semana
export function diasDeSemana(semana: SemanaVerano): string[] {
  const days: string[] = []
  const start = new Date(semana.inicio + 'T12:00:00')
  for (let i = 0; i < 5; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export function formatDia(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric' }).format(d)
}

export function formatFechaLarga(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
}
