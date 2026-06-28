import { NextResponse } from 'next/server'
import { getBaseUrl } from '@/lib/redsys/config'
import { verificarNotificacion } from '@/lib/redsys/firma'
import { procesarRespuestaRedsys } from '@/lib/redsys/confirmar'

export const runtime = 'nodejs'

/**
 * Retorno del navegador desde Redsys (URLOK / URLKO). Redsys puede llegar por
 * GET o POST. La notificación servidor-a-servidor sigue siendo la fuente de
 * verdad, pero si Redsys envía aquí los parámetros firmados (POST) los usamos
 * como red de seguridad para confirmar el cobro (idempotente): así un pago que
 * pasó la pasarela nunca se queda "pendiente" si la notificación no llegó.
 */
async function handle(request: Request) {
  // Red de seguridad: confirmar el cobro si Redsys mandó parámetros firmados.
  if (request.method === 'POST') {
    try {
      const form = await request.formData()
      const mp = String(form.get('Ds_MerchantParameters') || '')
      const sig = String(form.get('Ds_Signature') || '')
      if (mp && sig) {
        const datos = verificarNotificacion(mp, sig)
        if (datos) await procesarRespuestaRedsys(datos)
      }
    } catch { /* sin cuerpo / no parseable → seguimos con la redirección */ }
  }

  const { searchParams } = new URL(request.url)
  const estado = searchParams.get('estado') === 'ok' ? 'ok' : 'ko'
  const numero = searchParams.get('numero') || ''

  const destino = new URL('/reservar/confirmacion', getBaseUrl())
  destino.searchParams.set('estado', estado)
  if (numero) destino.searchParams.set('numero', numero)

  return NextResponse.redirect(destino, 303)
}

export async function GET(request: Request) { return handle(request) }
export async function POST(request: Request) { return handle(request) }
