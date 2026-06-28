import { NextResponse } from 'next/server'
import { verificarNotificacion } from '@/lib/redsys/firma'
import { procesarRespuestaRedsys } from '@/lib/redsys/confirmar'

// El cifrado 3DES requiere el runtime de Node (no edge).
export const runtime = 'nodejs'

/**
 * Notificación servidor-a-servidor de Redsys (DS_MERCHANT_MERCHANTURL).
 * Fuente de verdad principal del cobro. Verifica la firma y, de forma
 * idempotente, marca el cobro y la reserva como pagados (o fallidos).
 */
export async function POST(request: Request) {
  let merchantParameters = ''
  let signature = ''
  try {
    const form = await request.formData()
    merchantParameters = String(form.get('Ds_MerchantParameters') || '')
    signature = String(form.get('Ds_Signature') || '')
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  if (!merchantParameters || !signature) return NextResponse.json({ ok: false }, { status: 400 })

  const datos = verificarNotificacion(merchantParameters, signature)
  if (!datos) return NextResponse.json({ ok: false, error: 'firma' }, { status: 403 })

  // Si no encontramos el cobro, respondemos 200 igualmente para que Redsys no reintente sin fin.
  await procesarRespuestaRedsys(datos)
  return NextResponse.json({ ok: true })
}
