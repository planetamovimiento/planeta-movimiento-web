// ─────────────────────────────────────────────────────────────────────────────
// Facturación · lecturas (solo servidor, service-role).
// Las escrituras viven en app/admin/facturacion/actions.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { createAdminClient } from '@/lib/supabase/admin'
import type { ClienteFactura, PerfilFacturacion, SerieFacturacion } from './tipos'

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
