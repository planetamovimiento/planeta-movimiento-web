import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fecha = searchParams.get('fecha')
  const slots = ['10:00', '11:30', '13:00', '16:00', '17:30', '19:00']
  return NextResponse.json({ fecha, slots })
}
