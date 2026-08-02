// ─────────────────────────────────────────────────────────────────────────────
// Recaudación pública: DOS magnitudes separadas, nunca sumadas entre sí.
//
//   · Billetes (euros): total confirmado que se va recaudando.
//   · Kilos de céntimos (peso): se acumulan sin valor en euros hasta el recuento.
//
// Presentacional (server). Sin emojis: iconos SVG.
// ─────────────────────────────────────────────────────────────────────────────

import { eurosDec, kilos, fechaCorta, AVISO_CENTIMOS, RETO } from '@/lib/reto50/constants'

const IconoBilletes = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="2.5" strokeWidth="1.8" />
    <path strokeWidth="1.8" strokeLinecap="round" d="M6 9v6M18 9v6" />
  </svg>
)

/** Saco de monedas que se ve «lleno»: no simula porcentaje (no hay objetivo de kg). */
const SacoMonedas = ({ className = 'w-16 h-16' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <linearGradient id="saco" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#c99a4e" />
        <stop offset="100%" stopColor="#9a6f2e" />
      </linearGradient>
    </defs>
    <path d="M22 14 L42 14 L38 20 L26 20 Z" fill="#b98a3e" />
    <path d="M20 22 C20 20 24 20 32 20 C40 20 44 20 44 22 C52 32 52 52 40 56 L24 56 C12 52 12 32 20 22 Z" fill="url(#saco)" />
    <g fill="#f2cf7a" stroke="#8a5f22" strokeWidth="0.8">
      <circle cx="27" cy="40" r="4" /><circle cx="37" cy="40" r="4" /><circle cx="32" cy="47" r="4" />
      <text x="27" y="42.5" fontSize="4.5" textAnchor="middle" fill="#8a5f22" stroke="none">€</text>
      <text x="37" y="42.5" fontSize="4.5" textAnchor="middle" fill="#8a5f22" stroke="none">€</text>
      <text x="32" y="49.5" fontSize="4.5" textAnchor="middle" fill="#8a5f22" stroke="none">€</text>
    </g>
  </svg>
)

export default function Recaudacion({ totalConfirmado, billetes, online, centimosKg, etapasConDatos, actualizado }: {
  totalConfirmado: number | null
  billetes: number | null
  online: number | null
  centimosKg: number | null
  etapasConDatos: number
  actualizado: string
}) {
  return (
    <section className="bg-pm-navy py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-black text-pm-red uppercase tracking-widest">La recaudación</p>
          <h2 className="text-3xl font-black text-white mt-2">Dos formas de sumar</h2>
          <p className="text-white/60 text-sm mt-3 leading-relaxed">
            Los billetes se van confirmando en euros. Las monedas de céntimos se recogen al peso y se contarán al final.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Billetes (euros) */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-pm-red">
              <IconoBilletes className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Dinero recaudado en billetes</span>
            </div>
            <div className="text-white font-black text-4xl sm:text-5xl mt-3 leading-none break-words">
              {totalConfirmado == null ? <span className="text-white/40 text-2xl">Aún sin datos</span> : eurosDec(totalConfirmado)}
            </div>
            <div className="text-white/50 text-sm mt-3 leading-relaxed">
              Total confirmado que va destinado a la lucha contra el cáncer a través de la {RETO.causa}.
            </div>
            {(billetes != null || online != null) && (
              <div className="text-white/40 text-xs mt-2">
                {billetes != null && <>{eurosDec(billetes)} en las provincias</>}
                {billetes != null && online != null && ' · '}
                {online != null && <>{eurosDec(online)} en donaciones</>}
              </div>
            )}
          </div>

          {/* Kilos de céntimos (peso) */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-amber-300">Kilos de céntimos recogidos</div>
                <div className="text-white font-black text-4xl sm:text-5xl mt-3 leading-none">
                  {centimosKg == null ? <span className="text-white/40 text-2xl">Aún sin datos</span> : kilos(centimosKg)}
                </div>
              </div>
              <SacoMonedas className="w-20 h-20 shrink-0" />
            </div>
            <p className="text-white/45 text-xs mt-4 leading-relaxed border-t border-white/10 pt-3">{AVISO_CENTIMOS}</p>
          </div>
        </div>

        {(etapasConDatos > 0 || actualizado) && (
          <p className="text-white/40 text-xs text-center mt-6">
            {etapasConDatos > 0 && `${etapasConDatos} de 50 provincias con datos registrados.`}
            {actualizado && ` Última actualización: ${fechaCorta(actualizado)}.`}
          </p>
        )}
      </div>
    </section>
  )
}
