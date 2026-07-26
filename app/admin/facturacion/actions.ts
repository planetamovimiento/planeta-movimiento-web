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

type Res = { ok: boolean; error?: string | null }

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

export async function guardarClienteFactura(input: ClienteInput): Promise<Res> {
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
    const { error: e } = input.id
      ? await db.from('billing_clients').update(fila).eq('id', input.id)
      : await db.from('billing_clients').insert(fila)
    if (e) return { ok: false, error: e.message }

    await auditar(admin.email, input.id ? 'cliente editado' : 'cliente creado', { detalle: { nombre: fila.nombre } })
    revalidar()
    return { ok: true }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Error al guardar el cliente' } }
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
