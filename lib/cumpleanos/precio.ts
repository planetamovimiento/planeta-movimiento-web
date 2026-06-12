// ─────────────────────────────────────────────────────────────────────────────
// Precios del cumpleaños. Fuente única para el formulario dedicado y el asistente.
// Módulo puro (sin imports de servidor) → usable en cliente y servidor.
// ─────────────────────────────────────────────────────────────────────────────

export const CUMPLE_MIN_PARTICIPANTES = 13   // mínimo facturable
export const CUMPLE_PRECIO_LV = 11           // € por persona, lunes–jueves
export const CUMPLE_PRECIO_FINDE = 13        // € por persona, vie/sáb/dom/festivo
export const CUMPLE_EXTRA_MONITOR = 20       // € si > 25 participantes
export const CUMPLE_FIANZA = 50              // € de señal para reservar

/** Viernes, sábado o domingo (tarifa de fin de semana). */
export function esFindeOFestivoCumple(date: Date): boolean {
  const d = date.getDay()
  return d === 0 || d === 5 || d === 6
}

export function precioPersonaCumple(date: Date): number {
  return esFindeOFestivoCumple(date) ? CUMPLE_PRECIO_FINDE : CUMPLE_PRECIO_LV
}

/** Total estimado del cumpleaños (mínimo facturable 13, + monitor extra si > 25). */
export function calcularTotalCumple(fechaISO: string, participantes: number): number {
  const date = new Date(fechaISO + 'T12:00:00')
  const billable = Math.max(participantes, CUMPLE_MIN_PARTICIPANTES)
  const base = billable * precioPersonaCumple(date)
  return base + (participantes > 25 ? CUMPLE_EXTRA_MONITOR : 0)
}
