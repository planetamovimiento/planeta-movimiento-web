'use server'

import { createHash } from 'crypto'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'
import { BUCKET_FACTURAS, aFactura, type Factura } from '@/lib/balance/documentos'

// ─────────────────────────────────────────────────────────────────────────────
// Facturas del Balance: subir, revisar, confirmar y anular.
//
// Reglas que no se saltan:
//  · el archivo original NUNCA se borra al procesarlo;
//  · el documento vive en un bucket privado y solo se sirve con enlace firmado;
//  · una factura confirmada crea UN movimiento y queda enlazada a él;
//  · una factura confirmada no se borra: se anula (y su movimiento con ella).
// ─────────────────────────────────────────────────────────────────────────────

type Res<T = unknown> = { ok: true; data?: T } | { ok: false; error: string }

const rev = () => { revalidatePath('/admin/balance'); revalidatePath('/admin') }
const str = (v: unknown) => (typeof v === 'string' ? v : '')


const MIMES_OK = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 20 * 1024 * 1024

async function exigir(finanzas = false) {
  const admin = await getAdminUser()
  if (!admin) return { admin: null, error: 'Sin sesión' }
  if (finanzas ? !can.manageFinance(admin.role) : !can.editFinance(admin.role)) {
    return { admin: null, error: 'No tienes permisos sobre el balance' }
  }
  return { admin, error: null as string | null }
}

async function auditar(facturaId: string, accion: string, actor: string, campo?: string, anterior?: string, nuevo?: string) {
  try {
    const db = createAdminClient()
    await db.from('facturas_auditoria').insert({
      factura_id: facturaId, accion, actor,
      campo: campo ?? null, valor_anterior: anterior ?? null, valor_nuevo: nuevo ?? null,
    })
  } catch { /* la auditoría nunca bloquea la operación */ }
}

// ── Subida ───────────────────────────────────────────────────────────────────

/**
 * Sube una factura o justificante. Queda en "pendiente de revisión": no toca el
 * balance hasta que se confirma. Devuelve la ficha y, si la hay, la factura ya
 * registrada con el mismo archivo (mismo hash) para avisar del duplicado.
 */
export async function subirFactura(formData: FormData): Promise<Res<{ factura: Factura; duplicada: Factura | null }>> {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error: error! }

  const file = formData.get('file') as File | null
  const ambito = String(formData.get('ambito') || 'empresa') === 'club' ? 'club' : 'empresa'
  const tipo = String(formData.get('tipo') || 'gasto') === 'ingreso' ? 'ingreso' : 'gasto'
  const categoria = String(formData.get('categoria') || '').trim()
  const subcategoria = String(formData.get('subcategoria') || '').trim()
  const categoriaId = String(formData.get('categoriaId') || '').trim()

  if (!file || file.size === 0) return { ok: false, error: 'No se ha seleccionado ningún archivo' }
  if (file.size > MAX_BYTES) return { ok: false, error: 'El archivo supera los 20 MB' }
  if (!MIMES_OK.includes(file.type)) return { ok: false, error: 'Formato no válido (PDF, JPG, PNG o WebP)' }

  const buffer = Buffer.from(await file.arrayBuffer())
  const hash = createHash('sha256').update(buffer).digest('hex')
  const db = createAdminClient()

  // ¿Ya está subido este mismo archivo?
  const { data: yaSubida } = await db.from('facturas').select('*').eq('archivo_hash', hash).limit(1).maybeSingle()

  const ext = file.type === 'application/pdf' ? 'pdf' : (file.type.split('/')[1] || 'jpg')
  const base = file.name.replace(/\.[^.]+$/, '').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
  const path = `${ambito}/${new Date().getFullYear()}/${base || 'factura'}-${Date.now()}.${ext}`

  const { error: upErr } = await db.storage.from(BUCKET_FACTURAS).upload(path, buffer, { contentType: file.type, upsert: false })
  if (upErr) return { ok: false, error: `No se pudo subir: ${upErr.message}` }

  const { data: creada, error: insErr } = await db.from('facturas').insert({
    ambito, tipo,
    categoria: categoria || null,
    subcategoria: subcategoria || null,
    categoria_id: categoriaId || null,
    concepto: file.name.replace(/\.[^.]+$/, ''),
    estado_doc: yaSubida ? 'duplicada' : 'revision',
    estado_pago: 'pendiente',
    archivo_path: path,
    archivo_nombre: file.name,
    archivo_mime: file.type,
    archivo_tamano: file.size,
    archivo_hash: hash,
    created_by: admin.email,
  }).select('*').single()
  if (insErr) return { ok: false, error: insErr.message }

  const factura = aFactura(creada as Record<string, unknown>)
  await auditar(factura.id, 'subida', admin.email, 'archivo', '', file.name)
  await logActivity({ actorEmail: admin.email, accion: `Subió la factura "${file.name}"`, entidad: 'balance', entidadId: factura.id })
  rev()
  return { ok: true, data: { factura, duplicada: yaSubida ? aFactura(yaSubida as Record<string, unknown>) : null } }
}

// ── Edición de la ficha ──────────────────────────────────────────────────────

export type DatosFactura = {
  proveedor?: string; cif?: string; numero?: string; concepto?: string
  fechaEmision?: string; fechaVencimiento?: string; fechaPago?: string
  base?: number | null; ivaPct?: number | null; ivaImporte?: number | null; retencion?: number | null; total?: number | null
  metodoPago?: string; estadoPago?: string; notas?: string; esTicket?: boolean
  ambito?: string; tipo?: string; categoria?: string; subcategoria?: string; categoriaId?: string | null
}

const txt = (v?: string) => (v ?? '').trim() || null
const fec = (v?: string) => (v && v.length >= 10 ? v.slice(0, 10) : null)

/** Guarda los datos revisados a mano. Deja constancia de quién y cuándo. */
export async function guardarFactura(id: string, p: DatosFactura): Promise<Res> {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error: error! }
  const db = createAdminClient()

  const patch: Record<string, unknown> = {
    proveedor: txt(p.proveedor), cif: txt(p.cif), numero: txt(p.numero), concepto: txt(p.concepto),
    fecha_emision: fec(p.fechaEmision), fecha_vencimiento: fec(p.fechaVencimiento), fecha_pago: fec(p.fechaPago),
    base: p.base ?? null, iva_pct: p.ivaPct ?? null, iva_importe: p.ivaImporte ?? null,
    retencion: p.retencion ?? null, total: p.total ?? null,
    metodo_pago: txt(p.metodoPago), notas: txt(p.notas),
    updated_at: new Date().toISOString(), updated_by: admin.email,
  }
  if (p.estadoPago) patch.estado_pago = p.estadoPago
  if (p.esTicket !== undefined) patch.es_ticket = p.esTicket
  if (p.ambito) patch.ambito = p.ambito === 'club' ? 'club' : 'empresa'
  if (p.tipo) patch.tipo = p.tipo === 'ingreso' ? 'ingreso' : 'gasto'
  if (p.categoria !== undefined) patch.categoria = txt(p.categoria)
  if (p.subcategoria !== undefined) patch.subcategoria = txt(p.subcategoria)
  if (p.categoriaId !== undefined) patch.categoria_id = p.categoriaId || null

  const { error: e } = await db.from('facturas').update(patch).eq('id', id)
  if (e) return { ok: false, error: e.message }
  await auditar(id, 'correccion', admin.email, 'ficha', '', JSON.stringify({ total: p.total, proveedor: p.proveedor }))
  rev()
  return { ok: true }
}

// ── Confirmar: la factura entra en el balance ────────────────────────────────

/**
 * Confirma la factura y crea su movimiento en el balance (gasto o ingreso
 * manual), enlazado a ella. Si ya tenía movimiento, no crea otro: solo lo
 * actualiza, para que una factura no se contabilice dos veces.
 */
export async function confirmarFactura(id: string): Promise<Res> {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error: error! }
  const db = createAdminClient()

  const { data } = await db.from('facturas').select('*').eq('id', id).maybeSingle()
  if (!data) return { ok: false, error: 'No se encuentra la factura' }
  const f = aFactura(data as Record<string, unknown>)

  // Validaciones mínimas antes de contabilizar (punto 37).
  if (!f.total || f.total <= 0) return { ok: false, error: 'Falta el importe total (debe ser mayor que 0)' }
  if (!f.fechaEmision) return { ok: false, error: 'Falta la fecha de la factura' }
  if (!f.categoria) return { ok: false, error: 'Elige una categoría antes de contabilizarla' }

  const fechaMov = f.fechaPago || f.fechaEmision
  const concepto = f.concepto || `${f.tipo === 'gasto' ? 'Factura' : 'Ingreso'} ${f.numero || ''}`.trim()

  if (f.tipo === 'gasto') {
    const fila = {
      ambito: f.ambito, fecha: fechaMov, concepto,
      categoria: f.categoria, subcategoria: f.subcategoria || null,
      proveedor: f.proveedor || null,
      // El balance suma base + IVA; si no hay desglose, la base es el total.
      importe: f.base ?? f.total,
      iva: f.ivaPct ?? null,
      metodo_pago: f.metodoPago || null,
      estado: f.estadoPago === 'pagado' ? 'pagado' : 'pendiente',
      factura_ref: f.numero || null,
      observaciones: f.notas || null,
      factura_id: f.id,
      updated_at: new Date().toISOString(), updated_by: admin.email,
    }
    if (f.gastoId) {
      const { error: e } = await db.from('gastos').update(fila).eq('id', f.gastoId)
      if (e) return { ok: false, error: e.message }
    } else {
      const { data: g, error: e } = await db.from('gastos').insert({ ...fila, created_by: admin.email }).select('id').single()
      if (e) return { ok: false, error: e.message }
      await db.from('facturas').update({ gasto_id: (g as { id: string }).id }).eq('id', f.id)
    }
  } else {
    const fila = {
      ambito: f.ambito, fecha: fechaMov, concepto,
      categoria: f.categoria, servicio: f.subcategoria || f.categoria,
      cliente: f.proveedor || null,
      importe: f.total,
      pagado: f.estadoPago === 'pagado' ? f.total : 0,
      metodo_pago: f.metodoPago || null,
      estado: f.estadoPago === 'pagado' ? 'pagado' : 'pendiente',
      referencia: f.numero || null,
      observaciones: f.notas || null,
      factura_id: f.id,
      updated_at: new Date().toISOString(), updated_by: admin.email,
    }
    if (f.ingresoId) {
      const { error: e } = await db.from('ingresos_manuales').update(fila).eq('id', f.ingresoId)
      if (e) return { ok: false, error: e.message }
    } else {
      const { data: i, error: e } = await db.from('ingresos_manuales').insert({ ...fila, created_by: admin.email }).select('id').single()
      if (e) return { ok: false, error: e.message }
      await db.from('facturas').update({ ingreso_id: (i as { id: string }).id }).eq('id', f.id)
    }
  }

  await db.from('facturas').update({ estado_doc: 'confirmada', updated_at: new Date().toISOString(), updated_by: admin.email }).eq('id', f.id)
  await auditar(f.id, 'confirmacion', admin.email, 'total', '', String(f.total))
  await logActivity({ actorEmail: admin.email, accion: `Contabilizó la factura ${f.numero || f.archivoNombre}`, entidad: 'balance', entidadId: f.id })
  rev()
  return { ok: true }
}

/** Anula una factura confirmada: borra su movimiento y la deja en revisión. */
export async function anularFactura(id: string): Promise<Res> {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error: error! }
  const db = createAdminClient()
  const { data } = await db.from('facturas').select('*').eq('id', id).maybeSingle()
  if (!data) return { ok: false, error: 'No se encuentra la factura' }
  const f = aFactura(data as Record<string, unknown>)

  if (f.gastoId) await db.from('gastos').delete().eq('id', f.gastoId)
  if (f.ingresoId) await db.from('ingresos_manuales').delete().eq('id', f.ingresoId)
  const { error: e } = await db.from('facturas').update({
    estado_doc: 'revision', gasto_id: null, ingreso_id: null,
    updated_at: new Date().toISOString(), updated_by: admin.email,
  }).eq('id', id)
  if (e) return { ok: false, error: e.message }
  await auditar(id, 'anulacion', admin.email)
  rev()
  return { ok: true }
}

/** Cambia el estado del documento (rechazada, archivada, duplicada, revisión…). */
export async function estadoFactura(id: string, estado: string): Promise<Res> {
  const { admin, error } = await exigir()
  if (!admin) return { ok: false, error: error! }
  const db = createAdminClient()
  const { error: e } = await db.from('facturas').update({ estado_doc: estado, updated_at: new Date().toISOString(), updated_by: admin.email }).eq('id', id)
  if (e) return { ok: false, error: e.message }
  await auditar(id, 'estado', admin.email, 'estado_doc', '', estado)
  rev()
  return { ok: true }
}

/**
 * Borra una factura que NO está contabilizada (borrador). Las confirmadas se
 * anulan primero: así no desaparece un movimiento del balance sin rastro.
 */
export async function borrarFactura(id: string): Promise<Res> {
  const { admin, error } = await exigir(true)
  if (!admin) return { ok: false, error: error! }
  const db = createAdminClient()
  const { data } = await db.from('facturas').select('*').eq('id', id).maybeSingle()
  if (!data) return { ok: false, error: 'No se encuentra la factura' }
  const f = aFactura(data as Record<string, unknown>)
  if (f.estadoDoc === 'confirmada' || f.gastoId || f.ingresoId) {
    return { ok: false, error: 'Está contabilizada: anúlala antes de borrarla.' }
  }
  const path = str((data as Record<string, unknown>).archivo_path)
  if (path) await db.storage.from(BUCKET_FACTURAS).remove([path])
  const { error: e } = await db.from('facturas').delete().eq('id', id)
  if (e) return { ok: false, error: e.message }
  await logActivity({ actorEmail: admin.email, accion: `Borró el documento ${f.archivoNombre}`, entidad: 'balance', entidadId: id })
  rev()
  return { ok: true }
}

/** Enlace firmado (2 minutos) para ver o descargar el documento original. */
export async function urlFactura(id: string, descargar = false): Promise<Res<string>> {
  const admin = await getAdminUser()
  if (!admin) return { ok: false, error: 'Sin sesión' }
  const db = createAdminClient()
  const { data } = await db.from('facturas').select('archivo_path, archivo_nombre').eq('id', id).maybeSingle()
  const path = str((data as Record<string, unknown> | null)?.archivo_path)
  if (!path) return { ok: false, error: 'Esta factura no tiene documento' }
  const nombre = str((data as Record<string, unknown>).archivo_nombre) || 'factura'
  const { data: firmada, error } = await db.storage.from(BUCKET_FACTURAS)
    .createSignedUrl(path, 120, descargar ? { download: nombre } : undefined)
  if (error || !firmada?.signedUrl) return { ok: false, error: error?.message || 'No se pudo generar el enlace' }
  if (descargar) await auditar(id, 'descarga', admin.email)
  return { ok: true, data: firmada.signedUrl }
}

// ── Carpetas (categorías y subcategorías) ────────────────────────────────────

export type CarpetaInput = {
  nombre: string; descripcion?: string; color?: string; icono?: string
  ambito: string; tipo: string; parentId?: string | null; orden?: number; activa?: boolean
}

export async function crearCarpeta(p: CarpetaInput): Promise<Res> {
  const { admin, error } = await exigir(true)
  if (!admin) return { ok: false, error: error! }
  if (!p.nombre.trim()) return { ok: false, error: 'Ponle nombre a la carpeta' }
  const db = createAdminClient()
  const { error: e } = await db.from('gasto_categorias').insert({
    nombre: p.nombre.trim(),
    descripcion: txt(p.descripcion), color: (p.color || 'gray').trim(), icono: txt(p.icono),
    ambito: p.ambito === 'club' ? 'club' : 'empresa',
    tipo: p.tipo === 'ingreso' ? 'ingreso' : 'gasto',
    parent_id: p.parentId || null,
    orden: p.orden ?? 99,
    activa: p.activa !== false,
  })
  if (e) return { ok: false, error: e.message.toLowerCase().includes('duplicate') ? 'Ya existe una carpeta con ese nombre ahí.' : e.message }
  await logActivity({ actorEmail: admin.email, accion: `Creó la carpeta "${p.nombre.trim()}"`, entidad: 'balance' })
  rev()
  return { ok: true }
}

export async function editarCarpeta(id: string, p: Partial<CarpetaInput>): Promise<Res> {
  const { admin, error } = await exigir(true)
  if (!admin) return { ok: false, error: error! }
  const db = createAdminClient()
  const patch: Record<string, unknown> = {}
  if (p.nombre !== undefined) patch.nombre = p.nombre.trim()
  if (p.descripcion !== undefined) patch.descripcion = txt(p.descripcion)
  if (p.color !== undefined) patch.color = p.color
  if (p.icono !== undefined) patch.icono = txt(p.icono)
  if (p.orden !== undefined) patch.orden = p.orden
  if (p.activa !== undefined) patch.activa = p.activa
  const { error: e } = await db.from('gasto_categorias').update(patch).eq('id', id)
  if (e) return { ok: false, error: e.message }
  rev()
  return { ok: true }
}

/** Borra una carpeta vacía (sin facturas ni subcarpetas). */
export async function borrarCarpeta(id: string): Promise<Res> {
  const { admin, error } = await exigir(true)
  if (!admin) return { ok: false, error: error! }
  const db = createAdminClient()
  const { count: hijas } = await db.from('gasto_categorias').select('id', { count: 'exact', head: true }).eq('parent_id', id)
  if ((hijas ?? 0) > 0) return { ok: false, error: 'Tiene subcarpetas: bórralas primero.' }
  const { count: docs } = await db.from('facturas').select('id', { count: 'exact', head: true }).eq('categoria_id', id)
  if ((docs ?? 0) > 0) return { ok: false, error: 'Tiene facturas dentro: muévelas antes de borrarla.' }
  const { error: e } = await db.from('gasto_categorias').delete().eq('id', id)
  if (e) return { ok: false, error: e.message }
  rev()
  return { ok: true }
}
