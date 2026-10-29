'use server'

import { revalidatePath } from 'next/cache'
import { getAdminUser, can } from '@/lib/admin/auth'
import { setConfig } from '@/lib/config/store'
import { CLAVE_EXTRAS, getExtras, type ExtraAsistencia } from '@/lib/club/asistencia-extras'

// ponytail: leer-modificar-escribir sobre un JSON; si dos personas añaden a la vez
// puede perderse uno. Pasar a tabla propia si lo usan varios a la vez.
async function guardar(extras: ExtraAsistencia[], email: string) {
  const ok = await setConfig(CLAVE_EXTRAS, JSON.stringify(extras), email)
  revalidatePath('/admin/club/asistencia')
  return ok ? { ok: true as const } : { ok: false as const, error: 'No se pudo guardar' }
}

export async function anadirExtraAsistencia(e: Omit<ExtraAsistencia, 'id'>) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false as const, error: 'Sin permisos' }
  const nombre = e.nombre.trim(), apellidos = e.apellidos.trim()
  if (!nombre) return { ok: false as const, error: 'Falta el nombre' }
  if (!e.actividad || !e.grupo) return { ok: false as const, error: 'Falta actividad o grupo' }
  if (e.fecha && !/^\d{4}-\d{2}-\d{2}$/.test(e.fecha)) return { ok: false as const, error: 'Fecha no válida' }
  const nuevo: ExtraAsistencia = { ...e, nombre, apellidos, nota: e.nota.trim(), fecha: e.fecha || '', id: crypto.randomUUID() }
  return guardar([...(await getExtras()), nuevo], admin.email)
}

export async function quitarExtraAsistencia(id: string) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false as const, error: 'Sin permisos' }
  return guardar((await getExtras()).filter(x => x.id !== id), admin.email)
}
