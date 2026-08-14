'use client'

import { useEffect } from 'react'

// Botón de impresión. Fija document.title = nombre del archivo para que, al
// "Guardar como PDF", el navegador proponga ese nombre (punto 16).
export default function BarraAsistencia({ nombreArchivo }: { nombreArchivo: string }) {
  useEffect(() => {
    const anterior = document.title
    document.title = nombreArchivo
    return () => { document.title = anterior }
  }, [nombreArchivo])

  return (
    <button onClick={() => window.print()}
      className="text-xs font-bold px-4 py-2 rounded-lg bg-pm-red text-white hover:bg-pm-red-dark">
      🖨️ Imprimir / Guardar PDF
    </button>
  )
}
