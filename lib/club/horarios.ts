// ─────────────────────────────────────────────────────────────────────────────
// Horarios de clase del Club por actividad y grupo (temporada 2026/27).
// FUENTE ÚNICA: la usa (1) el Portal de Familias para mostrar el horario del
// grupo automáticamente y (2) el seed del Calendario Club (cc_eventos).
// Días: 1=Lun … 7=Dom. Horas 'HH:MM'.
// ─────────────────────────────────────────────────────────────────────────────

export type HorarioGrupo = { dias: number[]; ini: string; fin: string }

export const HORARIOS_CLUB: Record<string, Record<string, HorarioGrupo>> = {
  'Gimnasia Acrobática': {
    'Iniciación 1': { dias: [1, 3], ini: '16:00', fin: '17:00' },
    'Iniciación 2': { dias: [2, 4], ini: '16:00', fin: '17:00' },
    'Iniciación 3': { dias: [5], ini: '16:00', fin: '17:00' },
    'Medio 1': { dias: [1, 3], ini: '17:00', fin: '18:00' },
    'Medio 2': { dias: [2, 4], ini: '17:00', fin: '18:00' },
    'Medio 3': { dias: [5], ini: '17:00', fin: '18:00' },
    'Avanzado 1': { dias: [1, 3], ini: '20:00', fin: '21:30' },
    'Avanzado 2': { dias: [2, 4], ini: '20:00', fin: '21:30' },
    'Adultos': { dias: [1, 2, 3, 4], ini: '20:00', fin: '21:30' },
  },
  'Escuela de aéreos': {
    'Iniciación 1': { dias: [1, 3], ini: '16:00', fin: '17:00' },
    'Iniciación 2': { dias: [5], ini: '16:00', fin: '17:00' },
    'Medio 1': { dias: [1, 3], ini: '17:00', fin: '18:00' },
    'Medio 2': { dias: [2, 4], ini: '16:00', fin: '17:00' },
    'Medio 3': { dias: [5], ini: '17:00', fin: '18:00' },
    'Avanzado 1': { dias: [2, 4], ini: '17:00', fin: '18:00' },
    'Adultos / P. libre': { dias: [1, 2, 3, 4], ini: '20:00', fin: '21:30' },
  },
  'Escuela infantil': {
    'Infantil 1': { dias: [1, 3], ini: '16:00', fin: '17:00' },
    'Infantil 2': { dias: [1, 3], ini: '17:00', fin: '18:00' },
    'Infantil 3': { dias: [2, 4], ini: '16:00', fin: '17:00' },
    'Infantil 4': { dias: [2, 4], ini: '17:00', fin: '18:00' },
    'Infantil 5': { dias: [5], ini: '16:00', fin: '17:00' },
    'Infantil 6': { dias: [5], ini: '17:00', fin: '18:00' },
  },
  'Jiu-Jitsu Brasileño': {
    'JJB 1': { dias: [6], ini: '11:30', fin: '13:30' },
  },
  'Escuela de Bienestar': {
    'Bienestar 1': { dias: [1, 3, 5], ini: '09:30', fin: '10:30' },
    'Pilates': { dias: [1, 3, 5], ini: '09:30', fin: '10:30' },
  },
}

const DIA_NOM: Record<number, string> = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo' }
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()

/** Busca el horario del grupo (insensible a mayúsculas/acentos). null si no hay. */
export function horarioDeGrupo(actividad: string, grupo: string): HorarioGrupo | null {
  if (!actividad || !grupo) return null
  const act = Object.keys(HORARIOS_CLUB).find(a => norm(a) === norm(actividad))
  if (!act) return null
  const grupos = HORARIOS_CLUB[act]
  const key = Object.keys(grupos).find(g => norm(g) === norm(grupo))
  return key ? grupos[key] : null
}

/** Días [1,3] → "Lunes y miércoles"; [1,2,3,4] → "Lunes a jueves"; [6] → "Sábado". */
function diasTexto(dias: number[]): string {
  const d = [...dias].sort((a, b) => a - b)
  if (d.length === 0) return ''
  if (d.length === 1) return DIA_NOM[d[0]]
  const consecutivos = d.every((x, i) => i === 0 || x === d[i - 1] + 1)
  if (consecutivos && d.length >= 3) return `${DIA_NOM[d[0]]} a ${DIA_NOM[d[d.length - 1]].toLowerCase()}`
  return d.slice(0, -1).map(x => DIA_NOM[x].toLowerCase()).join(', ').replace(/^./, c => c.toUpperCase()) + ' y ' + DIA_NOM[d[d.length - 1]].toLowerCase()
}

/** Texto del horario del grupo, p. ej. "Lunes y miércoles · 16:00–17:00". '' si no hay. */
export function horarioTexto(actividad: string, grupo: string): string {
  const h = horarioDeGrupo(actividad, grupo)
  return h ? `${diasTexto(h.dias)} · ${h.ini}–${h.fin}` : ''
}
