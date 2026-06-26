// ─────────────────────────────────────────────────────────────────────────────
// DATOS DE PAGO DEL CLUB DEPORTIVO ORIGEN
// Las actividades del Club no tienen pago online: se pagan en efectivo en las
// instalaciones o por transferencia bancaria. Fuente única de verdad.
// ─────────────────────────────────────────────────────────────────────────────

export const CLUB_TITULAR = 'Club Deportivo Origen'
export const CLUB_BANCO = 'Globalcaja'
export const CLUB_IBAN = 'ES35 3190 1010 0650 2365 8916'

/** Concepto recomendado para la transferencia: «Actividad + nombre y apellidos del participante». */
export function conceptoPago(actividad?: string): string {
  const base = actividad?.trim() || 'Actividad'
  return `${base} + nombre y apellidos del participante`
}

/** Texto plano (para emails o notas) con las instrucciones de pago del Club. */
export function instruccionesPagoClub(actividad?: string): string {
  return `El pago de las actividades del Club Deportivo Origen se realiza en efectivo en las instalaciones o por transferencia bancaria (${CLUB_BANCO} · ${CLUB_IBAN}, titular ${CLUB_TITULAR}). Concepto: «${conceptoPago(actividad)}».`
}
