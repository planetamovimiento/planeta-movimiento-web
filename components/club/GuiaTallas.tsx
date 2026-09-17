'use client'

import { useRef } from 'react'
import Image from 'next/image'

const IMAGEN = '/medidas-equipacion-club-origen-26-27.jpg'

/** Enlace "Ver guía de tallas" que abre la imagen de la equipación con sus medidas. */
export function GuiaTallas() {
  const ref = useRef<HTMLDialogElement>(null)
  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()}
        className="text-[11px] font-bold text-pm-red hover:underline mt-1">
        📏 Ver guía de tallas
      </button>
      <dialog ref={ref} onClick={e => { if (e.target === ref.current) ref.current?.close() }}
        className="m-auto rounded-2xl p-0 w-[calc(100%-32px)] max-w-3xl backdrop:bg-black/40">
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="font-black text-pm-navy">Equipación Club Origen 26-27 · Tallas</h3>
            <button type="button" onClick={() => ref.current?.close()} className="text-gray-400 text-2xl leading-none" aria-label="Cerrar">×</button>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Medidas de la prenda en cm: [camiseta ancho/largo]·[pantalón ancho/largo]. Si duda entre dos tallas, mejor la mayor.
          </p>
          <a href={IMAGEN} target="_blank" rel="noopener noreferrer" title="Abrir a tamaño completo">
            <Image src={IMAGEN} alt="Equipación del Club Origen 26-27 (camiseta y pantalón) con tabla de medidas por talla"
              width={805} height={434} sizes="(max-width: 800px) 100vw, 768px" className="w-full h-auto rounded-lg border border-gray-100" />
          </a>
          <p className="text-[11px] text-gray-400 mt-2">Toca la imagen para verla en grande.</p>
        </div>
      </dialog>
    </>
  )
}
