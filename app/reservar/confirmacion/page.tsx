'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ConfirmacionContent() {
  const params = useSearchParams()
  const numero = params.get('numero') ?? 'PM-2026-0000'
  const servicio = params.get('servicio') ?? ''
  const fecha = params.get('fecha') ?? ''
  const hora = params.get('hora') ?? ''
  const nombre = params.get('nombre') ?? ''
  const email = params.get('email') ?? ''

  const fechaLabel = fecha
    ? new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(fecha + 'T00:00:00'))
    : ''

  return (
    <main className="min-h-screen bg-pm-bg flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-sm max-w-lg w-full p-8 text-center">
        {/* Check icon */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-pm-navy mb-2">¡Reserva recibida!</h1>
        {nombre && <p className="text-gray-500 mb-4">Gracias, {nombre}</p>}

        <div className="inline-block bg-pm-red-light text-pm-red font-bold text-lg px-4 py-2 rounded-xl mb-6">
          {numero}
        </div>

        {/* Resumen */}
        <div className="bg-pm-bg rounded-xl p-5 text-left space-y-3 mb-6">
          {servicio && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Servicio</span>
              <span className="font-semibold text-pm-navy">{servicio}</span>
            </div>
          )}
          {fechaLabel && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Fecha</span>
              <span className="font-semibold text-pm-navy capitalize">{fechaLabel}</span>
            </div>
          )}
          {hora && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Hora</span>
              <span className="font-semibold text-pm-navy">{hora}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-8">
          Te enviaremos la confirmación a tu email
          {email && <span className="font-medium text-gray-700"> ({email})</span>}.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 px-6 py-3 border-2 border-pm-navy text-pm-navy font-bold rounded-xl hover:bg-pm-navy hover:text-white transition-colors text-center"
          >
            Volver al inicio
          </Link>
          <Link
            href="/reservar"
            className="flex-1 px-6 py-3 bg-pm-red text-white font-bold rounded-xl hover:bg-pm-red-dark transition-colors text-center"
          >
            Hacer otra reserva
          </Link>
        </div>
      </div>

      {/* Banner inferior */}
      <div className="mt-8 text-center text-sm text-gray-500">
        ¿Tienes alguna duda? Escríbenos a{' '}
        <a href="mailto:info@planetamovimiento.es" className="text-pm-red font-medium hover:underline">
          info@planetamovimiento.es
        </a>
      </div>
    </main>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-pm-bg flex items-center justify-center"><div className="text-gray-400">Cargando...</div></div>}>
      <ConfirmacionContent />
    </Suspense>
  )
}
