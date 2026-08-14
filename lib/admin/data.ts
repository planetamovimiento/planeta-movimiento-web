import { createAdminClient } from '@/lib/supabase/admin'
import { getTemporadaActiva } from '@/lib/config/store'

export type Booking = {
  id: string; numero: string | null; servicio: string | null
  cliente_nombre: string | null; cliente_email: string | null; cliente_telefono: string | null
  fecha: string | null; hora: string | null; participantes: number | null; precio: number | null
  estado_reserva: string; estado_pago: string; observaciones: string | null; notas_internas: string | null
  created_at: string
}

/** Ejecuta una consulta y devuelve [] si la tabla aún no existe o hay error. */
async function safe<T>(fn: () => Promise<{ data: T[] | null; error: unknown }>): Promise<{ rows: T[]; ok: boolean }> {
  try {
    const { data, error } = await fn()
    if (error) return { rows: [], ok: false }
    return { rows: data ?? [], ok: true }
  } catch {
    return { rows: [], ok: false }
  }
}

export async function getBookings(): Promise<{ rows: Booking[]; ok: boolean }> {
  const db = createAdminClient()
  return safe<Booking>(() => db.from('bookings').select('*').order('created_at', { ascending: false }).limit(500) as never)
}

/** Un elemento del feed de novedades del panel (reserva o inscripción del club). */
export type Novedad = { id: string; clase: 'reserva' | 'club'; nombre: string; detalle: string; cuando: string; estado: string }

export async function getDashboard() {
  const db = createAdminClient()
  const hoy = new Date().toISOString().slice(0, 10)
  const hace7 = new Date(Date.now() - 7 * 864e5).toISOString()
  const tempActiva = await getTemporadaActiva()
  const s = (v: unknown) => (typeof v === 'string' ? v : '')

  const [bookings, payments, forms, clubSubs, clubGest] = await Promise.all([
    safe<Booking>(() => db.from('bookings').select('*').order('created_at', { ascending: false }).limit(100) as never),
    safe<{ importe: number; estado: string; fecha: string }>(() => db.from('payments').select('importe, estado, fecha') as never),
    safe<{ id: string; estado: string; tipo: string }>(() => db.from('form_submissions').select('id, estado, tipo') as never),
    safe<{ id: string; nombre: string | null; datos: Record<string, unknown> | null; estado: string; created_at: string }>(
      () => db.from('form_submissions').select('id, nombre, datos, estado, created_at').eq('tipo', 'inscripcion_club').order('created_at', { ascending: false }).limit(60) as never),
    safe<{ submission_id: string; temporada: string | null; estado_general: string | null; pagos: Record<string, string> | null; pagos_meta: Record<string, { importe_cents?: number }> | null }>(
      () => db.from('club_gestion').select('submission_id, temporada, estado_general, pagos, pagos_meta') as never),
  ])

  const esClub = (t: string) => t === 'inscripcion_club'
  const reservasHoy = bookings.rows.filter(b => b.fecha === hoy).length
  const pendientes = bookings.rows.filter(b => b.estado_reserva === 'pendiente').length
  const enEspera = bookings.rows.filter(b => b.estado_reserva === 'espera').length
  const ingresos = payments.rows.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + (Number(p.importe) || 0), 0)
  const formsNuevos = forms.rows.filter(f => f.estado === 'nueva' && !esClub(f.tipo)).length
  const clubNuevos = forms.rows.filter(f => f.estado === 'nueva' && esClub(f.tipo)).length
  const clubTotal = forms.rows.filter(f => esClub(f.tipo)).length

  // ── Economía y estado del Club (temporada activa) ──
  const gestActiva = clubGest.rows.filter(g => (g.temporada || tempActiva) === tempActiva)
  const clubActivos = gestActiva.filter(g => g.estado_general === 'activo').length
  let clubIngresosTemporada = 0
  let clubConPagoPendiente = 0
  for (const g of gestActiva) {
    const pagos = g.pagos ?? {}
    const meta = g.pagos_meta ?? {}
    let tienePendiente = false
    for (const [mes, estado] of Object.entries(pagos)) {
      if (estado === 'pagado') clubIngresosTemporada += (meta[mes]?.importe_cents ?? 0) / 100
      else if (estado === 'pendiente') tienePendiente = true
    }
    if (tienePendiente) clubConPagoPendiente++
  }

  // ── Novedades: reservas + inscripciones del club de los últimos 7 días ──
  const novedades: Novedad[] = [
    ...bookings.rows.filter(b => b.created_at >= hace7).map(b => ({
      id: `r:${b.id}`, clase: 'reserva' as const, nombre: b.cliente_nombre || '—',
      detalle: b.servicio || 'Reserva', cuando: b.created_at, estado: b.estado_reserva,
    })),
    ...clubSubs.rows.filter(c => c.created_at >= hace7).map(c => {
      const d = (c.datos ?? {}) as Record<string, unknown>
      const nombre = (s(c.nombre) || `${s(d.nombre)} ${s(d.apellidos)}`.trim()) || '—'
      return { id: `c:${c.id}`, clase: 'club' as const, nombre, detalle: s(d.actividad) || 'Inscripción al club', cuando: c.created_at, estado: c.estado }
    }),
  ].sort((a, b) => b.cuando.localeCompare(a.cuando)).slice(0, 12)

  // Servicios más reservados
  const conteo: Record<string, number> = {}
  bookings.rows.forEach(b => { if (b.servicio) conteo[b.servicio] = (conteo[b.servicio] || 0) + 1 })
  const topServicios = Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return {
    ok: bookings.ok,
    reservasHoy, pendientes, enEspera, ingresos, formsNuevos,
    clubNuevos, clubTotal, clubActivos, clubIngresosTemporada, clubConPagoPendiente,
    tempActiva,
    totalReservas: bookings.rows.length,
    novedades,
    topServicios,
  }
}

export async function getRows(tabla: string, orderBy = 'created_at') {
  const db = createAdminClient()
  return safe<Record<string, unknown>>(() => db.from(tabla).select('*').order(orderBy, { ascending: false }).limit(500) as never)
}
