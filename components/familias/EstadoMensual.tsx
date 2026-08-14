import { MESES_TEMPORADA, ESTADO_PAGO_META, type EstadoPago } from '@/lib/club/constants'
import { eurosCuota } from '@/lib/club/cuota'

// ─────────────────────────────────────────────────────────────────────────────
// Estado mensual de cuotas (Sep→Jun) para la familia. Accesible: color + icono
// + texto (no solo color). Presentacional (sirve para el portal y la vista
// previa de admin). La familia solo consulta; no edita.
// ─────────────────────────────────────────────────────────────────────────────

const ICONO: Record<string, string> = { pagado: '✓', pendiente: '!', baja: '✕' }
const TEXTO: Record<string, string> = { pagado: 'Pagado', pendiente: 'Pendiente', baja: 'Baja' }
const CLASE: Record<string, string> = {
  pagado: 'bg-green-50 border-green-200 text-green-700',
  pendiente: 'bg-amber-50 border-amber-200 text-amber-700',
  baja: 'bg-red-50 border-red-200 text-red-700',
}

export function EstadoMensual({ pagos, meta: importes }: { pagos: Record<string, string>; meta?: Record<string, { importe_cents?: number }> }) {
  return (
    <div>
      <div className="grid grid-cols-5 gap-2">
        {MESES_TEMPORADA.map(m => {
          const e = (pagos[m.key] ?? '') as EstadoPago | ''
          const meta = e ? ESTADO_PAGO_META[e] : null
          const cents = importes?.[m.key]?.importe_cents
          const tieneImporte = typeof cents === 'number' && cents > 0
          return (
            <div key={m.key} className={`rounded-xl border px-1 py-2 text-center ${e ? CLASE[e] : 'bg-white border-gray-200 text-gray-400'}`}
              title={`${meta?.label ?? 'Sin definir'}${tieneImporte ? ` · ${eurosCuota(cents!)}` : ''}`}>
              <div className="text-[11px] font-bold">{m.label}</div>
              <div className="text-sm font-black mt-0.5" aria-label={TEXTO[e] ?? 'Sin definir'}>{ICONO[e] ?? '·'}</div>
              {tieneImporte && <div className="text-[10px] font-bold mt-0.5">{eurosCuota(cents!).replace(' €', '€')}</div>}
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500 mt-2">
        <span className="flex items-center gap-1"><span className="text-green-600 font-black">✓</span> Pagado</span>
        <span className="flex items-center gap-1"><span className="text-amber-600 font-black">!</span> Pendiente</span>
        <span className="flex items-center gap-1"><span className="text-red-600 font-black">✕</span> Baja</span>
        <span className="flex items-center gap-1"><span className="text-gray-400 font-black">·</span> Sin definir</span>
      </div>
    </div>
  )
}
