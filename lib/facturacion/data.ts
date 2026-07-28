// ─────────────────────────────────────────────────────────────────────────────
// Facturación · lecturas (solo servidor, service-role).
// Las escrituras viven en app/admin/facturacion/actions.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { createAdminClient } from '@/lib/supabase/admin'
import type { ClienteFactura, Documento, LineaDocumento, PagoDocumento, PerfilFacturacion, SerieFacturacion } from './tipos'

type Row = Record<string, unknown>

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))
const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }

async function safe<T>(fn: () => Promise<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  try { const { data, error } = await fn(); return error ? [] : (data ?? []) } catch { return [] }
}

/** ¿Se ha ejecutado ya migration_facturacion.sql? Avisa en el panel si falta. */
export async function hayTablasFacturacion(): Promise<boolean> {
  const db = createAdminClient()
  try {
    const { error } = await db.from('billing_profiles').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}

// ── Perfiles emisores ───────────────────────────────────────────────────────

function aPerfil(r: Row): PerfilFacturacion {
  return {
    id: str(r.id),
    nombreComercial: str(r.nombre_comercial),
    razonSocial: str(r.razon_social),
    nif: str(r.nif),
    direccion: str(r.direccion),
    cp: str(r.cp),
    localidad: str(r.localidad),
    provincia: str(r.provincia),
    pais: str(r.pais) || 'España',
    telefono: str(r.telefono),
    email: str(r.email),
    web: str(r.web),
    datosRegistrales: str(r.datos_registrales),
    textoLegal: str(r.texto_legal),
    iban: str(r.iban),
    bic: str(r.bic),
    formaPago: str(r.forma_pago),
    condicionesPago: str(r.condiciones_pago),
    notas: str(r.notas),
    pieFactura: str(r.pie_factura),
    color: str(r.color) || '#0F1A3D',
    moneda: str(r.moneda) || 'EUR',
    irpfPct: num(r.irpf_pct),
    logoUrl: str(r.logo_url),
    selloUrl: str(r.sello_url),
    firmaUrl: str(r.firma_url),
    predeterminado: r.predeterminado === true,
    activo: r.activo !== false,
    archivado: r.archivado === true,
  }
}

/** Todos los perfiles (incluidos archivados): para el panel. */
export async function getPerfiles(): Promise<PerfilFacturacion[]> {
  const db = createAdminClient()
  const rows = await safe<Row>(() => db.from('billing_profiles').select('*').order('created_at', { ascending: true }) as never)
  return rows.map(aPerfil).sort((a, b) =>
    Number(b.predeterminado) - Number(a.predeterminado) ||
    Number(a.archivado) - Number(b.archivado) ||
    a.nombreComercial.localeCompare(b.nombreComercial, 'es'),
  )
}

export function perfilPredeterminado(perfiles: PerfilFacturacion[]): PerfilFacturacion | null {
  return perfiles.find(p => p.predeterminado && p.activo && !p.archivado)
    ?? perfiles.find(p => p.activo && !p.archivado)
    ?? null
}

// ── Series ────────────────────────────────────────────────────────────────

function aSerie(r: Row): SerieFacturacion {
  return {
    id: str(r.id),
    profileId: str(r.profile_id),
    tipo: str(r.tipo) === 'proforma' ? 'proforma' : 'factura',
    prefijo: str(r.prefijo),
    proximo: num(r.proximo) || 1,
    ejercicio: r.ejercicio == null ? null : num(r.ejercicio),
    reiniciaAnual: r.reinicia_anual !== false,
    predeterminada: r.predeterminada === true,
    activa: r.activa !== false,
  }
}

export async function getSeries(): Promise<SerieFacturacion[]> {
  const db = createAdminClient()
  const rows = await safe<Row>(() => db.from('billing_series').select('*') as never)
  return rows.map(aSerie).sort((a, b) => a.prefijo.localeCompare(b.prefijo, 'es'))
}

// ── Clientes de facturación ─────────────────────────────────────────────────

function aCliente(r: Row): ClienteFactura {
  return {
    id: str(r.id),
    tipo: str(r.tipo) || 'empresa',
    nombre: str(r.nombre),
    nif: str(r.nif),
    direccion: str(r.direccion),
    cp: str(r.cp),
    localidad: str(r.localidad),
    provincia: str(r.provincia),
    pais: str(r.pais) || 'España',
    email: str(r.email),
    telefono: str(r.telefono),
    contacto: str(r.contacto),
    formaPago: str(r.forma_pago),
    iban: str(r.iban),
    notas: str(r.notas),
    archivado: r.archivado === true,
  }
}

/** Todos los clientes (incluidos archivados): para el panel. */
export async function getClientesFactura(): Promise<ClienteFactura[]> {
  const db = createAdminClient()
  const rows = await safe<Row>(() => db.from('billing_clients').select('*') as never)
  return rows.map(aCliente).sort((a, b) =>
    Number(a.archivado) - Number(b.archivado) || a.nombre.localeCompare(b.nombre, 'es'),
  )
}

/** ¿Un perfil tiene documentos emitidos/vinculados? Bloquea el borrado. */
export async function perfilTieneDocumentos(profileId: string): Promise<boolean> {
  const db = createAdminClient()
  try {
    const { count, error } = await db.from('billing_documents').select('id', { count: 'exact', head: true }).eq('profile_id', profileId)
    return !error && (count ?? 0) > 0
  } catch { return false }
}

export async function clienteTieneDocumentos(clientId: string): Promise<boolean> {
  const db = createAdminClient()
  try {
    const { count, error } = await db.from('billing_documents').select('id', { count: 'exact', head: true }).eq('client_id', clientId)
    return !error && (count ?? 0) > 0
  } catch { return false }
}

// ── Documentos (facturas + proformas) ──────────────────────────────────────

function aLinea(r: Row): LineaDocumento {
  return {
    id: str(r.id),
    orden: num(r.orden),
    concepto: str(r.concepto),
    descripcion: str(r.descripcion),
    cantidad: num(r.cantidad),
    unidad: str(r.unidad),
    precioCents: num(r.precio_cents),
    descuentoPct: num(r.descuento_pct),
    descuentoCents: num(r.descuento_cents),
    ivaPct: num(r.iva_pct),
    ivaTipo: (str(r.iva_tipo) || 'normal') as LineaDocumento['ivaTipo'],
    irpfPct: num(r.irpf_pct),
    baseCents: num(r.base_cents),
    totalCents: num(r.total_cents),
  }
}

function aPago(r: Row): PagoDocumento {
  return {
    id: str(r.id),
    fecha: r.fecha ? str(r.fecha).slice(0, 10) : '',
    importeCents: num(r.importe_cents),
    metodo: str(r.metodo),
    referencia: str(r.referencia),
    observaciones: str(r.observaciones),
  }
}

function aDocumento(r: Row, lineas: LineaDocumento[], pagos: PagoDocumento[]): Documento {
  const snap = (v: unknown) => (v && typeof v === 'object' ? v as Record<string, unknown> : null)
  return {
    id: str(r.id),
    tipo: str(r.tipo) === 'proforma' ? 'proforma' : 'factura',
    profileId: r.profile_id ? str(r.profile_id) : null,
    serieId: r.serie_id ? str(r.serie_id) : null,
    clientId: r.client_id ? str(r.client_id) : null,
    numero: str(r.numero),
    numeroInt: r.numero_int == null ? null : num(r.numero_int),
    fecha: r.fecha ? str(r.fecha).slice(0, 10) : '',
    vencimiento: r.vencimiento ? str(r.vencimiento).slice(0, 10) : '',
    estado: str(r.estado) || 'borrador',
    moneda: str(r.moneda) || 'EUR',
    formaPago: str(r.forma_pago),
    condicionesPago: str(r.condiciones_pago),
    referencia: str(r.referencia),
    numPedido: str(r.num_pedido),
    observaciones: str(r.observaciones),
    notasInternas: str(r.notas_internas),
    pieLegal: str(r.pie_legal),
    validezDias: r.validez_dias == null ? null : num(r.validez_dias),
    emisorSnapshot: snap(r.emisor_snapshot),
    clienteSnapshot: snap(r.cliente_snapshot),
    baseCents: num(r.base_cents),
    descuentoCents: num(r.descuento_cents),
    ivaCents: num(r.iva_cents),
    irpfCents: num(r.irpf_cents),
    suplidosCents: num(r.suplidos_cents),
    totalCents: num(r.total_cents),
    pagadoCents: num(r.pagado_cents),
    origenDocumentoId: r.origen_documento_id ? str(r.origen_documento_id) : null,
    convertidaDocumentoId: r.convertida_documento_id ? str(r.convertida_documento_id) : null,
    createdBy: str(r.created_by),
    createdAt: str(r.created_at),
    lineas,
    pagos,
  }
}

/** Todos los documentos con sus líneas y pagos. ponytail: sin paginar; ok con
 *  pocos cientos, añadir paginación cuando el volumen crezca. */
export async function getDocumentos(): Promise<Documento[]> {
  const db = createAdminClient()
  const [docs, lineas, pagos] = await Promise.all([
    safe<Row>(() => db.from('billing_documents').select('*') as never),
    safe<Row>(() => db.from('billing_document_lines').select('*') as never),
    safe<Row>(() => db.from('billing_payments').select('*') as never),
  ])
  const lineasPorDoc = new Map<string, LineaDocumento[]>()
  for (const raw of lineas) {
    const did = str(raw.documento_id)
    const arr = lineasPorDoc.get(did) ?? []
    arr.push(aLinea(raw))
    lineasPorDoc.set(did, arr)
  }
  for (const arr of lineasPorDoc.values()) arr.sort((a, b) => a.orden - b.orden)

  const pagosPorDoc = new Map<string, PagoDocumento[]>()
  for (const raw of pagos) {
    const did = str(raw.documento_id)
    const arr = pagosPorDoc.get(did) ?? []
    arr.push(aPago(raw))
    pagosPorDoc.set(did, arr)
  }

  return docs
    .map(d => aDocumento(d, lineasPorDoc.get(str(d.id)) ?? [], pagosPorDoc.get(str(d.id)) ?? []))
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
}
