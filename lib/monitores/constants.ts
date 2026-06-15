// ─────────────────────────────────────────────────────────────────────────────
// Constantes y helpers puros del Portal de Monitores (servidor + cliente).
// ─────────────────────────────────────────────────────────────────────────────

/** Actividades que se pueden asignar a un monitor. */
export const ACTIVIDADES_MONITOR = [
  'Gimnasia Acrobática', 'Escuela Infantil', 'Jiu-Jitsu Brasileño', 'Telas Aéreas',
  'Escuela de Bienestar', 'Gimnasia Rítmica', 'Circo Inclusivo', 'Campamentos',
  'Cumpleaños', 'Eventos', 'Talleres Participativos', 'PIEA', 'Excursiones', 'Extraescolares',
]

export type EstadoMonitor = 'activo' | 'vacaciones' | 'baja' | 'inactivo'

export const ESTADOS_MONITOR: { id: EstadoMonitor; label: string; badge: string; dot: string }[] = [
  { id: 'activo',     label: 'Activo',      badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  { id: 'vacaciones', label: 'Vacaciones',  badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  { id: 'baja',       label: 'En baja',     badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  { id: 'inactivo',   label: 'Inactivo',    badge: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-400' },
]

export const labelEstadoMonitor = (id: string) => ESTADOS_MONITOR.find(e => e.id === id)?.label ?? id
export const badgeEstadoMonitor = (id: string) => ESTADOS_MONITOR.find(e => e.id === id)?.badge ?? 'bg-gray-100 text-gray-500'

/** Carpetas de recursos por defecto (se siembran si no hay ninguna). */
export const CARPETAS_DEFAULT = [
  'Campamentos', 'Gincanas', 'Manualidades', 'Pinta Caras', 'Envejecimiento Activo',
  'Circo Inclusivo', 'Extraescolares', 'Cumpleaños', 'Eventos', 'Talleres Participativos',
  'Formación Interna', 'Protocolos', 'Prevención y Seguridad',
]

// ── Tipo de documento a partir de su extensión / mime ──────────────────────────
export function tipoDocumento(nombre: string, mime?: string): string {
  const ext = (nombre.split('.').pop() || '').toLowerCase()
  if (ext === 'pdf' || mime === 'application/pdf') return 'pdf'
  if (['doc', 'docx'].includes(ext)) return 'word'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel'
  if (['ppt', 'pptx'].includes(ext)) return 'presentacion'
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif'].includes(ext) || (mime || '').startsWith('image/')) return 'imagen'
  if (['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext) || (mime || '').startsWith('video/')) return 'video'
  return 'otro'
}

export const ICONO_DOC: Record<string, string> = {
  pdf: '📕', word: '📘', excel: '📗', presentacion: '📙', imagen: '🖼️', video: '🎬', otro: '📄',
}

// ── Horas trabajadas (a partir de los fichajes) ────────────────────────────────
type FichajeHoras = { fecha: string; entrada: string; salida: string | null }

/** Horas de un fichaje cerrado (0 si sigue abierto). */
export function horasDeFichaje(f: FichajeHoras): number {
  if (!f.salida) return 0
  const ms = new Date(f.salida).getTime() - new Date(f.entrada).getTime()
  return ms > 0 ? ms / 3_600_000 : 0
}

function lunesDeEstaSemana(d: Date): Date {
  const x = new Date(d); x.setHours(0, 0, 0, 0)
  const dia = (x.getDay() + 6) % 7 // 0 = lunes
  x.setDate(x.getDate() - dia)
  return x
}

/** Resumen de horas: día (hoy), semana (lun-dom), mes y acumulado total. */
export function resumenHoras(fichajes: FichajeHoras[], ahora = new Date()): { dia: number; semana: number; mes: number; total: number } {
  const hoy = ahora.toISOString().slice(0, 10)
  const mes = ahora.toISOString().slice(0, 7)
  const lunes = lunesDeEstaSemana(ahora).toISOString().slice(0, 10)
  let dia = 0, semana = 0, mesH = 0, total = 0
  for (const f of fichajes) {
    const h = horasDeFichaje(f)
    if (!h) continue
    total += h
    if (f.fecha === hoy) dia += h
    if (f.fecha >= lunes && f.fecha <= hoy) semana += h
    if (f.fecha.slice(0, 7) === mes) mesH += h
  }
  return { dia, semana, mes: mesH, total }
}

/** Formatea horas decimales como "Xh Ym". */
export function fmtHoras(h: number): string {
  const horas = Math.floor(h)
  const min = Math.round((h - horas) * 60)
  if (horas === 0 && min === 0) return '0h'
  return `${horas}h${min > 0 ? ` ${min}m` : ''}`
}
