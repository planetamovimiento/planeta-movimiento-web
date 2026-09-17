'use client'

import { useRef } from 'react'
import { MEDIDAS_EQUIPACION } from '@/lib/club/cuota'

/** Enlace "Ver guía de tallas" que abre las medidas de la equipación (camiseta + pantalón). */
export function GuiaTallas() {
  const ref = useRef<HTMLDialogElement>(null)
  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()}
        className="text-[11px] font-bold text-pm-red hover:underline mt-1">
        📏 Ver guía de tallas
      </button>
      <dialog ref={ref} onClick={e => { if (e.target === ref.current) ref.current?.close() }}
        className="m-auto rounded-2xl p-0 w-[calc(100%-32px)] max-w-md backdrop:bg-black/40">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="font-black text-pm-navy">Guía de tallas · Equipación</h3>
            <button type="button" onClick={() => ref.current?.close()} className="text-gray-400 text-xl leading-none" aria-label="Cerrar">×</button>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Camiseta + pantalón. Medidas de la prenda en plano: <b>ancho / largo</b>.
            Si duda entre dos tallas, mejor la mayor.
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400">
                <th className="py-1.5 font-bold">Talla</th>
                <th className="py-1.5 font-bold">Camiseta</th>
                <th className="py-1.5 font-bold">Pantalón</th>
              </tr>
            </thead>
            <tbody>
              {MEDIDAS_EQUIPACION.map(m => (
                <tr key={m.talla} className="border-t border-gray-100">
                  <td className="py-1.5 font-black text-pm-navy">{m.talla}</td>
                  <td className="py-1.5 text-gray-600">{m.camiseta}</td>
                  <td className="py-1.5 text-gray-600">{m.pantalon}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-gray-400 mt-3">4, 8, 12 y 16 son tallas infantiles (edad aproximada).</p>
        </div>
      </dialog>
    </>
  )
}
