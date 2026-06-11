import { NextResponse } from 'next/server'
import { getRedsysConfig, getBaseUrl } from '@/lib/redsys/config'

export const runtime = 'nodejs'

/**
 * Diagnóstico de configuración de Redsys. NO revela valores secretos: solo
 * indica qué variables están presentes y el entorno resuelto. Útil para
 * comprobar tras configurar las variables en Vercel.
 */
export async function GET() {
  const cfg = getRedsysConfig()
  return NextResponse.json({
    configurada: !!cfg,
    entorno: cfg ? (cfg.isLive ? 'live (REAL)' : 'test (pruebas)') : null,
    baseUrl: getBaseUrl(),
    variables: {
      REDSYS_MERCHANT_CODE: process.env.REDSYS_MERCHANT_CODE ? 'definida ✓' : 'FALTA ✗',
      REDSYS_TERMINAL: process.env.REDSYS_TERMINAL ? 'definida ✓' : 'FALTA ✗',
      REDSYS_SECRET: process.env.REDSYS_SECRET ? 'definida ✓' : 'FALTA ✗',
      REDSYS_ENV: process.env.REDSYS_ENV || 'FALTA ✗',
      REDSYS_MERCHANT_NAME: process.env.REDSYS_MERCHANT_NAME ? 'definida ✓' : '(opcional)',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'FALTA ✗',
    },
  })
}
