// ─────────────────────────────────────────────────────────────────────────────
// Carretera que serpentea entre las tarjetas del calendario (boustrophedon).
//
// Se dibuja UN solo path por (columnas, filas), no 50 conexiones sueltas: recorre
// cada fila y gira en U en los extremos alternos. El SVG se estira al grid con
// preserveAspectRatio="none"; el grosor del asfalto se mantiene con
// vector-effect="non-scaling-stroke", así que las líneas no se deforman aunque
// las celdas no sean cuadradas. Va detrás de las tarjetas (opacas): la carretera
// asoma por los huecos entre ellas y crea el efecto de ruta.
//
// El "progreso" (cuántas etapas ya están hechas) tiñe el tramo recorrido.
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
 * Path que une el centro de la celda `desde` con el de `hasta` (consecutivas).
 * En la misma fila es un tramo recto; al bajar de fila, una curva en U suave.
 */
function tramo(desde: number, hasta: number, cols: number): string {
  const a = centro(desde, cols)
  const b = centro(hasta, cols)
  if (a.y === b.y) return `L ${b.x} ${b.y}` // misma fila: recto horizontal
  if (cols === 1) return `L ${b.x} ${b.y}` // móvil: ruta vertical recta
  // Cambio de fila: curva en U suave por el extremo (a.x y b.x coinciden).
  const cx = a.x
  const bulto = cx > cols / 2 ? 0.5 : -0.5
  return `C ${cx + bulto} ${a.y} ${cx + bulto} ${b.y} ${b.x} ${b.y}`
}

export default function Carretera({ total, cols, hechas }: { total: number; cols: number; hechas: number }) {
  if (total < 2 || cols < 1) return null

  const filas = Math.ceil(total / cols)

  // Path completo de la ruta.
  let d = ''
  for (let i = 0; i < total; i++) {
    const p = centro(i, cols)
    d += i === 0 ? `M ${p.x} ${p.y} ` : tramo(i - 1, i, cols) + ' '
  }

  // Tramo ya recorrido: hasta el centro de la última etapa hecha.
  let dHechas = ''
  const nHechas = Math.min(hechas, total)
  for (let i = 0; i < nHechas; i++) {
    const p = centro(i, cols)
    dHechas += i === 0 ? `M ${p.x} ${p.y} ` : tramo(i - 1, i, cols) + ' '
  }

  return (
    <svg
      viewBox={`0 0 ${cols} ${filas}`}
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      {/* Asfalto */}
      <path
        d={d}
        fill="none"
        stroke="#1f2937"
        strokeWidth={22}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.85}
      />
      {/* Línea discontinua central */}
      <path
        d={d}
        fill="none"
        stroke="#fbbf24"
        strokeWidth={2}
        strokeDasharray="7 9"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.7}
      />
      {/* Tramo recorrido, resaltado en verde sobre el asfalto */}
      {nHechas >= 1 && (
        <path
          d={dHechas}
          fill="none"
          stroke="#10b981"
          strokeWidth={22}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          opacity={0.55}
        />
      )}
    </svg>
  )
}
