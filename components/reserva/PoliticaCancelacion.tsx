import { CANCELACION_TRAMOS, CANCELACION_NOTAS } from '@/lib/reservas/cancelacion'

// ─────────────────────────────────────────────────────────────────────────────
// Política de cancelación, justo antes del botón de pago de cada reserva: así
// la familia la ve antes de pagar (información previa a la contratación).
// Los tramos van siempre a la vista; las notas, desplegables para no estorbar.
// ─────────────────────────────────────────────────────────────────────────────

export default function PoliticaCancelacion({ tema = 'claro' }: { tema?: 'claro' | 'oscuro' }) {
  const oscuro = tema === 'oscuro'
  return (
    <div className={`rounded-xl border px-4 py-3 text-xs leading-relaxed ${
      oscuro ? 'border-white/15 bg-white/5 text-white/75' : 'border-gray-200 bg-gray-50 text-gray-600'
    }`}>
      <div className={`font-black mb-1 ${oscuro ? 'text-white' : 'text-pm-navy'}`}>Política de cancelación</div>
      <ul className="space-y-0.5">
        {CANCELACION_TRAMOS.map(t => (
          <li key={t.cuando}><strong className={oscuro ? 'text-white' : 'text-pm-navy'}>{t.cuando}:</strong> {t.devolucion}.</li>
        ))}
      </ul>
      <details className="mt-1">
        <summary className={`cursor-pointer font-semibold ${oscuro ? 'text-white/80' : 'text-pm-navy'}`}>Más detalles</summary>
        <ul className="mt-1 space-y-0.5 list-disc pl-4">
          {CANCELACION_NOTAS.map(n => <li key={n}>{n}</li>)}
        </ul>
      </details>
      <p className="mt-1.5">
        Al reservar aceptas esta política y las{' '}
        <a href="/terminos-y-condiciones#cancelaciones" target="_blank" className="underline">condiciones de uso</a>.
      </p>
    </div>
  )
}
