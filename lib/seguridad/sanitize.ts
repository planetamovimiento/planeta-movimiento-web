// Saneado de datos de usuario antes de guardarlos o meterlos en un email.

/** Quita saltos de línea y caracteres de control. Anti-inyección de cabeceras de email. */
export function limpiarCabecera(v: unknown): string {
  const s = String(v ?? '').replace(/[\r\n\t]+/g, ' ')
  let out = ''
  for (const ch of s) {
    const c = ch.charCodeAt(0)
    if (c >= 32 && c !== 127) out += ch // solo imprimibles (sin DEL)
  }
  return out.trim().slice(0, 320)
}

/** Limpia un texto libre (mensaje/observaciones): quita control chars y recorta. */
export function limpiarTexto(v: unknown, max = 5000): string {
  const s = String(v ?? '')
  let out = ''
  for (const ch of s) {
    const c = ch.charCodeAt(0)
    // permite tab (9), salto de línea (10), retorno (13) y todo lo imprimible (sin DEL)
    if (c === 9 || c === 10 || c === 13 || (c >= 32 && c !== 127)) out += ch
  }
  return out.slice(0, max).trim()
}

/** Escapa HTML para insertar datos de usuario en correos sin riesgo de inyección. */
export function escHtml(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
