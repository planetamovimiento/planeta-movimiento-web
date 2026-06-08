// ─────────────────────────────────────────────────────────────────────────────
// Configuración EDITABLE de los campamentos (Navidad, Semana Santa, Verano).
// Archivo puro (sin imports de servidor) → usable en cliente.
// Se edita desde el panel (Servicios → Campamentos) y se guarda en eventos_config.
// ─────────────────────────────────────────────────────────────────────────────

import type { EstadoMM } from '@/lib/eventos/manana-magica'

export type Elemento = 'Tierra' | 'Agua' | 'Fuego' | 'Aire'
export type SemanaCfg = { id: number; elemento: Elemento; inicio: string; fin: string }

export type CampamentosConfig = {
  // Precios (verano)
  precioDiaSuelto: number
  precioSemana: number
  precioMatinal: number
  precioVespertino: number
  descuentoHermanos: number   // % (ej. 15)
  cuponHermanos: string
  // Navidad
  navidadFechas: string        // una fecha YYYY-MM-DD por línea
  navidadHorario: string
  navidadEstado: EstadoMM
  navidadDescripcion: string
  navidadImagen: string
  // Semana Santa
  ssantaFechas: string
  ssantaHorario: string
  ssantaEstado: EstadoMM
  ssantaDescripcion: string
  ssantaImagen: string
  // Verano
  veranoSemanas: SemanaCfg[]
  veranoHorario: string
  veranoEstado: EstadoMM
  veranoDescripcion: string
  veranoImagen: string
  updatedAt?: string | null
  updatedBy?: string | null
}

export const CAMPAMENTOS_DEFAULT: CampamentosConfig = {
  precioDiaSuelto: 25, precioSemana: 95, precioMatinal: 5, precioVespertino: 5,
  descuentoHermanos: 15, cuponHermanos: 'HERMANOS',
  navidadFechas: ['2025-12-26', '2025-12-27', '2025-12-28', '2025-12-29', '2025-12-30'].join('\n'),
  navidadHorario: '9:00 – 14:00', navidadEstado: 'abierto',
  navidadDescripcion: 'Durante estos días los niños vivirán una aventura única en nuestra Escuela de Superhéroes, llena de retos, actividades y dinámicas que desarrollan sus habilidades motrices mientras se lo pasan en grande.',
  navidadImagen: '/fotos/campamento-navidad/1.webp',
  ssantaFechas: ['2026-03-30', '2026-03-31', '2026-04-01', '2026-04-02', '2026-04-03'].join('\n'),
  ssantaHorario: '9:00 – 14:00', ssantaEstado: 'abierto',
  ssantaDescripcion: 'El campamento de Semana Santa sigue el mismo formato de Escuela de Superhéroes: jornadas de movimiento, creatividad y juego en equipo con todas las disciplinas del club.',
  ssantaImagen: '/fotos/campamento-semana-santa/1.webp',
  veranoDescripcion: 'Ocho semanas de Escuela de Superhéroes. Cada semana trabaja un elemento y un sentido a través de experiencias sensoriales, exploración, creatividad y juego.',
  veranoImagen: '/fotos/campamento-verano/1.webp',
  veranoSemanas: [
    { id: 1, elemento: 'Tierra', inicio: '2026-06-22', fin: '2026-06-26' },
    { id: 2, elemento: 'Agua', inicio: '2026-06-29', fin: '2026-07-03' },
    { id: 3, elemento: 'Fuego', inicio: '2026-07-06', fin: '2026-07-10' },
    { id: 4, elemento: 'Aire', inicio: '2026-07-13', fin: '2026-07-17' },
    { id: 5, elemento: 'Tierra', inicio: '2026-07-20', fin: '2026-07-24' },
    { id: 6, elemento: 'Agua', inicio: '2026-07-27', fin: '2026-07-31' },
    { id: 7, elemento: 'Fuego', inicio: '2026-08-03', fin: '2026-08-07' },
    { id: 8, elemento: 'Aire', inicio: '2026-08-10', fin: '2026-08-14' },
  ],
  veranoHorario: '9:00 – 14:00', veranoEstado: 'abierto',
}

// Metadata visual/sensorial por elemento (NO editable, solo estética).
export const META_ELEMENTO: Record<Elemento, {
  emoji: string; sentido: string; lema: string; descripcion: string
  color: string; colorText: string; colorBorder: string; colorLight: string
}> = {
  Tierra: { sentido: 'El tacto', emoji: '🌍', lema: 'Tierra · El sentido del tacto', descripcion: 'Una semana para tocar, sentir y descubrir. Texturas, materiales y percepción del cuerpo a través del movimiento y el juego sensorial.', color: 'bg-amber-700', colorText: 'text-amber-700', colorBorder: 'border-amber-400', colorLight: 'bg-amber-50' },
  Agua: { sentido: 'Olfato y gusto', emoji: '💧', lema: 'Agua · Olfato y gusto', descripcion: 'Aromas, sabores y experimentación. Una semana refrescante de descubrimiento con dinámicas creativas y juegos de agua.', color: 'bg-sky-600', colorText: 'text-sky-600', colorBorder: 'border-sky-400', colorLight: 'bg-sky-50' },
  Fuego: { sentido: 'La vista', emoji: '🔥', lema: 'Fuego · El sentido de la vista', descripcion: 'Color, luz y observación. Estimulamos la percepción visual y la creatividad con retos de atención y contrastes.', color: 'bg-orange-600', colorText: 'text-orange-600', colorBorder: 'border-orange-400', colorLight: 'bg-orange-50' },
  Aire: { sentido: 'El oído', emoji: '🌬️', lema: 'Aire · El sentido del oído', descripcion: 'Sonidos, ritmo y música. Exploramos el mundo a través de la escucha, con juegos sonoros y percusión.', color: 'bg-indigo-500', colorText: 'text-indigo-500', colorBorder: 'border-indigo-400', colorLight: 'bg-indigo-50' },
}

export type SemanaVerano = SemanaCfg & (typeof META_ELEMENTO)[Elemento]

/** Resuelve las semanas de verano (fechas/elemento editables + metadata visual). */
export function semanasResueltas(cfg: CampamentosConfig): SemanaVerano[] {
  return cfg.veranoSemanas.map(s => ({ ...s, ...META_ELEMENTO[s.elemento] }))
}

/** Lista de fechas (YYYY-MM-DD) a partir del texto, una por línea. */
export function parseFechasLista(texto: string): string[] {
  return texto.split('\n').map(l => l.trim()).filter(l => /^\d{4}-\d{2}-\d{2}$/.test(l))
}

/** Días L-V de una semana de verano. */
export function diasDeSemana(s: { inicio: string }): string[] {
  const out: string[] = []
  const start = new Date(s.inicio + 'T12:00:00')
  for (let i = 0; i < 5; i++) { const d = new Date(start); d.setDate(start.getDate() + i); out.push(d.toISOString().slice(0, 10)) }
  return out
}

export const ELEMENTOS: Elemento[] = ['Tierra', 'Agua', 'Fuego', 'Aire']
