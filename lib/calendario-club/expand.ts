import { diaSemana, type EventoClub, type Excepcion, type Ocurrencia } from './tipos'

/** Lista de fechas YYYY-MM-DD entre dos (inclusive). */
function eachDate(desde: string, hasta: string): string[] {
  const out: string[] = []
  if (desde > hasta) return out
  const d = new Date(desde + 'T12:00:00')
  const f = new Date(hasta + 'T12:00:00')
  while (d <= f) {
    out.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return out
}

/** Días que ocupa un evento puntual/marcador (soporta fecha_fin para rangos). */
function diasMarcador(e: EventoClub): string[] {
  if (e.fecha_fin && e.fecha_fin >= e.fecha) return eachDate(e.fecha, e.fecha_fin)
  return [e.fecha]
}

function ocurrenciaDe(e: EventoClub, fecha: string, ex: Excepcion | undefined, esRecurrente: boolean): Ocurrencia {
  const o: Ocurrencia = {
    eventoId: e.id, fecha, tipo: e.tipo, titulo: e.titulo,
    actividad: e.actividad, grupo: e.grupo, monitor: e.monitor, ubicacion: e.ubicacion, temporada: e.temporada,
    hora_inicio: e.hora_inicio, hora_fin: e.hora_fin, todo_el_dia: e.todo_el_dia,
    color: e.color, publico: e.publico, descripcion: e.descripcion, observaciones: e.observaciones,
    cancelado: e.estado === 'cancelado', esRecurrente,
  }
  if (ex) {
    if (ex.accion === 'cancelar') o.cancelado = true
    else if (ex.accion === 'modificar' && ex.cambios) Object.assign(o, ex.cambios)
  }
  return o
}

/**
 * Expande los eventos (puntuales y recurrentes) a ocurrencias concretas dentro
 * del rango [desde, hasta]. Excluye festivos/días sin clase según los flags de la
 * recurrencia y aplica las excepciones por sesión (cancelar / modificar).
 */
export function expandirOcurrencias(
  eventos: EventoClub[],
  excepciones: Excepcion[],
  desde: string,
  hasta: string,
): Ocurrencia[] {
  // Conjuntos de días festivos / sin clase (a partir de los marcadores activos)
  const festivos = new Set<string>()
  const sinClase = new Set<string>()
  for (const e of eventos) {
    if (e.estado === 'cancelado') continue
    if (e.tipo === 'festivo') diasMarcador(e).forEach(d => festivos.add(d))
    if (e.tipo === 'sin_clase') diasMarcador(e).forEach(d => sinClase.add(d))
  }

  const exMap = new Map<string, Excepcion>()
  for (const x of excepciones) exMap.set(`${x.evento_id}|${x.fecha}`, x)

  const out: Ocurrencia[] = []

  for (const e of eventos) {
    if (!e.recurrencia) {
      // Puntual o marcador de varios días
      for (const d of diasMarcador(e)) {
        if (d < desde || d > hasta) continue
        out.push(ocurrenciaDe(e, d, exMap.get(`${e.id}|${d}`), false))
      }
      continue
    }
    // Recurrente
    const ini = e.fecha > desde ? e.fecha : desde
    const limite = e.recurrencia.hasta && e.recurrencia.hasta < hasta ? e.recurrencia.hasta : hasta
    for (const d of eachDate(ini, limite)) {
      if (!e.recurrencia.dias.includes(diaSemana(d))) continue
      if (e.recurrencia.excluir_festivos && festivos.has(d)) continue
      if (e.recurrencia.excluir_sin_clase && sinClase.has(d)) continue
      out.push(ocurrenciaDe(e, d, exMap.get(`${e.id}|${d}`), true))
    }
  }

  out.sort((a, b) =>
    a.fecha.localeCompare(b.fecha) ||
    (a.hora_inicio ?? '99').localeCompare(b.hora_inicio ?? '99') ||
    a.titulo.localeCompare(b.titulo),
  )
  return out
}
