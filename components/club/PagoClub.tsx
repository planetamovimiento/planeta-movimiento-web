'use client'

import { useState } from 'react'
import { CLUB_IBAN, CLUB_BANCO, CLUB_TITULAR, conceptoPago } from '@/lib/club/pago'

/**
 * Bloque de información de pago para las actividades del Club Deportivo Origen.
 * Se muestra en los formularios de inscripción: pago en efectivo en las
 * instalaciones o por transferencia bancaria (sin pago online).
 */
export function PagoClub({ actividad, className = '' }: { actividad?: string; className?: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiarIban() {
    try {
      await navigator.clipboard.writeText(CLUB_IBAN.replace(/\s+/g, ''))
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch { /* sin portapapeles */ }
  }

  return (
    <div className={`bg-pm-bg border border-gray-200 rounded-xl p-4 text-left ${className}`}>
      <div className="font-black text-pm-navy text-sm">Cómo se paga</div>
      <p className="text-gray-600 text-xs mt-1 leading-relaxed">
        Las actividades del Club Deportivo Origen se pagan <strong>en efectivo en las instalaciones</strong> o
        por <strong>transferencia bancaria</strong>. No hay pago online.
      </p>

      <div className="mt-3 space-y-2">
        {/* Transferencia */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Transferencia · {CLUB_BANCO}</div>
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="font-mono font-bold text-pm-navy text-sm break-all">{CLUB_IBAN}</span>
            <button type="button" onClick={copiarIban}
              className="shrink-0 text-xs font-bold text-pm-red hover:text-pm-red-dark border border-pm-red/30 rounded-lg px-2.5 py-1 transition-colors">
              {copiado ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Titular: {CLUB_TITULAR}</div>
        </div>

        {/* Concepto */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Concepto de la transferencia</div>
          <div className="text-pm-navy text-sm mt-0.5 font-semibold">{conceptoPago(actividad)}</div>
        </div>
      </div>
    </div>
  )
}
