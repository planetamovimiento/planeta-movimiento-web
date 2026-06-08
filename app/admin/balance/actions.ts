'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'
import { eur } from '@/lib/balance/constants'

function rev() { revalidatePath('/admin/balance'); revalidatePath('/admin') }

export type GastoInput = {
  fecha: string
  concepto: string
  categoria: string
  subcategoria?: string
  proveedor?: string
  importe: number
  iva?: number | null
  metodo_pago?: string
  estado?: string
  observaciones?: string
  adjunto_url?: string
  factura_ref?: string
}

export type IngresoManualInput = {
  fecha: string
  concepto: string
  servicio?: string
  categoria?: string
  cliente?: string
  importe: number
  pagado?: number | null
  metodo_pago?: string
  estado?: string
  referencia?: string
  observaciones?: string
}

function limpiarGasto(p: GastoInput) {
  return {
    fecha: p.fecha,
    concepto: (p.concepto || '').trim(),
    categoria: (p.categoria || '').trim() || 'Otros gastos',
    subcategoria: (p.subcategoria || '').trim() || null,
    proveedor: (p.proveedor || '').trim() || null,
    importe: Number(p.importe) || 0,
    iva: p.iva == null || (p.iva as unknown) === '' ? null : Number(p.iva),
    metodo_pago: (p.metodo_pago || '').trim() || null,
    estado: p.estado || 'pagado',
    observaciones: (p.observaciones || '').trim() || null,
    adjunto_url: (p.adjunto_url || '').trim() || null,
    factura_ref: (p.factura_ref || '').trim() || null,
  }
}

// ─── GASTOS ──────────────────────────────────────────────────────────────────
export async function crearGasto(p: GastoInput) {
  const admin = await getAdminUser()
  if (!admin || !can.editFinance(admin.role)) return { ok: false, error: 'Sin permisos' }
  if (!p.fecha || !p.concepto?.trim()) return { ok: false, error: 'Fecha y concepto son obligatorios' }
  const db = createAdminClient()
  const row = { ...limpiarGasto(p), created_by: admin.email }
  const { data, error } = await db.from('gastos').insert(row).select('id').maybeSingle()
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: `Gasto añadido: ${row.concepto} (${eur(row.importe)})`, entidad: 'gasto', entidadId: data?.id, detalle: JSON.stringify(row) })
  rev()
  return { ok: true, id: data?.id }
}

export async function editarGasto(id: string, p: GastoInput) {
  const admin = await getAdminUser()
  if (!admin || !can.editFinance(admin.role)) return { ok: false, error: 'Sin permisos' }
  const db = createAdminClient()
  const { data: antes } = await db.from('gastos').select('*').eq('id', id).maybeSingle()
  const row = { ...limpiarGasto(p), updated_at: new Date().toISOString(), updated_by: admin.email }
  const { error } = await db.from('gastos').update(row).eq('id', id)
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: `Gasto editado: ${row.concepto}`, entidad: 'gasto', entidadId: id, detalle: JSON.stringify({ antes, despues: row }) })
  rev()
  return { ok: true }
}

export async function eliminarGasto(id: string) {
  const admin = await getAdminUser()
  if (!admin || !can.manageFinance(admin.role)) return { ok: false, error: 'Solo el administrador principal puede eliminar gastos' }
  const db = createAdminClient()
  const { data: antes } = await db.from('gastos').select('*').eq('id', id).maybeSingle()
  const { error } = await db.from('gastos').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: `Gasto eliminado: ${antes?.concepto ?? id}`, entidad: 'gasto', entidadId: id, detalle: JSON.stringify({ antes }) })
  rev()
  return { ok: true }
}

// ─── IMPORTACIÓN DE GASTOS ───────────────────────────────────────────────────
export async function importarGastos(rows: GastoInput[]) {
  const admin = await getAdminUser()
  if (!admin || !can.manageFinance(admin.role)) return { ok: false, error: 'Solo el administrador principal puede importar' }
  const db = createAdminClient()

  // Dedupe contra lo ya existente (fecha|concepto|importe)
  const { data: existentes } = await db.from('gastos').select('fecha, concepto, importe')
  const clave = (f: string, c: string, i: number) => `${f}|${(c || '').trim().toLowerCase()}|${i}`
  const yaHay = new Set((existentes ?? []).map(e => clave(String(e.fecha).slice(0, 10), String(e.concepto), Number(e.importe))))

  const aInsertar: Record<string, unknown>[] = []
  let saltadas = 0
  for (const p of rows) {
    if (!p.fecha || !p.concepto?.trim() || !(Number(p.importe) > 0)) { saltadas++; continue }
    const row = limpiarGasto(p)
    const k = clave(row.fecha, row.concepto, row.importe)
    if (yaHay.has(k)) { saltadas++; continue }
    yaHay.add(k)
    aInsertar.push({ ...row, created_by: admin.email })
  }

  if (aInsertar.length) {
    const { error } = await db.from('gastos').insert(aInsertar)
    if (error) return { ok: false, error: error.message }
  }
  await logActivity({ actorEmail: admin.email, accion: `Importación de gastos: ${aInsertar.length} añadidos, ${saltadas} saltados`, entidad: 'gasto', detalle: JSON.stringify({ importadas: aInsertar.length, saltadas }) })
  rev()
  return { ok: true, importadas: aInsertar.length, saltadas }
}

// ─── INGRESOS MANUALES ───────────────────────────────────────────────────────
function limpiarIngreso(p: IngresoManualInput) {
  return {
    fecha: p.fecha,
    concepto: (p.concepto || '').trim(),
    servicio: (p.servicio || '').trim() || null,
    categoria: (p.categoria || '').trim() || null,
    cliente: (p.cliente || '').trim() || null,
    importe: Number(p.importe) || 0,
    pagado: p.pagado == null || (p.pagado as unknown) === '' ? null : Number(p.pagado),
    metodo_pago: (p.metodo_pago || '').trim() || null,
    estado: p.estado || 'pagado',
    referencia: (p.referencia || '').trim() || null,
    observaciones: (p.observaciones || '').trim() || null,
  }
}

export async function crearIngresoManual(p: IngresoManualInput) {
  const admin = await getAdminUser()
  if (!admin || !can.editFinance(admin.role)) return { ok: false, error: 'Sin permisos' }
  if (!p.fecha || !p.concepto?.trim()) return { ok: false, error: 'Fecha y concepto son obligatorios' }
  const db = createAdminClient()
  const row = { ...limpiarIngreso(p), created_by: admin.email }
  const { data, error } = await db.from('ingresos_manuales').insert(row).select('id').maybeSingle()
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: `Ingreso manual añadido: ${row.concepto} (${eur(row.importe)})`, entidad: 'ingreso', entidadId: data?.id, detalle: JSON.stringify(row) })
  rev()
  return { ok: true, id: data?.id }
}

export async function editarIngresoManual(id: string, p: IngresoManualInput) {
  const admin = await getAdminUser()
  if (!admin || !can.editFinance(admin.role)) return { ok: false, error: 'Sin permisos' }
  const db = createAdminClient()
  const { data: antes } = await db.from('ingresos_manuales').select('*').eq('id', id).maybeSingle()
  const row = { ...limpiarIngreso(p), updated_at: new Date().toISOString(), updated_by: admin.email }
  const { error } = await db.from('ingresos_manuales').update(row).eq('id', id)
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: `Ingreso manual editado: ${row.concepto}`, entidad: 'ingreso', entidadId: id, detalle: JSON.stringify({ antes, despues: row }) })
  rev()
  return { ok: true }
}

export async function eliminarIngresoManual(id: string) {
  const admin = await getAdminUser()
  if (!admin || !can.manageFinance(admin.role)) return { ok: false, error: 'Solo el administrador principal puede eliminar' }
  const db = createAdminClient()
  const { data: antes } = await db.from('ingresos_manuales').select('*').eq('id', id).maybeSingle()
  const { error } = await db.from('ingresos_manuales').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: `Ingreso manual eliminado: ${antes?.concepto ?? id}`, entidad: 'ingreso', entidadId: id, detalle: JSON.stringify({ antes }) })
  rev()
  return { ok: true }
}

// ─── CATEGORÍAS ──────────────────────────────────────────────────────────────
export async function crearCategoria(p: { nombre: string; color: string }) {
  const admin = await getAdminUser()
  if (!admin || !can.manageFinance(admin.role)) return { ok: false, error: 'Sin permisos' }
  if (!p.nombre?.trim()) return { ok: false, error: 'El nombre es obligatorio' }
  const db = createAdminClient()
  const { error } = await db.from('gasto_categorias').insert({ nombre: p.nombre.trim(), color: p.color || 'gray', orden: 999 })
  if (error) return { ok: false, error: error.message.includes('duplicate') ? 'Ya existe una categoría con ese nombre' : error.message }
  await logActivity({ actorEmail: admin.email, accion: `Categoría de gasto creada: ${p.nombre}`, entidad: 'categoria_gasto' })
  rev()
  return { ok: true }
}

export async function editarCategoria(id: string, p: { nombre: string; color: string }) {
  const admin = await getAdminUser()
  if (!admin || !can.manageFinance(admin.role)) return { ok: false, error: 'Sin permisos' }
  const db = createAdminClient()
  const { error } = await db.from('gasto_categorias').update({ nombre: p.nombre.trim(), color: p.color }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: `Categoría de gasto editada: ${p.nombre}`, entidad: 'categoria_gasto', entidadId: id })
  rev()
  return { ok: true }
}

export async function toggleCategoria(id: string, activa: boolean) {
  const admin = await getAdminUser()
  if (!admin || !can.manageFinance(admin.role)) return { ok: false, error: 'Sin permisos' }
  const db = createAdminClient()
  const { error } = await db.from('gasto_categorias').update({ activa }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  await logActivity({ actorEmail: admin.email, accion: `Categoría ${activa ? 'activada' : 'desactivada'}`, entidad: 'categoria_gasto', entidadId: id })
  rev()
  return { ok: true }
}
