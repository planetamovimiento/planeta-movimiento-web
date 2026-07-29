'use client'

// Barra de acciones sobre el documento. No se imprime (clase pm-no-print).
// «Descargar PDF» = diálogo de impresión del navegador → Guardar como PDF.

export default function PrintBar({ titulo }: { titulo: string }) {
  return (
    <div className="pm-no-print sticky top-0 z-10 bg-pm-navy text-white px-4 py-3 flex items-center justify-between gap-3">
      <a href="/admin/facturacion" className="text-sm font-bold text-white/80 hover:text-white">← Volver</a>
      <span className="text-sm font-semibold truncate">{titulo}</span>
      <button type="button" onClick={() => window.print()}
        className="bg-pm-red hover:bg-pm-red-dark text-white font-bold text-sm px-4 py-2 rounded-lg">
        Descargar PDF / Imprimir
      </button>
    </div>
  )
}
