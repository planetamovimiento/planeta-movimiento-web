// ─────────────────────────────────────────────────────────────────────────────
// LA FÁBRICA DE PAPÁ NOEL — entradas, descuentos y totales.
// Archivo PURO (sin imports): lo usan el servidor (autoritativo) y el widget de
// reserva (solo para enseñar el precio mientras el cliente elige).
// Todo se calcula en CÉNTIMOS enteros: nunca hay redondeos raros.
// ─────────────────────────────────────────────────────────────────────────────

export type NavidadConfig = {
  /** Venta de entradas abierta al público. */
  ventaActiva: boolean
  precioNinoCents: number      // desde 2 años
  precioAdultoCents: number
  /** Asistentes DE PAGO a partir de los cuales se aplica el descuento de grupo. */
  minGrupo: number
  pctGrupo: number
  pctSocio: number
  /** Minutos que se guarda la plaza mientras el cliente paga. */
  minutosReserva: number
  /** Máximo de asistentes en una sola compra (tope del formulario). */
  maxPorCompra: number
}

export const NAVIDAD_DEFAULT: NavidadConfig = {
  ventaActiva: false,          // se abre desde Admin → Fábrica de Papá Noel
  precioNinoCents: 1500,
  precioAdultoCents: 1800,
  minGrupo: 6,
  pctGrupo: 20,
  pctSocio: 15,
  minutosReserva: 30,
  maxPorCompra: 25,
}

export type Entradas = { ninos: number; adultos: number; bebes: number }

export type TipoDescuentoNavidad = 'ninguno' | 'grupo' | 'socio'

export type CalculoNavidad = {
  /** Asistentes que ocupan aforo: niños + adultos + bebés. */
  plazas: number
  /** Asistentes de pago: niños + adultos (los bebés no cuentan para el grupo). */
  pagantes: number
  subtotalCents: number
  tipo: TipoDescuentoNavidad
  pct: number
  descuentoCents: number
  totalCents: number
}

const entero = (n: unknown) => {
  const v = Math.trunc(Number(n))
  return Number.isFinite(v) && v > 0 ? v : 0
}

/** Normaliza lo que llega del formulario (nunca negativos ni decimales). */
export function normalizarEntradas(e: Partial<Entradas> | null | undefined): Entradas {
  return { ninos: entero(e?.ninos), adultos: entero(e?.adultos), bebes: entero(e?.bebes) }
}

/**
 * Precio final de una compra.
 *  - Los bebés (menores de 2 años) son gratis pero ocupan plaza.
 *  - Descuentos NO acumulables: si hay 6 o más asistentes de pago manda el de
 *    grupo (20 %); si no llega a 6 y es socio verificado, el de socio (15 %).
 *  - El descuento solo se aplica sobre las entradas de pago (los bebés valen 0).
 */
export function calcularPrecio(
  entradas: Partial<Entradas>,
  opciones: { socioVerificado?: boolean } = {},
  cfg: NavidadConfig = NAVIDAD_DEFAULT,
): CalculoNavidad {
  const { ninos, adultos, bebes } = normalizarEntradas(entradas)
  const plazas = ninos + adultos + bebes
  const pagantes = ninos + adultos
  const subtotalCents = ninos * cfg.precioNinoCents + adultos * cfg.precioAdultoCents

  let tipo: TipoDescuentoNavidad = 'ninguno'
  if (pagantes >= cfg.minGrupo) tipo = 'grupo'
  else if (opciones.socioVerificado) tipo = 'socio'

  const pct = tipo === 'grupo' ? cfg.pctGrupo : tipo === 'socio' ? cfg.pctSocio : 0
  const descuentoCents = Math.round((subtotalCents * pct) / 100)

  return { plazas, pagantes, subtotalCents, tipo, pct, descuentoCents, totalCents: subtotalCents - descuentoCents }
}

/** '76,80 €' a partir de céntimos. */
export function eurosDeCents(cents: number): string {
  const n = Math.round(Number(cents) || 0)
  return `${(n / 100).toFixed(2).replace('.', ',')} €`
}

/** Texto del descuento para el CRM y el correo. */
export function textoDescuentoNavidad(c: CalculoNavidad, socioNumero = ''): string {
  if (c.tipo === 'grupo') return `Grupo (${c.pagantes} entradas) −${c.pct} %`
  if (c.tipo === 'socio') return `Socio del club −${c.pct} %${socioNumero ? ` · nº ${socioNumero}` : ''}`
  return ''
}
