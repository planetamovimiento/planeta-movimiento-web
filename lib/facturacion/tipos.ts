// ─────────────────────────────────────────────────────────────────────────────
// Facturación · tipos del módulo. Importes SIEMPRE en céntimos (…Cents).
// ─────────────────────────────────────────────────────────────────────────────

import type { TipoDocumento } from './constants'
export type { TipoDocumento } from './constants'

export type PerfilFacturacion = {
  id: string
  nombreComercial: string
  razonSocial: string
  nif: string
  direccion: string
  cp: string
  localidad: string
  provincia: string
  pais: string
  telefono: string
  email: string
  web: string
  datosRegistrales: string
  textoLegal: string
  iban: string
  bic: string
  formaPago: string
  condicionesPago: string
  notas: string
  pieFactura: string
  color: string
  moneda: string
  irpfPct: number
  logoUrl: string
  selloUrl: string
  firmaUrl: string
  predeterminado: boolean
  activo: boolean
  archivado: boolean
}

export type SerieFacturacion = {
  id: string
  profileId: string
  tipo: TipoDocumento
  prefijo: string
  proximo: number
  ejercicio: number | null
  reiniciaAnual: boolean
  predeterminada: boolean
  activa: boolean
}

export type ClienteFactura = {
  id: string
  tipo: string
  nombre: string
  nif: string
  direccion: string
  cp: string
  localidad: string
  provincia: string
  pais: string
  email: string
  telefono: string
  contacto: string
  formaPago: string
  iban: string
  notas: string
  archivado: boolean
}

export type LineaDocumento = {
  id: string
  orden: number
  concepto: string
  descripcion: string
  cantidad: number
  unidad: string
  precioCents: number
  descuentoPct: number
  descuentoCents: number
  ivaPct: number
  ivaTipo: 'normal' | 'exento' | 'no_sujeto'
  irpfPct: number
  baseCents: number
  totalCents: number
}

export type PagoDocumento = {
  id: string
  fecha: string
  importeCents: number
  metodo: string
  referencia: string
  observaciones: string
}

export type Documento = {
  id: string
  tipo: TipoDocumento
  profileId: string | null
  serieId: string | null
  clientId: string | null
  numero: string
  numeroInt: number | null
  fecha: string
  vencimiento: string
  estado: string
  moneda: string
  formaPago: string
  condicionesPago: string
  referencia: string
  numPedido: string
  observaciones: string
  notasInternas: string
  pieLegal: string
  validezDias: number | null
  /** Snapshot inmutable congelado al emitir (o null si sigue en borrador). */
  emisorSnapshot: Record<string, unknown> | null
  clienteSnapshot: Record<string, unknown> | null
  baseCents: number
  descuentoCents: number
  ivaCents: number
  irpfCents: number
  suplidosCents: number
  totalCents: number
  pagadoCents: number
  origenDocumentoId: string | null
  convertidaDocumentoId: string | null
  createdBy: string
  createdAt: string
  lineas: LineaDocumento[]
  pagos: PagoDocumento[]
}
