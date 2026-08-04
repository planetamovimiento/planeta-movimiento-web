'use server'

// ─────────────────────────────────────────────────────────────────────────────
// Facturación · escrituras del panel. Todas devuelven { ok, error } y NUNCA
// lanzan. Revalidan /admin/facturacion. Auditan en billing_audit + activity_log.
// ─────────────────────────────────────────────────────────────────────────────

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, logActivity, can } from '@/lib/admin/auth'
import { puedeVerSeccion } from '@/lib/admin/secciones'
import { perfilTieneDocumentos, clienteTieneDocumentos } from '@/lib/facturacion/data'
import { calcularDocumento, type LineaEntrada } from '@/lib/facturacion/dinero'
import { ESTADOS_EMITIDOS } from '@/lib/facturacion/constants'

type Res = { ok: boolean; error?: string | null }
type ResId = Res & { id?: string }

/** Sesión + acceso a la sección. Devuelve el admin o un error. */
async function exigir() {
  const admin = await getAdminUser()
  if (!admin) return { admin: null, error: 'Sin sesión' as string | null }
  if (!puedeVerSeccion(admin.role, admin.secciones, 'facturacion')) {
    return { admin: null, error: 'Sin acceso a Facturación' }
  }
  return { admin, error: null as string | null }
}

function revalidar() { revalidatePath('/admin/facturacion') }

const txt = (v?: string | null) => (typeof v === 'string' && v.trim() ? v.trim() : null)

/** Auditoría: billing_audit (detalle por documento) + activity_log (feed global). */
async function auditar(actorEmail: string, accion: string, opts: { documentoId?: string | null; detalle?: Record<string, unknown> } = {}) {
  const db = createAdminClient()
  try { await db.from('billing_audit').insert({ documento_id: opts.documentoId ?? null, actor_email: actorEmail, accion, detalle: opts.detalle ?? null }) } catch { /* tabla sin migrar */ }
  await logActivity({ actorEmail, accion: `Facturación: ${accion}`, entidad: 'facturacion', detalle: opts.detalle ? JSON.stringify(opts.detalle).slice(0, 300) : undefined })
}

// ═══════════════════════════════════════════════════════════════════════════
// PERFILES EMISORES  (datos fiscales sensibles → solo administrador principal)
// ═══════════════════════════════════════════════════════════════════════════

export type PerfilInput = {
  id?: string
  nombreComercial: string
  razonSocial?: string
  nif?: string
  direccion?: string; cp?: string; localidad?: string; provincia?: string; pais?: string
  telefono?: string; email?: string; web?: string
  datosRegistrales?: string; textoLegal?: string
  iban?: string; bic?: string
  formaPago?: string; condicionesPago?: string; notas?: string; pieFactura?: string
  color?: string; moneda?: string; irpfPct?: number | string
  logoUrl?: string; selloUrl?: string; firmaUrl?: string
  activo?: boolean
}

function filaPerfil(input: PerfilInput): Record<string, unknown> {
  const irpf = Number(String(input.irpfPct ?? '').replace(',', '.'))
  return {
    nombre_comercial: input.nombreComercial.trim(),
    razon_social: txt(input.razonSocial),
    nif: txt(input.nif),
    direccion: txt(input.direccion), cp: txt(input.cp), localidad: txt(input.localidad),
    provincia: txt(input.provincia), pais: txt(input.pais) || 'España',
    telefono: txt(input.telefono), email: txt(input.email), web: txt(input.web),
    datos_registrales: txt(input.datosRegistrales), texto_legal: txt(input.textoLegal),
    iban: txt(input.iban), bic: txt(input.bic),
    forma_pago: txt(input.formaPago), condiciones_pago: txt(input.condicionesPago),
    notas: txt(input.notas), pie_factura: txt(input.pieFactura),
    color: txt(input.color) || '#0F1A3D', moneda: txt(input.moneda) || 'EUR',
    irpf_pct: Number.isFinite(irpf) ? irpf : 0,
    logo_url: txt(input.logoUrl), sello_url: txt(input.selloUrl), firma_url: txt(input.firmaUrl),
    activo: input.activo !== false,
    updated_at: new Date().toISOString(),
  }
}

export async function guardarPerfil(input: PerfilInput): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (!can.facturaPerfiles(admin.role)) return { ok: false, error: 'Solo el administrador principal gestiona los perfiles emisores' }
    if (!input.nombreComercial?.trim()) return { ok: false, error: 'El nombre comercial es obligatorio' }

    const db = createAdminClient()
    const fila = filaPerfil(input)
    const { error: e } = input.id
      ? await db.from('billing_profiles').update(fila).eq('id', input.id)
      : await db.from('billing_profiles').insert(fila)
    if (e) return { ok: false, error: e.message }

    await auditar(admin.email, input.id ? 'perfil editado' : 'perfil creado', { detalle: { nombre: fila.nombre_comercial } })
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al guardar el perfil' } }
}

export async function duplicarPerfil(id: string): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (!can.facturaPerfiles(admin.role)) return { ok: false, error: 'Sin permiso' }

    const db = createAdminClient()
    const { data, error: eSel } = await db.from('billing_profiles').select('*').eq('id', id).single()
    if (eSel || !data) return { ok: false, error: 'Perfil no encontrado' }

    const { id: _id, created_at: _c, updated_at: _u, predeterminado: _p, ...resto } = data as Record<string, unknown>
    const copia = { ...resto, nombre_comercial: `${String(resto.nombre_comercial)} (copia)`, predeterminado: false }
    const { error: e } = await db.from('billing_profiles').insert(copia)
    if (e) return { ok: false, error: e.message }

    await auditar(admin.email, 'perfil duplicado', { detalle: { origen: id } })
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al duplicar' } }
}

/** Marca un perfil como predeterminado (y desmarca el anterior). */
export async function marcarPerfilPredeterminado(id: string): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (!can.facturaPerfiles(admin.role)) return { ok: false, error: 'Sin permiso' }

    const db = createAdminClient()
    // El índice único exige que solo haya uno: primero se limpia el anterior.
    await db.from('billing_profiles').update({ predeterminado: false }).eq('predeterminado', true)
    const { error: e } = await db.from('billing_profiles').update({ predeterminado: true, updated_at: new Date().toISOString() }).eq('id', id)
    if (e) return { ok: false, error: e.message }

    await auditar(admin.email, 'perfil predeterminado', { detalle: { id } })
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error' } }
}

export async function archivarPerfil(id: string, archivado: boolean): Promise<Res> {
  return cambioSimplePerfil(id, { archivado, activo: archivado ? false : undefined }, archivado ? 'perfil archivado' : 'perfil restaurado')
}
export async function activarPerfil(id: string, activo: boolean): Promise<Res> {
  return cambioSimplePerfil(id, { activo }, activo ? 'perfil activado' : 'perfil desactivado')
}

async function cambioSimplePerfil(id: string, patch: Record<string, unknown>, accion: string): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (!can.facturaPerfiles(admin.role)) return { ok: false, error: 'Sin permiso' }
    const limpio = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined))
    const db = createAdminClient()
    const { error: e } = await db.from('billing_profiles').update({ ...limpio, updated_at: new Date().toISOString() }).eq('id', id)
    if (e) return { ok: false, error: e.message }
    await auditar(admin.email, accion, { detalle: { id } })
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error' } }
}

export async function eliminarPerfil(id: string): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (!can.facturaPerfiles(admin.role)) return { ok: false, error: 'Sin permiso' }
    if (await perfilTieneDocumentos(id)) return { ok: false, error: 'No se puede eliminar: tiene facturas o proformas. Archívalo en su lugar.' }

    const db = createAdminClient()
    const { error: e } = await db.from('billing_profiles').delete().eq('id', id)
    if (e) return { ok: false, error: e.message }
    await auditar(admin.email, 'perfil eliminado', { detalle: { id } })
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al eliminar' } }
}

// ── Series de numeración (dependen del perfil) ─────────────────────────────

export type SerieInput = {
  id?: string
  profileId: string
  tipo: 'factura' | 'proforma'
  prefijo: string
  proximo?: number | string
  reiniciaAnual?: boolean
  activa?: boolean
}

export async function guardarSerie(input: SerieInput): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (!can.facturaPerfiles(admin.role)) return { ok: false, error: 'Sin permiso' }
    if (!input.profileId) return { ok: false, error: 'Falta el perfil' }
    const prefijo = (input.prefijo || '').trim().toUpperCase()
    if (!/^[A-Z0-9]{1,10}$/.test(prefijo)) return { ok: false, error: 'El prefijo debe ser 1-10 letras o números (p. ej. PM)' }

    const proximo = Math.max(1, Math.round(Number(input.proximo) || 1))
    const fila = {
      profile_id: input.profileId,
      tipo: input.tipo === 'proforma' ? 'proforma' : 'factura',
      prefijo,
      proximo,
      reinicia_anual: input.reiniciaAnual !== false,
      activa: input.activa !== false,
      updated_at: new Date().toISOString(),
    }
    const db = createAdminClient()
    const { error: e } = input.id
      ? await db.from('billing_series').update(fila).eq('id', input.id)
      : await db.from('billing_series').insert(fila)
    if (e) return { ok: false, error: e.message.includes('duplicate') ? `Ya existe una serie ${prefijo} para ese tipo en este perfil.` : e.message }

    await auditar(admin.email, input.id ? 'serie editada' : 'serie creada', { detalle: { prefijo, tipo: fila.tipo } })
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al guardar la serie' } }
}

export async function eliminarSerie(id: string): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (!can.facturaPerfiles(admin.role)) return { ok: false, error: 'Sin permiso' }
    const db = createAdminClient()
    const { error: e } = await db.from('billing_series').delete().eq('id', id)
    // FK on delete restrict: si tiene documentos, Postgres bloquea.
    if (e) return { ok: false, error: e.message.includes('violates foreign key') ? 'No se puede borrar: la serie ya tiene documentos.' : e.message }
    await auditar(admin.email, 'serie eliminada', { detalle: { id } })
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error' } }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLIENTES
// ═══════════════════════════════════════════════════════════════════════════

export type ClienteInput = {
  id?: string
  tipo?: string
  nombre: string
  nif?: string
  direccion?: string; cp?: string; localidad?: string; provincia?: string; pais?: string
  email?: string; telefono?: string; contacto?: string
  formaPago?: string; iban?: string; notas?: string
  archivado?: boolean
}

export async function guardarClienteFactura(input: ClienteInput): Promise<ResId> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (!can.facturaClientes(admin.role)) return { ok: false, error: 'Sin permiso para gestionar clientes' }
    if (!input.nombre?.trim()) return { ok: false, error: 'El nombre o razón social es obligatorio' }

    const fila = {
      tipo: txt(input.tipo) || 'empresa',
      nombre: input.nombre.trim(),
      nif: txt(input.nif),
      direccion: txt(input.direccion), cp: txt(input.cp), localidad: txt(input.localidad),
      provincia: txt(input.provincia), pais: txt(input.pais) || 'España',
      email: txt(input.email), telefono: txt(input.telefono), contacto: txt(input.contacto),
      forma_pago: txt(input.formaPago), iban: txt(input.iban), notas: txt(input.notas),
      archivado: input.archivado === true,
      updated_at: new Date().toISOString(),
    }
    const db = createAdminClient()
    const { data, error: e } = input.id
      ? await db.from('billing_clients').update(fila).eq('id', input.id).select('id').single()
      : await db.from('billing_clients').insert(fila).select('id').single()
    if (e) return { ok: false, error: e.message }

    await auditar(admin.email, input.id ? 'cliente editado' : 'cliente creado', { detalle: { nombre: fila.nombre } })
    revalidar()
    return { ok: true, id: (data as { id?: string } | null)?.id }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al guardar el cliente' } }
}

/** Clientes con datos similares (NIF/correo/nombre): evita duplicados accidentales. */
export async function buscarClientesSimilares(input: { nif?: string; email?: string; nombre?: string }): Promise<{ id: string; nombre: string; nif: string }[]> {
  try {
    const { admin } = await exigir()
    if (!admin) return []
    const db = createAdminClient()
    const ors: string[] = []
    if (input.nif?.trim()) ors.push(`nif.ilike.%${input.nif.trim()}%`)
    if (input.email?.trim()) ors.push(`email.ilike.%${input.email.trim()}%`)
    if (input.nombre?.trim()) ors.push(`nombre.ilike.%${input.nombre.trim()}%`)
    if (ors.length === 0) return []
    const { data } = await db.from('billing_clients').select('id, nombre, nif').or(ors.join(',')).limit(5)
    return (data ?? []) as { id: string; nombre: string; nif: string }[]
  } catch { return [] }
}

export async function archivarClienteFactura(id: string, archivado: boolean): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (!can.facturaClientes(admin.role)) return { ok: false, error: 'Sin permiso' }
    const db = createAdminClient()
    const { error: e } = await db.from('billing_clients').update({ archivado, updated_at: new Date().toISOString() }).eq('id', id)
    if (e) return { ok: false, error: e.message }
    await auditar(admin.email, archivado ? 'cliente archivado' : 'cliente restaurado', { detalle: { id } })
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error' } }
}

export async function eliminarClienteFactura(id: string): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (!can.facturaClientes(admin.role)) return { ok: false, error: 'Sin permiso' }
    if (await clienteTieneDocumentos(id)) return { ok: false, error: 'No se puede eliminar: tiene documentos. Archívalo en su lugar.' }
    const db = createAdminClient()
    const { error: e } = await db.from('billing_clients').delete().eq('id', id)
    if (e) return { ok: false, error: e.message }
    await auditar(admin.email, 'cliente eliminado', { detalle: { id } })
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al eliminar' } }
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENTOS  (facturas y proformas)
// Los importes llegan en céntimos desde el formulario, pero SIEMPRE se
// recalculan aquí (nunca se confía en el navegador). El número correlativo se
// asigna solo al EMITIR (RPC con bloqueo), nunca en un borrador: así no se
// crean huecos en la numeración.
// ═══════════════════════════════════════════════════════════════════════════

export type LineaInput = {
  concepto: string
  descripcion?: string
  cantidad?: number
  unidad?: string
  precioCents: number
  descuentoPct?: number
  descuentoCents?: number
  ivaPct?: number
  ivaTipo?: 'normal' | 'exento' | 'no_sujeto'
  irpfPct?: number
}

export type DocumentoInput = {
  id?: string
  tipo: 'factura' | 'proforma'
  profileId: string
  /** Número escrito a mano (p. ej. "18/2026"). Alternativa a la serie automática. */
  numero?: string
  serieId?: string | null
  clientId?: string | null
  /** Datos del receptor cuando NO se guarda como cliente (solo para este documento). */
  clienteInline?: Record<string, string> | null
  fecha: string
  vencimiento?: string | null
  referencia?: string
  numPedido?: string
  formaPago?: string
  condicionesPago?: string
  observaciones?: string
  notasInternas?: string
  pieLegal?: string
  validezDias?: number | null
  suplidosCents?: number
  lineas: LineaInput[]
}

function aEntradas(lineas: LineaInput[]): LineaEntrada[] {
  return lineas.map(l => ({
    cantidad: Number(l.cantidad ?? 1) || 0,
    precioCents: Math.round(Number(l.precioCents) || 0),
    descuentoPct: Number(l.descuentoPct) || 0,
    descuentoCents: Math.round(Number(l.descuentoCents) || 0),
    ivaPct: Number(l.ivaPct) || 0,
    ivaTipo: l.ivaTipo ?? 'normal',
    irpfPct: Number(l.irpfPct) || 0,
  }))
}

function filasLineas(documentoId: string, lineas: LineaInput[]) {
  const entradas = aEntradas(lineas)
  const calc = calcularDocumento(entradas)
  const filas = lineas.map((l, i) => ({
    documento_id: documentoId,
    orden: i,
    concepto: (l.concepto || '').trim(),
    descripcion: txt(l.descripcion),
    cantidad: Number(l.cantidad ?? 1) || 0,
    unidad: txt(l.unidad),
    precio_cents: Math.round(Number(l.precioCents) || 0),
    descuento_pct: Number(l.descuentoPct) || 0,
    descuento_cents: Math.round(Number(l.descuentoCents) || 0),
    iva_pct: Number(l.ivaPct) || 0,
    iva_tipo: l.ivaTipo ?? 'normal',
    irpf_pct: Number(l.irpfPct) || 0,
    base_cents: calc.lineas[i].baseCents,
    total_cents: calc.lineas[i].totalCents,
  }))
  return { filas, calc }
}

/** Recorta un perfil al conjunto de campos que necesita el PDF (snapshot). */
async function snapshotEmisor(profileId: string): Promise<Record<string, unknown> | null> {
  const db = createAdminClient()
  const { data } = await db.from('billing_profiles').select('*').eq('id', profileId).single()
  if (!data) return null
  const r = data as Record<string, unknown>
  const campos = ['nombre_comercial', 'razon_social', 'nif', 'direccion', 'cp', 'localidad', 'provincia', 'pais',
    'telefono', 'email', 'web', 'iban', 'bic', 'texto_legal', 'pie_factura', 'datos_registrales', 'logo_url',
    'sello_url', 'firma_url', 'color', 'moneda', 'forma_pago', 'condiciones_pago', 'notas']
  return Object.fromEntries(campos.map(k => [k, r[k] ?? null]))
}

async function snapshotCliente(clientId: string | null | undefined, inline: Record<string, string> | null | undefined): Promise<Record<string, unknown> | null> {
  if (clientId) {
    const db = createAdminClient()
    const { data } = await db.from('billing_clients').select('*').eq('id', clientId).single()
    if (data) {
      const r = data as Record<string, unknown>
      const campos = ['tipo', 'nombre', 'nif', 'direccion', 'cp', 'localidad', 'provincia', 'pais', 'email', 'telefono', 'contacto', 'forma_pago', 'iban']
      return Object.fromEntries(campos.map(k => [k, r[k] ?? null]))
    }
  }
  if (inline && (inline.nombre || '').trim()) return { ...inline }
  return null
}

async function cargarDoc(id: string) {
  const db = createAdminClient()
  const { data } = await db.from('billing_documents').select('*').eq('id', id).single()
  return data as Record<string, unknown> | null
}

/**
 * Crea o actualiza un BORRADOR. Recalcula totales en el servidor. No asigna
 * número. No se puede tocar un documento ya emitido por esta vía.
 */
export async function guardarBorrador(input: DocumentoInput): Promise<ResId> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (!can.facturaEditar(admin.role)) return { ok: false, error: 'Sin permiso para editar documentos' }
    if (!input.profileId) return { ok: false, error: 'Selecciona un emisor' }
    if (!input.fecha) return { ok: false, error: 'La fecha de emisión es obligatoria' }

    if (input.id) {
      const actual = await cargarDoc(input.id)
      if (actual && ESTADOS_EMITIDOS.includes(String(actual.estado))) {
        return { ok: false, error: 'Este documento ya está emitido: no se puede editar como borrador.' }
      }
    }

    const entradas = aEntradas(input.lineas || [])
    const calc = calcularDocumento(entradas, Math.round(Number(input.suplidosCents) || 0))

    const cabecera: Record<string, unknown> = {
      tipo: input.tipo === 'proforma' ? 'proforma' : 'factura',
      profile_id: input.profileId,
      // Número a mano en el borrador (se confirma al emitir). Vacío = automático por serie.
      numero: txt(input.numero),
      serie_id: input.serieId || null,
      client_id: input.clientId || null,
      fecha: input.fecha,
      vencimiento: input.vencimiento || null,
      referencia: txt(input.referencia),
      num_pedido: txt(input.numPedido),
      forma_pago: txt(input.formaPago),
      condiciones_pago: txt(input.condicionesPago),
      observaciones: txt(input.observaciones),
      notas_internas: txt(input.notasInternas),
      pie_legal: txt(input.pieLegal),
      validez_dias: input.validezDias ?? null,
      // El receptor sin guardar se conserva en el snapshot desde el borrador.
      cliente_snapshot: input.clientId ? null : (input.clienteInline && input.clienteInline.nombre ? input.clienteInline : null),
      base_cents: calc.baseCents,
      descuento_cents: calc.descuentoCents,
      iva_cents: calc.ivaCents,
      irpf_cents: calc.irpfCents,
      suplidos_cents: calc.suplidosCents,
      total_cents: calc.totalCents,
      updated_at: new Date().toISOString(),
    }

    const db = createAdminClient()
    let docId = input.id
    if (docId) {
      const { error: e } = await db.from('billing_documents').update(cabecera).eq('id', docId)
      if (e) return { ok: false, error: e.message }
    } else {
      const { data, error: e } = await db.from('billing_documents').insert({ ...cabecera, estado: 'borrador', created_by: admin.email }).select('id').single()
      if (e) return { ok: false, error: e.message }
      docId = (data as { id?: string } | null)?.id
      if (!docId) return { ok: false, error: 'No se pudo crear el documento' }
    }

    // Líneas: se reescriben enteras (lista corta).
    await db.from('billing_document_lines').delete().eq('documento_id', docId)
    if ((input.lineas || []).length) {
      const { filas } = filasLineas(docId, input.lineas)
      const { error: eL } = await db.from('billing_document_lines').insert(filas)
      if (eL) return { ok: false, error: eL.message }
    }

    await auditar(admin.email, input.id ? 'documento editado' : 'borrador creado', { documentoId: docId, detalle: { tipo: cabecera.tipo, total: calc.totalCents } })
    revalidar()
    return { ok: true, id: docId }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al guardar el borrador' } }
}

/**
 * Emite un documento: valida, asigna número correlativo (RPC con bloqueo) y
 * congela el snapshot del emisor y del receptor. A partir de aquí es inmutable.
 */
export async function emitirDocumento(id: string): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (!can.facturaEmitir(admin.role)) return { ok: false, error: 'Sin permiso para emitir' }

    const doc = await cargarDoc(id)
    if (!doc) return { ok: false, error: 'Documento no encontrado' }
    if (ESTADOS_EMITIDOS.includes(String(doc.estado))) return { ok: false, error: 'Este documento ya está emitido.' }
    if (!doc.fecha) return { ok: false, error: 'Falta la fecha de emisión.' }
    if (Number(doc.total_cents) <= 0) return { ok: false, error: 'El total debe ser mayor que 0.' }
    if (doc.vencimiento && String(doc.vencimiento) < String(doc.fecha)) return { ok: false, error: 'El vencimiento no puede ser anterior a la emisión.' }

    const emisor = await snapshotEmisor(String(doc.profile_id))
    if (!emisor) return { ok: false, error: 'El emisor ya no existe.' }
    const cliente = await snapshotCliente(doc.client_id as string | null, doc.cliente_snapshot as Record<string, string> | null)
    if (!cliente) return { ok: false, error: 'Selecciona o crea un cliente antes de emitir.' }

    const db = createAdminClient()
    // Número: el que se ha escrito a mano, o el automático de la serie si la hay.
    let numero = txt(doc.numero as string | null)
    let numeroInt: number | null = null
    if (numero) {
      // ponytail: unicidad comprobada en la app (no en la BD) para el número manual.
      const { data: dup } = await db.from('billing_documents').select('id').eq('tipo', doc.tipo).eq('numero', numero).neq('id', id).limit(1)
      if (dup && dup.length) return { ok: false, error: `Ya existe otro documento con el número ${numero}.` }
    } else if (doc.serie_id) {
      const ejercicio = Number(String(doc.fecha).slice(0, 4))
      const { data: num, error: eNum } = await db.rpc('billing_siguiente_numero', { p_serie_id: doc.serie_id, p_ejercicio: ejercicio })
      if (eNum || !num || !num[0]) return { ok: false, error: eNum?.message || 'No se pudo asignar el número.' }
      numero = num[0].numero
      numeroInt = num[0].numero_int
    } else {
      return { ok: false, error: 'Escribe un número de documento (o elige una serie para numerarlo automáticamente).' }
    }

    const esProforma = String(doc.tipo) === 'proforma'
    const { error: e } = await db.from('billing_documents').update({
      numero,
      numero_int: numeroInt,
      estado: esProforma ? 'enviada' : 'emitida',
      emisor_snapshot: emisor,
      cliente_snapshot: cliente,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    if (e) return { ok: false, error: e.message }

    await auditar(admin.email, esProforma ? 'proforma emitida' : 'factura emitida', { documentoId: id, detalle: { numero } })
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al emitir' } }
}

/**
 * Corrige un documento YA emitido (erratas: importes, conceptos, cliente, fecha,
 * incluso el número). Mantiene número_int, serie y estado; NO renumera. Refresca
 * los snapshots del emisor y receptor para que el PDF corregido sea coherente, y
 * lo deja registrado en auditoría. Fiscalmente lo correcto para un cambio con
 * validez es una rectificativa; esto es para arreglar equivocaciones internas.
 */
export async function editarEmitido(input: DocumentoInput): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (!can.facturaEmitir(admin.role)) return { ok: false, error: 'Sin permiso para corregir documentos emitidos' }
    if (!input.id) return { ok: false, error: 'Falta el documento' }
    if (!input.profileId) return { ok: false, error: 'Selecciona un emisor' }
    if (!input.fecha) return { ok: false, error: 'La fecha de emisión es obligatoria' }

    const actual = await cargarDoc(input.id)
    if (!actual) return { ok: false, error: 'Documento no encontrado' }
    if (!ESTADOS_EMITIDOS.includes(String(actual.estado))) {
      return { ok: false, error: 'Solo se corrigen documentos emitidos. Un borrador se edita con «Guardar borrador».' }
    }

    const numero = txt(input.numero)
    if (!numero) return { ok: false, error: 'El número no puede quedar vacío en un documento emitido.' }
    if (input.vencimiento && input.vencimiento < input.fecha) return { ok: false, error: 'El vencimiento no puede ser anterior a la emisión.' }

    const db = createAdminClient()
    // Unicidad del número (misma comprobación que al emitir).
    const { data: dup } = await db.from('billing_documents').select('id').eq('tipo', actual.tipo).eq('numero', numero).neq('id', input.id).limit(1)
    if (dup && dup.length) return { ok: false, error: `Ya existe otro documento con el número ${numero}.` }

    const entradas = aEntradas(input.lineas || [])
    const calc = calcularDocumento(entradas, Math.round(Number(input.suplidosCents ?? actual.suplidos_cents) || 0))
    if (calc.totalCents <= 0) return { ok: false, error: 'El total debe ser mayor que 0.' }

    const emisor = await snapshotEmisor(input.profileId)
    if (!emisor) return { ok: false, error: 'El emisor ya no existe.' }
    const cliente = await snapshotCliente(input.clientId, input.clienteInline)
    if (!cliente) return { ok: false, error: 'Selecciona o crea un cliente.' }

    const patch: Record<string, unknown> = {
      profile_id: input.profileId,
      numero,
      serie_id: input.serieId || null,
      client_id: input.clientId || null,
      fecha: input.fecha,
      vencimiento: input.vencimiento || null,
      referencia: txt(input.referencia),
      num_pedido: txt(input.numPedido),
      forma_pago: txt(input.formaPago),
      condiciones_pago: txt(input.condicionesPago),
      observaciones: txt(input.observaciones),
      notas_internas: txt(input.notasInternas),
      pie_legal: txt(input.pieLegal),
      validez_dias: input.validezDias ?? null,
      emisor_snapshot: emisor,
      cliente_snapshot: cliente,
      base_cents: calc.baseCents,
      descuento_cents: calc.descuentoCents,
      iva_cents: calc.ivaCents,
      irpf_cents: calc.irpfCents,
      suplidos_cents: calc.suplidosCents,
      total_cents: calc.totalCents,
      updated_at: new Date().toISOString(),
    }
    // Si estaba saldada, el pago sigue el nuevo total tras la corrección.
    if (String(actual.estado) === 'pagada') patch.pagado_cents = calc.totalCents

    const { error: e } = await db.from('billing_documents').update(patch).eq('id', input.id)
    if (e) return { ok: false, error: e.message }

    // Líneas: se reescriben enteras (lista corta).
    await db.from('billing_document_lines').delete().eq('documento_id', input.id)
    if ((input.lineas || []).length) {
      const { filas } = filasLineas(input.id, input.lineas)
      const { error: eL } = await db.from('billing_document_lines').insert(filas)
      if (eL) return { ok: false, error: eL.message }
    }

    await auditar(admin.email, 'documento emitido corregido', { documentoId: input.id, detalle: { numero, total: calc.totalCents } })
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al corregir' } }
}

/** Duplica cualquier documento como un borrador nuevo (sin número). */
export async function duplicarDocumento(id: string): Promise<ResId> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (!can.facturaEditar(admin.role)) return { ok: false, error: 'Sin permiso' }
    const db = createAdminClient()
    const doc = await cargarDoc(id)
    if (!doc) return { ok: false, error: 'No encontrado' }

    const { id: _i, numero: _n, numero_int: _ni, estado: _e, emisor_snapshot: _es, created_at: _c, updated_at: _u,
      origen_documento_id: _o, convertida_documento_id: _cv, ...resto } = doc as Record<string, unknown>
    const { data, error: eI } = await db.from('billing_documents').insert({ ...resto, estado: 'borrador', created_by: admin.email }).select('id').single()
    if (eI) return { ok: false, error: eI.message }
    const nuevo = (data as { id?: string } | null)?.id
    if (!nuevo) return { ok: false, error: 'No se pudo duplicar' }

    const { data: lineas } = await db.from('billing_document_lines').select('*').eq('documento_id', id)
    for (const l of (lineas ?? []) as Record<string, unknown>[]) {
      const { id: _li, documento_id: _d, ...restoL } = l
      await db.from('billing_document_lines').insert({ ...restoL, documento_id: nuevo })
    }
    await auditar(admin.email, 'documento duplicado', { documentoId: nuevo, detalle: { origen: id } })
    revalidar()
    return { ok: true, id: nuevo }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al duplicar' } }
}

/** Convierte una proforma en una factura borrador (número al emitirla). */
export async function convertirEnFactura(proformaId: string): Promise<ResId> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (!can.facturaEditar(admin.role)) return { ok: false, error: 'Sin permiso' }
    const db = createAdminClient()
    const pf = await cargarDoc(proformaId)
    if (!pf || String(pf.tipo) !== 'proforma') return { ok: false, error: 'No es una proforma' }
    if (pf.convertida_documento_id) return { ok: false, error: 'Esta proforma ya se convirtió en factura.' }

    // Serie de facturas del mismo perfil (la primera activa).
    const { data: series } = await db.from('billing_series').select('id').eq('profile_id', pf.profile_id).eq('tipo', 'factura').eq('activa', true).limit(1)
    const serieFactura = (series ?? [])[0]?.id ?? null

    const { id: _i, numero: _n, numero_int: _ni, estado: _e, emisor_snapshot: _es, created_at: _c, updated_at: _u,
      tipo: _t, serie_id: _s, convertida_documento_id: _cv, origen_documento_id: _o, validez_dias: _v, ...resto } = pf as Record<string, unknown>
    const { data, error: eI } = await db.from('billing_documents').insert({
      ...resto, tipo: 'factura', serie_id: serieFactura, estado: 'borrador',
      origen_documento_id: proformaId, created_by: admin.email,
    }).select('id').single()
    if (eI) return { ok: false, error: eI.message }
    const facturaId = (data as { id?: string } | null)?.id
    if (!facturaId) return { ok: false, error: 'No se pudo convertir' }

    const { data: lineas } = await db.from('billing_document_lines').select('*').eq('documento_id', proformaId)
    for (const l of (lineas ?? []) as Record<string, unknown>[]) {
      const { id: _li, documento_id: _d, ...restoL } = l
      await db.from('billing_document_lines').insert({ ...restoL, documento_id: facturaId })
    }

    await db.from('billing_documents').update({ estado: 'convertida', convertida_documento_id: facturaId, updated_at: new Date().toISOString() }).eq('id', proformaId)
    await auditar(admin.email, 'proforma convertida en factura', { documentoId: facturaId, detalle: { proforma: proformaId } })
    revalidar()
    return { ok: true, id: facturaId }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al convertir' } }
}

/** Borra un BORRADOR (nunca un documento emitido). */
export async function eliminarBorrador(id: string): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }
    if (!can.facturaEditar(admin.role)) return { ok: false, error: 'Sin permiso' }
    const doc = await cargarDoc(id)
    if (!doc) return { ok: false, error: 'No encontrado' }
    if (ESTADOS_EMITIDOS.includes(String(doc.estado))) return { ok: false, error: 'No se puede borrar un documento emitido. Anúlalo o haz una rectificativa.' }
    const db = createAdminClient()
    const { error: e } = await db.from('billing_documents').delete().eq('id', id)
    if (e) return { ok: false, error: e.message }
    await auditar(admin.email, 'borrador eliminado', { documentoId: id })
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al eliminar' } }
}

/**
 * Cambia el estado de un documento YA emitido con un clic (pagada, anulada,
 * vencida…). No permite volver a «borrador»: una factura emitida no se
 * re-edita, solo cambia de estado. Anular exige permiso de anulación.
 */
export async function cambiarEstadoDocumento(id: string, estado: string): Promise<Res> {
  try {
    const { admin, error } = await exigir()
    if (!admin) return { ok: false, error }

    const doc = await cargarDoc(id)
    if (!doc) return { ok: false, error: 'Documento no encontrado' }
    if (String(doc.estado) === 'borrador') return { ok: false, error: 'Un borrador se edita desde el formulario, no aquí.' }
    if (estado === 'borrador') return { ok: false, error: 'Una factura emitida no puede volver a borrador.' }

    const esProforma = String(doc.tipo) === 'proforma'
    const validos = esProforma
      ? ['enviada', 'aceptada', 'rechazada', 'caducada', 'convertida']
      : ['emitida', 'enviada', 'parcial', 'pagada', 'vencida', 'rectificada', 'anulada']
    if (!validos.includes(estado)) return { ok: false, error: 'Estado no válido' }

    // Anular es sensible: solo el administrador principal.
    if ((estado === 'anulada' || estado === 'rechazada') ? !can.facturaAnular(admin.role) : !can.facturaPago(admin.role)) {
      return { ok: false, error: 'Sin permiso para este cambio de estado' }
    }

    const patch: Record<string, unknown> = { estado, updated_at: new Date().toISOString() }
    // Marcar «pagada» salda el documento; volver a «emitida» lo deja sin cobros manuales.
    if (estado === 'pagada') patch.pagado_cents = doc.total_cents
    if (estado === 'emitida') patch.pagado_cents = 0

    const db = createAdminClient()
    const { error: e } = await db.from('billing_documents').update(patch).eq('id', id)
    if (e) return { ok: false, error: e.message }

    await auditar(admin.email, `estado → ${estado}`, { documentoId: id, detalle: { numero: doc.numero, estado } })
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al cambiar el estado' } }
}
