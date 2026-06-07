import { createAdminClient } from '@/lib/supabase/admin'
import { getRegistrosCRM } from '@/lib/crm/data'
import { getEventoCentro, getMananaMagica } from '@/lib/eventos/store'
import { parseFechasDSC } from '@/lib/eventos/centro'
import { getCampamentosConfig } from '@/lib/campamentos/store'
import { semanasResueltas, parseFechasLista } from '@/lib/campamentos/editable'
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
      if (r.estado_reserva === 'cancelada') continue   // las canceladas NO aparecen en el calendario
      const cumpleanero = r.categoria === 'Cumpleaños' ? String((r.datos as Record<string, unknown>)?.cumpleanero ?? '') : ''
      const nombre = cumpleanero || r.cliente_nombre
      out.push({
        id: `r-${r.origen}-${r.id}`, fecha: f,
        titulo: nombre ? `${r.servicio} · ${nombre}` : r.servicio,
        servicio: r.servicio, categoria: r.categoria, tipo: 'reserva', detalle: nombre,
      })
    }
  } catch { /* sin CRM */ }

  // 2) CAMPAMENTOS programados (todo el año), según la config editable
  try {
    const camp = await getCampamentosConfig()
    for (const s of semanasResueltas(camp)) {
      if (!s.inicio || !s.fin) continue
      for (const d of rango(s.inicio, s.fin)) {
        out.push({ id: `v-${d}`, fecha: d, titulo: `Verano · Sem. ${s.id} (${s.elemento})`, servicio: 'Campamento de Verano', categoria: 'Campamentos', tipo: 'programado' })
      }
    }
    for (const d of parseFechasLista(camp.navidadFechas)) out.push({ id: `n-${d}`, fecha: d, titulo: 'Campamento de Navidad', servicio: 'Campamento de Navidad', categoria: 'Campamentos', tipo: 'programado' })
    for (const d of parseFechasLista(camp.ssantaFechas)) out.push({ id: `s-${d}`, fecha: d, titulo: 'Campamento de Semana Santa', servicio: 'Campamento de Semana Santa', categoria: 'Campamentos', tipo: 'programado' })
  } catch { /* sin config */ }

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
