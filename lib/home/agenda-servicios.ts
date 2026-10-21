import type { EventoHome } from '@/components/home/CalendarioMes'
import { getMananaMagica, getEventoCentro } from '@/lib/eventos/store'
import { getCampamentosConfig } from '@/lib/campamentos/store'
import { parseFechasLista } from '@/lib/campamentos/editable'
import { fechaDeTexto } from '@/lib/fechas/texto'

// ─────────────────────────────────────────────────────────────────────────────
// Actividades que salen solas en el calendario de la portada con las fechas que
// tienen en su propio panel (Mañana Mágica, Campamento de Navidad y Talleres
// infantiles). Si cambian las fechas en el panel, el calendario cambia con ellas.
// `patron` sirve para no duplicarlas si alguien las apunta también en el
// Calendario del Club. SOLO SERVIDOR.
// ─────────────────────────────────────────────────────────────────────────────

export type EventoServicio = { evento: EventoHome; patron: RegExp }

export async function eventosDeServicios(desde: string, hoy: string): Promise<EventoServicio[]> {
  const [mm, campamentos, taller] = await Promise.all([
    getMananaMagica(), getCampamentosConfig(), getEventoCentro('talleres-infantiles'),
  ])
  const out: EventoServicio[] = []

  // Mañana Mágica del mes (Mickey y Minnie, el 28 de noviembre).
  if (mm.fecha && mm.fecha >= desde) {
    out.push({
      patron: /ma[nñ]anas? m[aá]gicas?/i,
      evento: {
        fecha: mm.fecha, titulo: `Mañana Mágica con ${mm.personaje}`, hora: mm.horario,
        tipo: 'evento', color: 'teal', url: '/servicios/eventos#mananas-magicas',
      },
    })
  }

  // Campamento de Navidad: un recuadro por cada día.
  if (campamentos.navidadEstado !== 'proximo') {
    for (const fecha of parseFechasLista(campamentos.navidadFechas)) {
      if (fecha < desde) continue
      out.push({
        patron: /campamento/i,
        evento: {
          fecha, titulo: 'Campamento de Navidad', hora: campamentos.navidadHorario,
          tipo: 'campamento', color: 'verde', url: '/campamento/navidad',
        },
      })
    }
  }

  // Taller infantil: su fecha está escrita a mano («Sábado 31 de octubre»).
  const fechaTaller = fechaDeTexto(taller.fechas, hoy)
  if (fechaTaller && fechaTaller >= desde) {
    out.push({
      patron: /taller|infantil/i,
      evento: {
        fecha: fechaTaller, titulo: taller.titulo || 'Taller infantil', hora: taller.horario,
        tipo: 'taller', color: 'morado', url: '/servicios/eventos#taller-infantil',
      },
    })
  }

  return out
}
