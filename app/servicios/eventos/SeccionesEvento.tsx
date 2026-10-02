import { parteDePrograma, type SeccionEvento } from '@/lib/eventos/centro'

/** Colores del evento (cada uno tiene su paleta). */
export type TemaEvento = {
  /** Clases de la tarjeta de cada bloque. */
  tarjeta: string
  /** Clases del título del bloque. */
  titulo: string
  /** Color del ✓ / la hora. */
  acento: string
  /** Clases de las etiquetas redondas. */
  chip: string
  /** Color del texto de los puntos. */
  texto: string
}

export const TEMA_CLARO = (acento: string, chip: string): TemaEvento => ({
  tarjeta: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-sm',
  titulo: 'font-black text-pm-navy text-sm mb-3',
  acento, chip, texto: 'text-gray-700',
})

export const TEMA_OSCURO: TemaEvento = {
  tarjeta: 'bg-gray-900 border border-orange-500/30 rounded-2xl p-6',
  titulo: 'font-black text-orange-400 text-sm uppercase tracking-wider mb-4',
  acento: 'text-orange-500',
  chip: 'bg-orange-500/20 border border-orange-500/30 text-orange-300',
  texto: 'text-gray-400',
}

/** Bloques de contenido del evento, tal y como se editan en el panel. */
export function SeccionesEvento({ secciones, tema, columnas = true }: {
  secciones: SeccionEvento[]
  tema: TemaEvento
  /** true = dos columnas en pantallas anchas. */
  columnas?: boolean
}) {
  const visibles = secciones.filter(s => s.items.length > 0 || s.titulo)
  if (visibles.length === 0) return null

  return (
    <div className={columnas && visibles.length > 1 ? 'grid grid-cols-1 sm:grid-cols-2 gap-5' : 'space-y-5'}>
      {visibles.map((s, i) => (
        <div key={i} className={tema.tarjeta}>
          {s.titulo && <h3 className={tema.titulo}>{s.titulo}</h3>}

          {s.tipo === 'chips' && (
            <div className="flex flex-wrap gap-2">
              {s.items.map(t => (
                <span key={t} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tema.chip}`}>{t}</span>
              ))}
            </div>
          )}

          {s.tipo === 'lista' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {s.items.map(t => (
                <div key={t} className={`flex items-start gap-1.5 text-sm ${tema.texto}`}>
                  <span className={`${tema.acento} font-bold`}>✓</span>{t}
                </div>
              ))}
            </div>
          )}

          {s.tipo === 'programa' && (
            <div className="space-y-3">
              {s.items.map(linea => {
                const { hora, texto } = parteDePrograma(linea)
                return (
                  <div key={linea} className={`flex items-start gap-4 text-sm ${tema.texto}`}>
                    {hora && <span className={`${tema.acento} font-black text-xs w-28 shrink-0`}>{hora}</span>}
                    <span>{texto}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
