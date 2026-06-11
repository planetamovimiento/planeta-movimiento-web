// ─────────────────────────────────────────────────────────────────────────────
// Tipos y helpers PUROS de franjas de reserva (sin dependencias de servidor),
// reutilizables en cliente y servidor.
// ─────────────────────────────────────────────────────────────────────────────

export type SlotSemanal = {
  dias: number[]       // 1=Lun … 7=Dom
  horaInicio: string   // "18:15"
  horaFin: string      // "20:15"
  plazas: number       // capacidad de la franja (1 = exclusiva)
}

export const DIAS_LABEL: { n: number; label: string }[] = [
  { n: 1, label: 'L' }, { n: 2, label: 'M' }, { n: 3, label: 'X' }, { n: 4, label: 'J' },
  { n: 5, label: 'V' }, { n: 6, label: 'S' }, { n: 7, label: 'D' },
]

/** Día de la semana 1=Lun … 7=Dom para una fecha. */
export function diaSemana(date: Date): number {
  const d = date.getDay() // 0=Dom … 6=Sáb
  return d === 0 ? 7 : d
}

/** Etiqueta visible de una franja ("18:15 – 20:15" o solo "18:15"). */
export function etiquetaSlot(s: SlotSemanal): string {
  return s.horaFin ? `${s.horaInicio} – ${s.horaFin}` : s.horaInicio
}

/** Hora de inicio (HH:MM) a partir de una etiqueta o texto de hora. */
export function horaInicioDe(texto: string): string {
  return texto.match(/\d{1,2}:\d{2}/)?.[0] ?? texto.trim()
}

/** Franjas aplicables a una fecha concreta (por día de la semana). */
export function slotsDelDia(slots: SlotSemanal[], date: Date): SlotSemanal[] {
  const wd = diaSemana(date)
  return slots.filter(s => Array.isArray(s.dias) && s.dias.includes(wd))
}
