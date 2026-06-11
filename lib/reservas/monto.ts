// ─────────────────────────────────────────────────────────────────────────────
// Importe a cobrar por una reserva. Módulo PURO (sin dependencias de servidor),
// reutilizable en el asistente (cliente) y en la acción de pago (servidor).
// Los importes del catálogo están en EUROS; Redsys cobra en céntimos.
// ─────────────────────────────────────────────────────────────────────────────

/** Forma serializable de un servicio reservable (subconjunto del catálogo). */
export type ServicioReserva = {
  id: string
  nombre: string
  icon: string
  descripcionCorta: string
  precio: number | null
  precioDesde: number | null
  fianza: number | null
  edad: string
  horarios: string
}

export type Monto = {
  /** Importe que se cobra online, en euros. */
  euros: number
  /** Importe en céntimos para Redsys. */
  cents: number
  /** true si lo que se cobra es una señal (fianza); false si es el precio completo. */
  esSenal: boolean
  /** Precio total de referencia de la actividad, en euros (puede ser null). */
  totalReferencia: number | null
}

/**
 * Regla autoritativa: se cobra la FIANZA (señal) si está definida (>0);
 * en su defecto el `precio`; en su defecto el `precioDesde`.
 */
export function montoReserva(s: Pick<ServicioReserva, 'precio' | 'precioDesde' | 'fianza'>): Monto {
  const totalReferencia = s.precio ?? s.precioDesde ?? null
  const esSenal = !!(s.fianza && s.fianza > 0)
  const euros = esSenal ? Number(s.fianza) : (totalReferencia ?? 0)
  return {
    euros,
    cents: Math.round(euros * 100),
    esSenal,
    totalReferencia,
  }
}

/** Formatea euros como moneda ES (entrada en euros, no céntimos). */
export function eurosFmt(euros: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(euros)
}
