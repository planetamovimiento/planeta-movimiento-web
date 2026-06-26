import { getClientIp } from './ip'
import { registrarEvento, contarEventosIp } from './log'
import { analizarSpam } from './spam'
import { verificarTurnstile, turnstileActivo } from './turnstile'

// ─────────────────────────────────────────────────────────────────────────────
// Guard multicapa para los envíos de formularios. TODO formulario público pasa
// por aquí (en el servidor): honeypot, tiempo mínimo, rate-limit, spam y, si está
// configurado, Turnstile. Registra cada evento en security_events.
// ─────────────────────────────────────────────────────────────────────────────

const VENTANA_MS = 10 * 60 * 1000   // ventana de rate-limit: 10 minutos
const MAX_ENVIOS = 8                // máx. envíos por IP en la ventana
const MIN_TIEMPO_MS = 2500          // tiempo mínimo para rellenar el formulario

const ERR_GENERICO = 'No se ha podido enviar. Si crees que es un error, inténtalo de nuevo en unos minutos.'

export type EntradaGuard = {
  formTipo: string
  honeypot?: string
  renderedAt?: number
  turnstileToken?: string
  email?: string
  contenido?: string
}

export type ResultadoGuard = { ok: true } | { ok: false; error: string }

/** Ejecuta todas las capas de protección. Devuelve ok o el error a mostrar. */
export async function comprobarEnvioForm(p: EntradaGuard): Promise<ResultadoGuard> {
  const ip = await getClientIp()

  // 1) Honeypot: campo oculto que un humano nunca rellena.
  if (p.honeypot && p.honeypot.trim() !== '') {
    await registrarEvento({ tipo: 'bot', ip, formTipo: p.formTipo, motivo: 'Honeypot relleno' })
    return { ok: false, error: ERR_GENERICO }
  }

  // 2) Tiempo mínimo: bloquea envíos instantáneos (bots).
  if (typeof p.renderedAt === 'number' && p.renderedAt > 0 && Date.now() - p.renderedAt < MIN_TIEMPO_MS) {
    await registrarEvento({ tipo: 'bot', ip, formTipo: p.formTipo, motivo: 'Envío demasiado rápido' })
    return { ok: false, error: ERR_GENERICO }
  }

  // 3) Rate-limit por IP (cuenta eventos recientes).
  const recientes = await contarEventosIp(ip, VENTANA_MS)
  if (recientes >= MAX_ENVIOS) {
    await registrarEvento({ tipo: 'rate-limit', ip, formTipo: p.formTipo, motivo: `Más de ${MAX_ENVIOS} envíos en 10 min` })
    return { ok: false, error: 'Has hecho demasiados envíos seguidos. Espera unos minutos e inténtalo de nuevo.' }
  }

  // 4) Spam por contenido / email desechable.
  const spam = analizarSpam({ contenido: p.contenido, email: p.email })
  if (spam.bloquear) {
    await registrarEvento({ tipo: 'spam', ip, formTipo: p.formTipo, motivo: spam.motivo, detalle: { email: p.email } })
    return { ok: false, error: ERR_GENERICO }
  }

  // 5) Turnstile (solo si hay clave configurada).
  if (turnstileActivo()) {
    const okT = await verificarTurnstile(p.turnstileToken, ip)
    if (!okT) {
      await registrarEvento({ tipo: 'bot', ip, formTipo: p.formTipo, motivo: 'Captcha (Turnstile) no superado' })
      return { ok: false, error: 'Verificación de seguridad fallida. Recarga la página e inténtalo de nuevo.' }
    }
  }

  // OK → registra el envío (sirve también para el rate-limit y la auditoría).
  await registrarEvento({ tipo: 'envio', ip, formTipo: p.formTipo })
  return { ok: true }
}
