// Heurísticas anti-spam (sin claves externas). Detecta patrones típicos de bots.

const PALABRAS_SPAM = [
  'viagra', 'cialis', 'casino', 'porn', 'crypto', 'bitcoin', 'forex', 'rolex',
  'backlink', 'seo service', 'seo services', 'free money', 'earn money',
  'work from home', 'make money', 'click here', '$$$', 'binary option',
  'loan offer', 'bulk email', 'mass email', 'buy now cheap',
]

const DOMINIOS_DESECHABLES = [
  'mailinator.com', 'guerrillamail', 'tempmail', '10minutemail', 'yopmail',
  'sharklasers.com', 'trashmail', 'getnada', 'maildrop', 'throwaway',
  'discard.email', 'temp-mail', 'fakeinbox', 'mohmal',
]

/** Analiza el contenido y el email; devuelve si hay que bloquear y por qué. */
export function analizarSpam(p: { contenido?: string; email?: string }): { bloquear: boolean; motivo: string } {
  const txt = (p.contenido || '').toLowerCase()
  const email = (p.email || '').toLowerCase()

  if (email && DOMINIOS_DESECHABLES.some(d => email.includes(d))) {
    return { bloquear: true, motivo: 'Correo desechable/temporal' }
  }

  const enlaces = (txt.match(/https?:\/\//g) || []).length
  if (enlaces >= 4) return { bloquear: true, motivo: `Demasiados enlaces (${enlaces})` }

  const palabra = PALABRAS_SPAM.find(w => txt.includes(w))
  if (palabra) return { bloquear: true, motivo: `Palabra de spam: ${palabra}` }

  // Bloques largos en alfabetos no esperados (cirílico) → típico de spam masivo.
  if (new RegExp('[\\u0400-\\u04FF]{8,}').test(txt)) return { bloquear: true, motivo: 'Texto en alfabeto no esperado' }

  return { bloquear: false, motivo: '' }
}
