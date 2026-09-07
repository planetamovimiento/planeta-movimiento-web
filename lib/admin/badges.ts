import { createAdminClient } from '@/lib/supabase/admin'
import { esSoloSocio } from '@/lib/club/constants'
import { contarSociosSinNumero } from '@/lib/club/socios'
import type { SeccionId } from './secciones'

// ─────────────────────────────────────────────────────────────────────────────
// Avisos del panel: cuántas cosas ENTRADAS POR LA WEB están sin atender en cada
// sección. Se pintan como globo rojo en la barra lateral y como alertas en el
// dashboard, y son la MISMA cuenta en los dos sitios.
//
// No hay "leído/no leído": el número baja solo al hacer el trabajo (confirmar la
// reserva, gestionar la inscripción, marcar la solicitud como leída…). Así una
// alerta nunca se queda pegada.
// ─────────────────────────────────────────────────────────────────────────────

export type BadgesAdmin = Partial<Record<SeccionId, number>>

type Row = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : '')

async function filas(fn: () => Promise<{ data: unknown; error: unknown }>): Promise<Row[]> {
  try {
    const { data, error } = await fn()
    return error || !Array.isArray(data) ? [] : (data as Row[])
  } catch {
    return []
  }
}

export async function getBadgesAdmin(): Promise<BadgesAdmin> {
  const db = createAdminClient()

  const [bookings, forms, subsClub, gest, pagos, pedidos, sociosSinNumero] = await Promise.all([
    filas(() => db.from('bookings').select('estado_reserva') as never),
    filas(() => db.from('form_submissions').select('estado, tipo') as never),
    filas(() => db.from('form_submissions').select('id, asunto, datos').eq('tipo', 'inscripcion_club') as never),
    filas(() => db.from('club_gestion').select('submission_id, estado_general') as never),
    filas(() => db.from('payments').select('estado, fecha') as never),
    filas(() => db.from('product_orders').select('estado') as never),
    contarSociosSinNumero().catch(() => 0),
  ])

  // Inscripciones del club por atender: sin ficha de gestión todavía o aún en
  // "pendiente". En cuanto se pasa a activo (o espera/baja), deja de contar.
  // Las líneas del alta de socio son informativas y no cuentan.
  const gestMap = new Map(gest.map(g => [str(g.submission_id), str(g.estado_general)]))
  const club = subsClub.filter(s => {
    if (esSoloSocio(s.datos as Record<string, unknown> | null, str(s.asunto))) return false
    const estado = gestMap.get(str(s.id))
    return estado === undefined || estado === '' || estado === 'pendiente'
  }).length

  const cuenta = (rows: Row[], campo: string, valor: string) => rows.filter(r => str(r[campo]) === valor).length

  // Pagos: los cobros que han entrado esta semana (un pago cobrado no es una
  // tarea, así que se muestra unos días y se apaga solo). Los pagos "pendientes"
  // no cuentan aquí: son las reservas sin confirmar, ya avisadas arriba.
  const hace7 = new Date(Date.now() - 7 * 864e5).toISOString()
  const pagosNuevos = pagos.filter(p => str(p.estado) === 'pagado' && str(p.fecha) >= hace7).length

  return {
    club,
    socios: sociosSinNumero,
    reservas: cuenta(bookings, 'estado_reserva', 'pendiente'),
    formularios: forms.filter(f => str(f.estado) === 'nueva' && str(f.tipo) !== 'inscripcion_club').length,
    pagos: pagosNuevos,
    productos: cuenta(pedidos, 'estado', 'nuevo'),
  }
}
