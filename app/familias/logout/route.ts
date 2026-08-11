import { NextResponse, type NextRequest } from 'next/server'
import { destruirSesionFamilia } from '@/lib/familias/sesion'

export async function POST(request: NextRequest) {
  await destruirSesionFamilia()
  return NextResponse.redirect(new URL('/familias/login', request.url), { status: 303 })
}

export async function GET(request: NextRequest) {
  await destruirSesionFamilia()
  return NextResponse.redirect(new URL('/familias/login', request.url))
}
