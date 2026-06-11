import { NextResponse } from 'next/server'
import { getBaseUrl } from '@/lib/redsys/config'

export const runtime = 'nodejs'

/**
 * Retorno del navegador desde Redsys (URLOK / URLKO). Solo redirige a la
 * página de confirmación; el cobro real lo confirma la notificación
 * servidor-a-servidor, no esta ruta. Redsys puede llegar por GET o POST.
 */
function handle(request: Request) {
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
