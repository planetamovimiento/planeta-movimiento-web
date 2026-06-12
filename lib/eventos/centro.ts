// ─────────────────────────────────────────────────────────────────────────────
// Configuración editable de los EVENTOS EN EL CENTRO (Días Sin Cole, Domingos,
// Noche de Halloween). Archivo puro (sin imports de servidor) → usable en cliente.
// Se edita desde el panel (Servicios) y se guarda en la tabla eventos_config.
// ─────────────────────────────────────────────────────────────────────────────

import type { EstadoMM } from './manana-magica'

/** Config unificada (cada evento usa los campos que le aplican). */
export type EventoCentroCfg = {
  precio: number          // € por niño
  ivaIncluido: boolean    // true = precio final; false = + IVA
  horario: string
  edad: string
  nota: string
  fechas: string          // texto: una línea por fecha. DSC: "YYYY-MM-DD = Etiqueta"
  evento: string          // Halloween: nombre temático del año
  plazas: number          // Halloween: plazas máximas
  aforo: number           // Días Sin Cole / Domingos: plazas (niños) por fecha; 0 = sin límite
  estado: EstadoMM
  updatedAt?: string | null
  updatedBy?: string | null
}

export const EVENTOS_CENTRO_IDS = ['dias-sin-cole', 'domingos', 'halloween'] as const
export type EventoCentroId = (typeof EVENTOS_CENTRO_IDS)[number]

export const EVENTOS_CENTRO_DEFAULT: Record<EventoCentroId, EventoCentroCfg> = {
  'dias-sin-cole': {
    precio: 30, ivaIncluido: false, horario: '9:00 – 14:00', edad: 'Desde 4 años', nota: '',
    fechas: [
      '2026-09-11 = Fiesta Nacional (sept)',
      '2026-10-12 = Día de la Hispanidad',
      '2026-11-02 = Puente de Todos los Santos',
      '2026-12-07 = Puente Constitución',
      '2026-12-26 = Día siguiente Navidad',
      '2027-01-02 = Inicio de año escolar',
      '2027-01-07 = Post-Reyes',
    ].join('\n'),
    evento: '', plazas: 0, aforo: 0, estado: 'abierto',
  },
  domingos: {
    precio: 15, ivaIncluido: true, horario: '11:00 – 13:00', edad: 'Desde 2 años',
    nota: 'Adultos gratis · Menores de 2 años gratis', fechas: '', evento: '', plazas: 0, aforo: 0, estado: 'abierto',
  },
  halloween: {
    precio: 0, ivaIncluido: true, horario: '22:00 – 09:00', edad: 'Mín. 10 años',
    nota: 'Plazas muy limitadas · El precio se confirma al contactar',
    fechas: '31 oct → 1 nov', evento: 'Apocalipsis Zombie', plazas: 20, aforo: 0, estado: 'proximo',
  },
}

export type FechaDSC = { fecha: string; label: string }

/** Parsea el texto de fechas de Días Sin Cole en una lista. */
export function parseFechasDSC(texto: string): FechaDSC[] {
  return texto.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const m = l.match(/(\d{4}-\d{2}-\d{2})\s*[=|·-]?\s*(.*)/)
    if (m) return { fecha: m[1], label: m[2].trim() || m[1] }
    return { fecha: '', label: l }
  }).filter(f => f.fecha)
}
