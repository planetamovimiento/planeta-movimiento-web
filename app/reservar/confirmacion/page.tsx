'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ConfirmacionContent() {
  const params = useSearchParams()
  const estado = params.get('estado') // 'ok' | 'ko' | null (reserva sin pago)
  const numero = params.get('numero') ?? ''
  const ko = estado === 'ko'

  return (
    <main className="min-h-screen bg-pm-bg flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-sm max-w-lg w-full p-8 text-center">
        {ko ? (
          <>
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01M10.29 3.86l-8.48 14.7A1 1 0 002.67 20h18.66a1 1 0 00.86-1.44l-8.48-14.7a1 1 0 00-1.73 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-pm-navy mb-2">Pago no completado</h1>
            <p className="text-gray-500 mb-6">
              No se ha realizado ningún cargo. Tu reserva no ha quedado confirmada. Puedes intentarlo de nuevo.
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-pm-navy mb-2">
              {estado === 'ok' ? '¡Pago recibido!' : '¡Reserva recibida!'}
            </h1>
            <p className="text-gray-500 mb-4">
              {estado === 'ok'
                ? 'Tu reserva ha quedado confirmada. Te enviaremos los detalles por email.'
                : 'Gracias. Te enviaremos la confirmación por email.'}
            </p>
            {numero && (
              <div className="inline-block bg-pm-red-light text-pm-red font-bold text-lg px-4 py-2 rounded-xl mb-6">
                {numero}
              </div>
            )}
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
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
            {ko ? 'Reintentar reserva' : 'Hacer otra reserva'}
          </Link>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        ¿Tienes alguna duda? Escríbenos a{' '}
        <a href="mailto:info@planetamovimiento.com" className="text-pm-red font-medium hover:underline">
          info@planetamovimiento.com
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
