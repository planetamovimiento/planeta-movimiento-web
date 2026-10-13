'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'
import { puedeVerSeccion } from '@/lib/admin/secciones'
import { setAjustesNavidad, type NavidadAjustes } from '@/lib/navidad/store'

// ─────────────────────────────────────────────────────────────────────────────
// Panel → Fábrica de Papá Noel. Todas las acciones exigen sesión de
// administrador CON acceso a la sección, y las que tocan dinero o aforo exigen
// además permiso de edición.
// ─────────────────────────────────────────────────────────────────────────────

type Resultado = { ok: true } | { ok: false; error: string }

async function exigirEdicion(): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const admin = await getAdminUser()
  if (!admin || !puedeVerSeccion(admin.role, admin.secciones, 'navidad')) {
    return { ok: false, error: 'No tienes acceso a esta sección.' }
  }
  if (!can.edit(admin.role)) return { ok: false, error: 'Tu cuenta es de solo lectura.' }
  return { ok: true, email: admin.email }
}

function refrescar() {
  revalidatePath('/admin/navidad')
  revalidatePath('/fabrica-de-papa-noel')
}

/** Abre o cierra la venta, cambia precios, descuentos, textos e imágenes. */
export async function guardarAjustesNavidad(parcial: Partial<NavidadAjustes>): Promise<Resultado> {
  const a = await exigirEdicion()
  if (!a.ok) return a

  // Saneado: nada de precios negativos ni porcentajes imposibles.
  const limpio: Partial<NavidadAjustes> = { ...parcial }
  const enteroPositivo = (v: unknown, max = 1_000_000) => Math.min(Math.max(Math.trunc(Number(v) || 0), 0), max)
  if ('precioNinoCents' in limpio) limpio.precioNinoCents = enteroPositivo(limpio.precioNinoCents)
  if ('precioAdultoCents' in limpio) limpio.precioAdultoCents = enteroPositivo(limpio.precioAdultoCents)
  if ('pctGrupo' in limpio) limpio.pctGrupo = enteroPositivo(limpio.pctGrupo, 100)
  if ('pctSocio' in limpio) limpio.pctSocio = enteroPositivo(limpio.pctSocio, 100)
  if ('minGrupo' in limpio) limpio.minGrupo = Math.max(1, enteroPositivo(limpio.minGrupo, 100))
  if ('minutosReserva' in limpio) limpio.minutosReserva = Math.max(5, enteroPositivo(limpio.minutosReserva, 240))
  if ('maxPorCompra' in limpio) limpio.maxPorCompra = Math.max(1, enteroPositivo(limpio.maxPorCompra, 100))

  const ok = await setAjustesNavidad(limpio, a.email)
  if (!ok) return { ok: false, error: 'No se pudieron guardar los ajustes.' }

  await logActivity({
    actorEmail: a.email,
    accion: 'ventaActiva' in limpio
      ? `Venta de entradas de Navidad: ${limpio.ventaActiva ? 'ABIERTA' : 'cerrada'}`
      : 'Ajustes de la Fábrica de Papá Noel',
    entidad: 'navidad', entidadId: 'config',
  })
  refrescar()
  return { ok: true }
}

/** Bloquea o reabre un pase concreto. */
export async function bloquearPaseNavidad(paseId: string, bloqueado: boolean): Promise<Resultado> {
  const a = await exigirEdicion()
  if (!a.ok) return a
  const db = createAdminClient()
  const { error } = await db.from('navidad_pases').update({ bloqueado }).eq('id', paseId)
  if (error) return { ok: false, error: 'No se pudo cambiar el pase.' }
  await logActivity({ actorEmail: a.email, accion: `Pase de Navidad ${bloqueado ? 'bloqueado' : 'reabierto'}`, entidad: 'navidad', entidadId: paseId })
  refrescar()
  return { ok: true }
}

/** Cambia el aforo de un pase. La base de datos impide dejarlo por debajo de lo vendido. */
export async function cambiarAforoNavidad(paseId: string, aforo: number): Promise<Resultado> {
  const a = await exigirEdicion()
  if (!a.ok) return a
  const n = Math.trunc(Number(aforo) || 0)
  if (n < 1 || n > 200) return { ok: false, error: 'El aforo tiene que estar entre 1 y 200.' }

  const db = createAdminClient()
  const { error } = await db.rpc('navidad_set_aforo', { p_pase_id: paseId, p_aforo: n })
  if (error) {
    const m = error.message || ''
    if (m.includes('AFORO_MENOR_QUE_VENDIDO')) {
      const vendidas = m.match(/(\d+)\s*$/)?.[1] ?? '?'
      return { ok: false, error: `No puedes bajar el aforo por debajo de las ${vendidas} plazas ya vendidas en ese pase.` }
    }
    return { ok: false, error: 'No se pudo cambiar el aforo.' }
  }
  await logActivity({ actorEmail: a.email, accion: `Aforo de un pase de Navidad a ${n}`, entidad: 'navidad', entidadId: paseId })
  refrescar()
  return { ok: true }
}

/** Cambia la hora de un pase futuro (solo si todavía no ha vendido nada). */
export async function cambiarHoraPaseNavidad(paseId: string, hora: string, horaFin: string): Promise<Resultado> {
  const a = await exigirEdicion()
  if (!a.ok) return a
  const valida = (h: string) => /^\d{1,2}:\d{2}$/.test((h || '').trim())
  if (!valida(hora) || !valida(horaFin)) return { ok: false, error: 'Las horas van en formato 10:00.' }

  const db = createAdminClient()
  const { data: ocup } = await db.from('navidad_ocupacion').select('ocupadas').eq('pase_id', paseId).maybeSingle()
  if (Number((ocup as { ocupadas?: number } | null)?.ocupadas ?? 0) > 0) {
    return { ok: false, error: 'Ese pase ya tiene entradas vendidas: no se le puede cambiar la hora.' }
  }
  const { error } = await db.from('navidad_pases').update({ hora: hora.trim(), hora_fin: horaFin.trim() }).eq('id', paseId)
  if (error) return { ok: false, error: 'No se pudo cambiar el horario.' }
  await logActivity({ actorEmail: a.email, accion: `Horario de un pase de Navidad a ${hora}–${horaFin}`, entidad: 'navidad', entidadId: paseId })
  refrescar()
  return { ok: true }
}

/** Marca o desmarca a un grupo como presente el día de la visita. */
export async function marcarAsistenciaNavidad(reservaId: string, asistio: boolean): Promise<Resultado> {
  const a = await exigirEdicion()
  if (!a.ok) return a
  const db = createAdminClient()
  const { error } = await db.from('navidad_reservas')
    .update({ asistio, updated_at: new Date().toISOString() }).eq('id', reservaId)
  if (error) return { ok: false, error: 'No se pudo marcar la asistencia.' }
  refrescar()
  return { ok: true }
}

/**
 * Cancela una reserva y libera sus plazas.
 * `reembolsada` solo deja constancia: el dinero se devuelve desde el TPV de
 * Redsys, que es quien tiene la operación.
 */
export async function cancelarReservaNavidad(reservaId: string, reembolsada: boolean): Promise<Resultado> {
  const a = await exigirEdicion()
  if (!a.ok) return a
  const db = createAdminClient()
  const ahora = new Date().toISOString()

  const { data } = await db.from('navidad_reservas').select('localizador, booking_id').eq('id', reservaId).maybeSingle()
  const r = data as { localizador?: string; booking_id?: string | null } | null

  const { error } = await db.from('navidad_reservas')
    .update({ estado: reembolsada ? 'reembolsada' : 'cancelada', expira_at: null, updated_at: ahora })
    .eq('id', reservaId)
  if (error) return { ok: false, error: 'No se pudo cancelar la reserva.' }

  // La reserva del CRM se marca igual, para que los listados cuadren.
  if (r?.booking_id) {
    await db.from('bookings').update({ estado_reserva: 'cancelada' }).eq('id', r.booking_id)
    await db.from('crm_gestion').upsert({
      origen: 'booking', origen_id: r.booking_id,
      estado_reserva: 'cancelada', updated_at: ahora, updated_by: a.email,
    }, { onConflict: 'origen,origen_id' })
  }

  await logActivity({
    actorEmail: a.email,
    accion: `Entradas de Navidad ${reembolsada ? 'reembolsadas' : 'canceladas'} (${r?.localizador ?? reservaId})`,
    entidad: 'navidad', entidadId: reservaId,
  })
  refrescar()
  return { ok: true }
}
