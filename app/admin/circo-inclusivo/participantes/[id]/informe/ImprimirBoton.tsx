'use client'

export default function ImprimirBoton() {
  return (
    <button onClick={() => window.print()} className="no-print bg-pm-red hover:bg-pm-red-dark text-white font-bold px-5 py-2.5 rounded-xl text-sm">
      🖨️ Imprimir / Guardar PDF
    </button>
  )
}
