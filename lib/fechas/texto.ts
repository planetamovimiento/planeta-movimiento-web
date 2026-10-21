// ─────────────────────────────────────────────────────────────────────────────
// Fecha a partir de un texto en español («Sábado 31 de octubre», «5 de enero de
// 2027»). Algunos servicios guardan su fecha así, escrita a mano en el panel.
// Archivo puro: sin dependencias.
// ─────────────────────────────────────────────────────────────────────────────

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const norm = (s: string) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/**
 * Primer «<día> de <mes> [de <año>]» del texto, en YYYY-MM-DD.
 * Sin año, el próximo que llegue desde `hoy` (YYYY-MM-DD): si el día ya pasó
 * este año, se entiende el siguiente. Devuelve null si no hay fecha clara.
 */
export function fechaDeTexto(texto: string, hoy: string): string | null {
  const m = norm(texto).match(/(\d{1,2})\s+de\s+([a-z]+)(?:\s+(?:de\s+)?(\d{4}))?/)
  if (!m) return null
  const dia = Number(m[1])
  const mes = MESES.indexOf(m[2]) + 1
  if (!mes || dia < 1 || dia > 31) return null

  const dos = (n: number) => String(n).padStart(2, '0')
  if (m[3]) return `${m[3]}-${dos(mes)}-${dos(dia)}`

  const anio = Number(hoy.slice(0, 4))
  const esteAnio = `${anio}-${dos(mes)}-${dos(dia)}`
  return esteAnio >= hoy ? esteAnio : `${anio + 1}-${dos(mes)}-${dos(dia)}`
}
