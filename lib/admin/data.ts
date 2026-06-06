import { createAdminClient } from '@/lib/supabase/admin'

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

export async function getDashboard() {
  const db = createAdminClient()
  const hoy = new Date().toISOString().slice(0, 10)

  const [bookings, payments, forms] = await Promise.all([
    safe<Booking>(() => db.from('bookings').select('*').order('created_at', { ascending: false }).limit(100) as never),
    safe<{ importe: number; estado: string; fecha: string }>(() => db.from('payments').select('importe, estado, fecha') as never),
    safe<{ id: string; estado: string; tipo: string }>(() => db.from('form_submissions').select('id, estado, tipo') as never),
  ])

  const esClub = (t: string) => t === 'inscripcion_club'
  const reservasHoy = bookings.rows.filter(b => b.fecha === hoy).length
  const pendientes = bookings.rows.filter(b => b.estado_reserva === 'pendiente').length
  const enEspera = bookings.rows.filter(b => b.estado_reserva === 'espera').length
  const ingresos = payments.rows.filter(p => p.estado === 'pagado').reduce((s, p) => s + (Number(p.importe) || 0), 0)
  const formsNuevos = forms.rows.filter(f => f.estado === 'nueva' && !esClub(f.tipo)).length
  const clubNuevos = forms.rows.filter(f => f.estado === 'nueva' && esClub(f.tipo)).length
  const clubTotal = forms.rows.filter(f => esClub(f.tipo)).length

  // Servicios más reservados
  const conteo: Record<string, number> = {}
  bookings.rows.forEach(b => { if (b.servicio) conteo[b.servicio] = (conteo[b.servicio] || 0) + 1 })
  const topServicios = Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return {
    ok: bookings.ok,
    reservasHoy, pendientes, enEspera, ingresos, formsNuevos,
    clubNuevos, clubTotal,
    totalReservas: bookings.rows.length,
    recientes: bookings.rows.slice(0, 8),
    topServicios,
  }
}

export async function getRows(tabla: string, orderBy = 'created_at') {
  const db = createAdminClient()
  return safe<Record<string, unknown>>(() => db.from(tabla).select('*').order(orderBy, { ascending: false }).limit(500) as never)
}
