import { SEPTIEMBRE } from '@/lib/club/septiembre'

// ─────────────────────────────────────────────────────────────────────────────
// Panel informativo del periodo especial de septiembre (Acrobática, Telas,
// Infantil). Actividad especial de dos semanas previa al inicio normal de
// octubre. Sin pago online: la plaza se gestiona por formulario. Sin emojis.
// ─────────────────────────────────────────────────────────────────────────────

export function PanelSeptiembre() {
  if (!SEPTIEMBRE.activo) return null

  return (
    <section className="rounded-2xl border border-pm-navy/15 bg-white shadow-sm overflow-hidden">
      <div className="bg-pm-navy text-white px-5 py-4">
        <div className="text-[11px] font-black tracking-[0.2em] uppercase text-white/55">Actividad especial de septiembre</div>
        <h3 className="font-black text-lg leading-tight mt-0.5">{SEPTIEMBRE.titulo}</h3>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed">{SEPTIEMBRE.intro}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SEPTIEMBRE.semanas.map(s => (
            <div key={s.label} className="rounded-xl bg-pm-bg p-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{s.label}</div>
              <div className="font-black text-pm-navy text-sm mt-0.5">{s.fechas}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-pm-red/20 bg-pm-red-light p-4">
          <div className="text-[11px] font-black uppercase tracking-wide text-pm-red mb-2">Precios exclusivos de este periodo</div>
          <ul className="divide-y divide-pm-red/10">
            {SEPTIEMBRE.precios.map(p => (
              <li key={p.concepto} className="flex items-center justify-between gap-4 py-2">
                <span className="text-sm text-gray-700">{p.concepto}</span>
                <span className="text-sm font-black text-pm-navy whitespace-nowrap">{p.precio}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          Al rellenar la inscripción, indica que empiezas en septiembre para aplicarte este precio especial.
          La plaza se gestiona por formulario, sin pago online.
        </p>
      </div>
    </section>
  )
}
