// Verificación de Cloudflare Turnstile (CAPTCHA invisible). Solo servidor.
// Si no hay clave configurada (p.ej. en localhost), NO se exige → la web funciona
// igual. Cuando pongas TURNSTILE_SECRET_KEY en producción, se activa solo.

const SECRET = process.env.TURNSTILE_SECRET_KEY?.trim()

/** ¿Está Turnstile activo? (hay clave secreta configurada) */
export function turnstileActivo(): boolean {
  return !!SECRET
}

/** Verifica el token de Turnstile con Cloudflare. true si OK o si no está configurado. */
export async function verificarTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  if (!SECRET) return true        // sin clave → no se exige
  if (!token) return false
  try {
    const body = new URLSearchParams({ secret: SECRET, response: token })
    if (ip) body.set('remoteip', ip)
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })
    const data = (await r.json()) as { success?: boolean }
    return !!data.success
  } catch {
    return false
  }
}
