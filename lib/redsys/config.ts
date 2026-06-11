// ─────────────────────────────────────────────────────────────────────────────
// Configuración de Redsys (TPV Virtual). SOLO servidor.
// Las credenciales viven en variables de entorno; nunca en el código.
//   REDSYS_MERCHANT_CODE  → Número de comercio (FUC, 9 dígitos)
//   REDSYS_TERMINAL       → Número de terminal (normalmente 001)
//   REDSYS_SECRET         → Clave secreta SHA-256 (base64) del banco
//   REDSYS_ENV            → 'test' (pruebas) | 'live' (real). Por defecto 'test'.
//   REDSYS_MERCHANT_NAME  → Nombre del comercio mostrado en la pasarela
//   NEXT_PUBLIC_SITE_URL  → URL pública del sitio (para las URLs de retorno/aviso)
// ─────────────────────────────────────────────────────────────────────────────

export type RedsysConfig = {
  merchantCode: string
  terminal: string
  secret: string
  merchantName: string
  /** Moneda 978 = EUR (ISO-4217 numérico). */
  currency: '978'
  /** URL del formulario de pago de Redsys según el entorno. */
  endpoint: string
  isLive: boolean
}

/** Devuelve la configuración o null si falta alguna credencial imprescindible. */
export function getRedsysConfig(): RedsysConfig | null {
  const merchantCode = process.env.REDSYS_MERCHANT_CODE?.trim()
  const terminal = (process.env.REDSYS_TERMINAL?.trim() || '1')
  const secret = process.env.REDSYS_SECRET?.trim()
  if (!merchantCode || !secret) return null

  const isLive = (process.env.REDSYS_ENV?.trim().toLowerCase() === 'live')
  return {
    merchantCode,
    terminal,
    secret,
    merchantName: process.env.REDSYS_MERCHANT_NAME?.trim() || 'Planeta Movimiento',
    currency: '978',
    endpoint: isLive
      ? 'https://sis.redsys.es/sis/realizarPago'
      : 'https://sis-t.redsys.es:25443/sis/realizarPago',
    isLive,
  }
}

/** URL pública base del sitio para construir las URLs de retorno/notificación. */
export function getBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, '')
  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`
  return 'http://localhost:3000'
}
