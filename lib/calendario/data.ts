import { createAdminClient } from '@/lib/supabase/admin'
import { getRegistrosCRM } from '@/lib/crm/data'
import { getEventoCentro, getMananaMagica } from '@/lib/eventos/store'
import { parseFechasDSC } from '@/lib/eventos/centro'
import { SEMANAS_VERANO, FECHAS_NAVIDAD, FECHAS_SEMANA_SANTA } from '@/app/servicios/campamentos/config'
import type { EventoCalendario } from './constants'

/** Días (YYYY-MM-DD) entre dos fechas inclusive. */
function rango(inicio: string, fin: string): string[] {
  const res: string[] = []
  const d = new Date(inicio + 'T12:00:00')
  const f = new Date(fin + 'T12:00:00')
  while (d <= f) {
    res.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return res
}

export async function getEventosCalendario(): Promise<{ eventos: EventoCalendario[]; ok: boolean }> {
  const out: EventoCalendario[] = []

  // 1) RESERVAS del CRM (con fecha de realización)
  try {
    const { registros } = await getRegistrosCRM()
    for (const r of registros) {
      const f = (r.fecha_realizacion || '').slice(0, 10)
      if (!f) continue
      if (r.estado_reserva === 'cancelada') continue
      out.push({
        id: `r-${r.origen}-${r.id}`, fecha: f,
        titulo: r.cliente_nombre ? `${r.servicio} · ${r.cliente_nombre}` : r.servicio,
        servicio: r.servicio, categoria: r.categoria, tipo: 'reserva', detalle: r.cliente_nombre,
      })
    }
  } catch { /* sin CRM */ }

  // 2) CAMPAMENTOS programados (todo el año)
  for (const s of SEMANAS_VERANO) {
    for (const d of rango(s.inicio, s.fin)) {
      out.push({ id: `v-${d}`, fecha: d, titulo: `Verano · Sem. ${s.id} (${s.elemento})`, servicio: 'Campamento de Verano', categoria: 'Campamentos', tipo: 'programado' })
    }
  }
  for (const d of FECHAS_NAVIDAD) out.push({ id: `n-${d}`, fecha: d, titulo: 'Campamento de Navidad', servicio: 'Campamento de Navidad', categoria: 'Campamentos', tipo: 'programado' })
  for (const d of FECHAS_SEMANA_SANTA) out.push({ id: `s-${d}`, fecha: d, titulo: 'Campamento de Semana Santa', servicio: 'Campamento de Semana Santa', categoria: 'Campamentos', tipo: 'programado' })

  // 3) EVENTOS DEL CENTRO programados
  try {
    const dsc = await getEventoCentro('dias-sin-cole')
    for (const f of parseFechasDSC(dsc.fechas)) {
      out.push({ id: `dsc-${f.fecha}`, fecha: f.fecha, titulo: `Días Sin Cole · ${f.label}`, servicio: 'Días Sin Cole', categoria: 'Eventos', tipo: 'programado' })
    }
    const mm = await getMananaMagica()
    if (mm.fecha) out.push({ id: 'mm', fecha: mm.fecha, titulo: `Mañana Mágica · ${mm.personaje}`, servicio: 'Mañanas Mágicas', categoria: 'Eventos', tipo: 'programado' })
  } catch { /* sin config */ }

  // 4) EVENTOS MANUALES
  let ok = true
  try {
    const db = createAdminClient()
    const { data, error } = await db.from('calendario_eventos').select('*')
    if (error) ok = false
    for (const m of data ?? []) {
      out.push({
        id: `m-${m.id}`, fecha: String(m.fecha).slice(0, 10), titulo: String(m.titulo),
        servicio: (m.servicio as string) || 'Evento manual', categoria: 'Manual', tipo: 'manual', detalle: (m.nota as string) || '',
      })
    }
  } catch { ok = false }

  return { eventos: out, ok }
}
