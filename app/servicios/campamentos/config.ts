// ─── Configuración de campamentos ────────────────────────────────────────────
// Actualizar aquí cada año sin tocar el resto del código

export const PRECIO_DIA_SUELTO = 30        // €
export const PRECIO_SEMANA     = 95        // €
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
  lema: string
}

export const SEMANAS_VERANO: SemanaVerano[] = [
  {
    id: 1, elemento: 'Tierra', emoji: '🌍', lema: 'Héroes de la Tierra — Fuerza y resistencia',
    color: 'bg-amber-700', colorText: 'text-amber-700', colorBorder: 'border-amber-400', colorLight: 'bg-amber-50',
    inicio: '2026-06-22', fin: '2026-06-26',
  },
  {
    id: 2, elemento: 'Agua', emoji: '💧', lema: 'Héroes del Agua — Fluidez y adaptación',
    color: 'bg-sky-600', colorText: 'text-sky-600', colorBorder: 'border-sky-400', colorLight: 'bg-sky-50',
    inicio: '2026-06-29', fin: '2026-07-03',
  },
  {
    id: 3, elemento: 'Fuego', emoji: '🔥', lema: 'Héroes del Fuego — Energía y pasión',
    color: 'bg-orange-600', colorText: 'text-orange-600', colorBorder: 'border-orange-400', colorLight: 'bg-orange-50',
    inicio: '2026-07-06', fin: '2026-07-10',
  },
  {
    id: 4, elemento: 'Aire', emoji: '🌬️', lema: 'Héroes del Aire — Agilidad y vuelo',
    color: 'bg-indigo-500', colorText: 'text-indigo-500', colorBorder: 'border-indigo-400', colorLight: 'bg-indigo-50',
    inicio: '2026-07-13', fin: '2026-07-17',
  },
  {
    id: 5, elemento: 'Tierra', emoji: '🌍', lema: 'Héroes de la Tierra — Equilibrio y fuerza',
    color: 'bg-amber-700', colorText: 'text-amber-700', colorBorder: 'border-amber-400', colorLight: 'bg-amber-50',
    inicio: '2026-07-20', fin: '2026-07-24',
  },
  {
    id: 6, elemento: 'Agua', emoji: '💧', lema: 'Héroes del Agua — Coordinación y fluidez',
    color: 'bg-sky-600', colorText: 'text-sky-600', colorBorder: 'border-sky-400', colorLight: 'bg-sky-50',
    inicio: '2026-07-27', fin: '2026-07-31',
  },
  {
    id: 7, elemento: 'Fuego', emoji: '🔥', lema: 'Héroes del Fuego — Destreza y explosividad',
    color: 'bg-orange-600', colorText: 'text-orange-600', colorBorder: 'border-orange-400', colorLight: 'bg-orange-50',
    inicio: '2026-08-03', fin: '2026-08-07',
  },
  {
    id: 8, elemento: 'Aire', emoji: '🌬️', lema: 'Héroes del Aire — Libertad y trabajo en equipo',
    color: 'bg-indigo-500', colorText: 'text-indigo-500', colorBorder: 'border-indigo-400', colorLight: 'bg-indigo-50',
    inicio: '2026-08-10', fin: '2026-08-14',
  },
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
