'use client'

import { useEffect } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Descuento de los eventos en el centro. Solo uno de los dos, nunca los dos:
// hermanos (−20%, hace falta más de un niño) o socio del club (−15%, pide el nº
// de socio solo para poder comprobarlo después; no valida nada).
// ─────────────────────────────────────────────────────────────────────────────

export type TipoDescuento = 'ninguno' | 'hermanos' | 'socio'
export type Descuento = { tipo: TipoDescuento; numeroSocio: string }

export const DESCUENTO_VACIO: Descuento = { tipo: 'ninguno', numeroSocio: '' }

export const PORCENTAJE: Record<TipoDescuento, number> = { ninguno: 0, hermanos: 20, socio: 15 }

/** Total con el descuento aplicado (2 decimales). */
export function aplicarDescuento(total: number, d: Descuento): number {
  return Math.round(total * (1 - PORCENTAJE[d.tipo] / 100) * 100) / 100
}

/** Resumen para el CRM y el correo ('Hermanos −20%' / 'Socio −15% · nº 42'). */
export function textoDescuento(d: Descuento): string {
  if (d.tipo === 'hermanos') return 'Hermanos −20%'
  if (d.tipo === 'socio') return `Socio del club −15%${d.numeroSocio.trim() ? ` · nº ${d.numeroSocio.trim()}` : ''}`
  return ''
}

type Tema = 'claro' | 'oscuro'

export function SelectorDescuento({ ninos, valor, onChange, tema = 'claro' }: {
  ninos: number
  valor: Descuento
  onChange: (d: Descuento) => void
  tema?: Tema
}) {
  const hermanosPosible = ninos >= 2
  // Si se baja a un solo niño, el de hermanos deja de valer.
  useEffect(() => {
    if (valor.tipo === 'hermanos' && !hermanosPosible) onChange(DESCUENTO_VACIO)
  }, [hermanosPosible]) // eslint-disable-line react-hooks/exhaustive-deps

  const oscuro = tema === 'oscuro'
  const etiqueta = oscuro ? 'text-orange-200' : 'text-pm-navy'
  const ayuda = oscuro ? 'text-orange-300/60' : 'text-gray-400'
  const base = 'flex-1 min-w-[130px] px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all text-left'
  const noSel = oscuro
    ? 'border-orange-500/30 bg-orange-950/20 text-orange-200/80 hover:border-orange-400'
    : 'border-gray-200 text-pm-navy hover:border-pm-red'
  const sel = oscuro ? 'border-orange-400 bg-orange-500/20 text-orange-200' : 'border-pm-red bg-pm-red-light text-pm-red'

  const elegir = (tipo: TipoDescuento) =>
    onChange(tipo === valor.tipo ? DESCUENTO_VACIO : { tipo, numeroSocio: tipo === 'socio' ? valor.numeroSocio : '' })

  return (
    <div>
      <label className={`block text-xs font-bold mb-2 ${etiqueta}`}>¿Tienes descuento? (solo uno)</label>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => elegir('hermanos')} disabled={!hermanosPosible}
          className={`${base} ${valor.tipo === 'hermanos' ? sel : noSel} disabled:opacity-40 disabled:cursor-not-allowed`}>
          👧👦 Hermanos −20%
          <span className="block font-normal opacity-70">{hermanosPosible ? 'Para 2 niños o más' : 'Añade 2 niños o más'}</span>
        </button>
        <button type="button" onClick={() => elegir('socio')}
          className={`${base} ${valor.tipo === 'socio' ? sel : noSel}`}>
          ⭐ Socio del club −15%
          <span className="block font-normal opacity-70">Club Deportivo Origen</span>
        </button>
      </div>

      {valor.tipo === 'socio' && (
        <input required type="text" placeholder="Tu nº de socio *" value={valor.numeroSocio}
          onChange={e => onChange({ tipo: 'socio', numeroSocio: e.target.value })}
          className={`w-full mt-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none ${
            oscuro
              ? 'border border-orange-500/30 bg-orange-950/20 text-white placeholder-orange-300/50 focus:border-orange-400'
              : 'border border-gray-200 focus:border-pm-red'
          }`} />
      )}

      <p className={`text-[11px] mt-2 ${ayuda}`}>
        Los descuentos no se acumulan. Comprobamos el nº de socio antes de la actividad.
      </p>
    </div>
  )
}
