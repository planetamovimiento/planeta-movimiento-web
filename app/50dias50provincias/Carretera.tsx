// ─────────────────────────────────────────────────────────────────────────────
// Carretera que serpentea entre las tarjetas del calendario (boustrophedon).
//
// Se dibuja UN solo path por (columnas, filas), no 50 conexiones sueltas:
// recorre cada fila y gira en U en los extremos alternos. El SVG se estira al
// grid con preserveAspectRatio="none" y el grosor se mantiene con
// vector-effect="non-scaling-stroke", así que el asfalto no se deforma aunque
// las celdas no sean cuadradas.
//
// Para que parezca una carretera de verdad y no una línea, el mismo trazado se
// pinta en capas: sombra → arcén claro → asfalto → línea central discontinua.
// El tramo ya recorrido se tiñe de verde y el actual se ilumina en rojo.
// ─────────────────────────────────────────────────────────────────────────────

/** Punto medio de una celda en coordenadas de viewBox (1 celda = 1×1). */
function centro(indice: number, cols: number) {
  const fila = Math.floor(indice / cols)
  const colEnFila = indice % cols
  // Filas impares se leen al revés (serpiente): la columna visual se invierte.
  const x = (fila % 2 === 0 ? colEnFila : cols - 1 - colEnFila) + 0.5
  return { x, y: fila + 0.5 }
}

/**
 * Une el centro de la celda `desde` con el de `hasta` (consecutivas).
 * En la misma fila, tramo recto; al cambiar de fila, una curva en U amplia que
 * se sale hacia el extremo para que se vea bien por dónde sigue la ruta.
 */
function tramo(desde: number, hasta: number, cols: number): string {
  const a = centro(desde, cols)
  const b = centro(hasta, cols)
  if (a.y === b.y) return `L ${b.x} ${b.y}`
  if (cols === 1) return `L ${b.x} ${b.y}` // móvil: ruta vertical
  // Curva en U: los puntos de control salen hacia fuera del extremo.
  const haciaDerecha = a.x > cols / 2
  const bulto = haciaDerecha ? 0.62 : -0.62
  return `C ${a.x + bulto} ${a.y} ${b.x + bulto} ${b.y} ${b.x} ${b.y}`
}

/** Trazado desde la etapa 0 hasta `hasta` (excluido). */
function trazado(hasta: number, cols: number): string {
  let d = ''
  for (let i = 0; i < hasta; i++) {
    const p = centro(i, cols)
    d += i === 0 ? `M ${p.x} ${p.y} ` : tramo(i - 1, i, cols) + ' '
  }
  return d
}

export default function Carretera({
  total,
  cols,
  hechas,
  actual,
}: {
  total: number
  cols: number
  hechas: number
  /** Índice (0..total-1) de la etapa en curso, o -1 si no hay. */
  actual?: number
}) {
  if (total < 2 || cols < 1) return null

  const filas = Math.ceil(total / cols)
  const d = trazado(total, cols)
  const nHechas = Math.min(hechas, total)
  const dHechas = nHechas >= 2 ? trazado(nHechas, cols) : ''

  // Tramo de la etapa actual: el trocito que llega hasta ella, para iluminarlo.
  const iAct = actual ?? -1
  const dActual =
    iAct > 0 && iAct < total
      ? `M ${centro(iAct - 1, cols).x} ${centro(iAct - 1, cols).y} ${tramo(iAct - 1, iAct, cols)}`
      : ''

  // Anchos del firme (en px reales gracias a non-scaling-stroke).
  const ANCHO_ASFALTO = 26
  const ANCHO_ARCEN = ANCHO_ASFALTO + 6

  return (
    <svg
      viewBox={`0 0 ${cols} ${filas}`}
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      {/* Sombra bajo el firme: da profundidad sobre el paisaje */}
      <path
        d={d}
        fill="none"
        stroke="#000"
        strokeWidth={ANCHO_ARCEN + 8}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.35}
      />
      {/* Arcenes: los bordes claros que definen la carretera */}
      <path
        d={d}
        fill="none"
        stroke="#e8eaf0"
        strokeWidth={ANCHO_ARCEN}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.9}
      />
      {/* Asfalto */}
      <path
        d={d}
        fill="none"
        stroke="#33383f"
        strokeWidth={ANCHO_ASFALTO}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* Tramo ya recorrido, en verde sobre el asfalto */}
      {dHechas && (
        <path
          d={dHechas}
          fill="none"
          stroke="#10b981"
          strokeWidth={ANCHO_ASFALTO}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          opacity={0.45}
        />
      )}
      {/* Tramo de la etapa actual, iluminado en rojo */}
      {dActual && (
        <path
          d={dActual}
          fill="none"
          stroke="#D42B2B"
          strokeWidth={ANCHO_ASFALTO}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          opacity={0.75}
        />
      )}
      {/* Línea central discontinua */}
      <path
        d={d}
        fill="none"
        stroke="#f5d372"
        strokeWidth={2.5}
        strokeDasharray="10 12"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.85}
      />
    </svg>
  )
}
