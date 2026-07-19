// ─────────────────────────────────────────────────────────────────────────────
// Cielo estrellado del mapa de la ruta.
//
// Va dentro del mismo <svg> que el esquema, como primera capa, así escala con
// el viewBox y no hace falta posicionar nada por encima.
//
// Las posiciones se sacan de un generador con semilla FIJA: el mismo cielo en
// el servidor y en el navegador (si no, React avisaría de hidratación distinta)
// y el mismo cada vez que se entra, que es lo que se espera de una constelación.
//
// El parpadeo y las fugaces son CSS (.pm-estrella y .pm-fugaz en globals.css),
// que se apagan solas con prefers-reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

/** PRNG determinista (mulberry32). Misma semilla ⇒ mismo cielo siempre. */
function generador(semilla: number) {
  let s = semilla
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const ANCHO = 700
const ALTO = 600

type Estrella = { x: number; y: number; r: number; o: number; dur: number; delay: number; titila: boolean }

/** El cielo se calcula una sola vez, al cargar el módulo. */
const ESTRELLAS: Estrella[] = (() => {
  const rnd = generador(20260719) // la fecha de salida del reto, como semilla
  const out: Estrella[] = []
  for (let i = 0; i < 110; i++) {
    // Las estrellas grandes son pocas: si no, el fondo compite con la ruta.
    const grande = rnd() > 0.88
    out.push({
      x: +(rnd() * ANCHO).toFixed(1),
      y: +(rnd() * ALTO).toFixed(1),
      r: +((grande ? 1.3 + rnd() * 0.9 : 0.5 + rnd() * 0.7)).toFixed(2),
      o: +((grande ? 0.4 + rnd() * 0.35 : 0.15 + rnd() * 0.3)).toFixed(2),
      dur: +(2.5 + rnd() * 4.5).toFixed(1),
      delay: +(rnd() * 6).toFixed(1),
      // Solo parpadea una de cada tres: un cielo entero titilando marea, y son
      // 110 animaciones a la vez que el navegador no tiene por qué llevar.
      titila: rnd() > 0.66,
    })
  }
  return out
})()

/**
 * Estrellas fugaces. Cruzan en diagonal, cada una en su momento: los retardos
 * están repartidos para que no coincidan nunca dos a la vez.
 */
const FUGACES = [
  { x: 480, y: 60, dx: -150, dy: 105, dur: 11, delay: 2 },
  { x: 180, y: 40, dx: -120, dy: 84, dur: 14, delay: 7.5 },
  { x: 650, y: 250, dx: -170, dy: 119, dur: 17, delay: 12 },
]

export default function CieloMapa() {
  return (
    // Decorativo: los lectores de pantalla ya tienen la descripción del mapa.
    <g aria-hidden="true">
      <defs>
        <linearGradient id="pm-estela" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {ESTRELLAS.map((e, i) => (
        <circle
          key={i}
          className={e.titila ? 'pm-estrella' : undefined}
          cx={e.x}
          cy={e.y}
          r={e.r}
          fill="#fff"
          opacity={e.titila ? undefined : e.o}
          style={e.titila ? ({ '--o': e.o, '--dur': `${e.dur}s`, '--delay': `${e.delay}s` } as React.CSSProperties) : undefined}
        />
      ))}

      {FUGACES.map((f, i) => (
        <g
          key={i}
          className="pm-fugaz"
          style={{ '--dx': `${f.dx}px`, '--dy': `${f.dy}px`, '--dur': `${f.dur}s`, '--delay': `${f.delay}s` } as React.CSSProperties}
        >
          {/* La estela apunta hacia atrás del recorrido: se ve como una cola */}
          <line x1={f.x + 26} y1={f.y - 18} x2={f.x} y2={f.y} stroke="url(#pm-estela)" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx={f.x} cy={f.y} r="1.4" fill="#fff" />
        </g>
      ))}
    </g>
  )
}
