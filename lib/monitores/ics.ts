import type { Actividad } from './tipos'

const esc = (s: string) => (s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

/** YYYY-MM-DD (+ HH:MM opcional) → componente DTSTART/DTEND en hora local flotante */
function dt(fecha: string, hora?: string | null) {
  const [y, m, d] = fecha.split('-')
  if (!hora) return { val: `${y}${m}${d}`, allDay: true }
  const [hh, mm] = hora.split(':')
  return { val: `${y}${m}${d}T${hh}${mm}00`, allDay: false }
}

function stamp() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`
}

/** Genera un calendario .ics (compatible con Google Calendar, Apple, Outlook, móvil). */
export function construirICS(actividades: Actividad[], nombreCal = 'Mi calendario · Planeta Movimiento'): string {
  const now = stamp()
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Planeta Movimiento//Monitores//ES',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${esc(nombreCal)}`,
  ]
  for (const a of actividades) {
    const ini = dt(a.fecha, a.hora_inicio)
    const fin = a.hora_fin ? dt(a.fecha, a.hora_fin) : null
    const desc = [a.grupo ? `Grupo: ${a.grupo}` : '', a.observaciones || ''].filter(Boolean).join(' — ')
    lineas.push('BEGIN:VEVENT')
    lineas.push(`UID:${a.id}@planetamovimiento`)
    lineas.push(`DTSTAMP:${now}`)
    if (ini.allDay) {
      lineas.push(`DTSTART;VALUE=DATE:${ini.val}`)
    } else {
      lineas.push(`DTSTART:${ini.val}`)
      if (fin && !fin.allDay) lineas.push(`DTEND:${fin.val}`)
    }
    lineas.push(`SUMMARY:${esc(a.actividad || 'Actividad')}`)
    if (a.lugar) lineas.push(`LOCATION:${esc(a.lugar)}`)
    if (desc) lineas.push(`DESCRIPTION:${esc(desc)}`)
    lineas.push('END:VEVENT')
  }
  lineas.push('END:VCALENDAR')
  return lineas.join('\r\n')
}

/** Descarga el .ics en el navegador. */
export function descargarICS(actividades: Actividad[], nombreArchivo = 'mi-calendario.ics') {
  const blob = new Blob([construirICS(actividades)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
