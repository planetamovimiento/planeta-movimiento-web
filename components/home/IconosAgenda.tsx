// ─────────────────────────────────────────────────────────────────────────────
// Iconos dibujados a mano (SVG) para la agenda de la portada. No son emojis:
// cada actividad tiene su dibujo y su color, para que el calendario se lea de
// un vistazo (zombie = Halloween, familia = domingos, nave = días sin cole…).
// Archivo puro: se usa en servidor y en cliente.
// ─────────────────────────────────────────────────────────────────────────────

export type IconoId =
  | 'familia' | 'fiesta' | 'zombie' | 'instalacion' | 'calabaza'
  | 'campamento' | 'taller' | 'gala' | 'cumple' | 'practica' | 'estrella' | 'regalo'

export type ColorAgenda = 'azul' | 'rojo' | 'gris' | 'naranja' | 'morado' | 'verde' | 'amarillo' | 'negro' | 'teal' | 'rosa'

/** Clases estáticas (Tailwind v4 las necesita escritas) para la celda del día. */
export type TonoAgenda = { celda: string; texto: string; icono: string; punto: string; suave: string }

export const TONO: Record<ColorAgenda, TonoAgenda> = {
  azul:     { celda: 'bg-sky-100 border-sky-300 hover:bg-sky-200',            texto: 'text-sky-900',     icono: 'text-sky-600',     punto: 'bg-sky-500',     suave: 'bg-sky-50 text-sky-700' },
  rojo:     { celda: 'bg-red-100 border-red-300 hover:bg-red-200',            texto: 'text-red-900',     icono: 'text-red-600',     punto: 'bg-red-500',     suave: 'bg-red-50 text-red-700' },
  gris:     { celda: 'bg-slate-100 border-slate-300 hover:bg-slate-200',      texto: 'text-slate-800',   icono: 'text-slate-500',   punto: 'bg-slate-400',   suave: 'bg-slate-50 text-slate-700' },
  naranja:  { celda: 'bg-orange-100 border-orange-300 hover:bg-orange-200',   texto: 'text-orange-900',  icono: 'text-orange-600',  punto: 'bg-orange-500',  suave: 'bg-orange-50 text-orange-700' },
  morado:   { celda: 'bg-purple-100 border-purple-300 hover:bg-purple-200',   texto: 'text-purple-900',  icono: 'text-purple-600',  punto: 'bg-purple-500',  suave: 'bg-purple-50 text-purple-700' },
  verde:    { celda: 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200', texto: 'text-emerald-900', icono: 'text-emerald-600', punto: 'bg-emerald-500', suave: 'bg-emerald-50 text-emerald-700' },
  amarillo: { celda: 'bg-amber-100 border-amber-300 hover:bg-amber-200',      texto: 'text-amber-900',   icono: 'text-amber-600',   punto: 'bg-amber-500',   suave: 'bg-amber-50 text-amber-800' },
  negro:    { celda: 'bg-slate-200 border-slate-400 hover:bg-slate-300',      texto: 'text-slate-900',   icono: 'text-slate-700',   punto: 'bg-slate-700',   suave: 'bg-slate-100 text-slate-800' },
  teal:     { celda: 'bg-teal-100 border-teal-300 hover:bg-teal-200',         texto: 'text-teal-900',    icono: 'text-teal-600',    punto: 'bg-teal-500',    suave: 'bg-teal-50 text-teal-700' },
  rosa:     { celda: 'bg-pink-100 border-pink-300 hover:bg-pink-200',         texto: 'text-pink-900',    icono: 'text-pink-600',    punto: 'bg-pink-500',    suave: 'bg-pink-50 text-pink-700' },
}

export const tono = (c: string): TonoAgenda => TONO[(c as ColorAgenda)] ?? TONO.azul

const norm = (s: string) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/**
 * Actividades conocidas: imponen su dibujo y su color para que siempre se vean
 * igual en la web (Halloween rosa, domingos amarillo…), aunque en el panel el
 * tipo de evento sea genérico. Lo que no encaje usa el color de su tipo.
 */
const REGLAS: { test: (t: string) => boolean; icono: IconoId; color: ColorAgenda }[] = [
  { test: t => t.includes('papa noel'), icono: 'regalo', color: 'rojo' },
  { test: t => t.includes('halloween') && t.includes('infantil'), icono: 'calabaza', color: 'morado' },
  { test: t => t.includes('taller infantil') || t.includes('talleres infantiles'), icono: 'calabaza', color: 'morado' },
  { test: t => t.includes('halloween'), icono: 'zombie', color: 'rosa' },
  { test: t => t.includes('sin cole'), icono: 'instalacion', color: 'naranja' },
  { test: t => t.includes('domingo'), icono: 'familia', color: 'amarillo' },
  { test: t => t.includes('manana magica') || t.includes('mananas magicas'), icono: 'gala', color: 'teal' },
  { test: t => t.includes('practica libre'), icono: 'practica', color: 'azul' },
  { test: t => t.includes('campamento'), icono: 'campamento', color: 'verde' },
  { test: t => t.includes('cumplea'), icono: 'cumple', color: 'rojo' },
  { test: t => t.includes('gala') || t.includes('festival') || t.includes('exhibic'), icono: 'gala', color: 'morado' },
  { test: t => t.includes('taller') || t.includes('intensivo'), icono: 'taller', color: 'amarillo' },
  { test: t => t.includes('festiv') || t.includes('fiesta') || t.includes('puente'), icono: 'fiesta', color: 'rojo' },
]

/** Dibujo por tipo del calendario, para lo que no case con ninguna actividad. */
const POR_TIPO: Record<string, IconoId> = {
  festivo: 'fiesta', sin_clase: 'fiesta', sin_cole: 'instalacion', campamento: 'campamento',
  taller: 'taller', gala: 'gala', evento: 'estrella', puntual: 'estrella', empresa: 'estrella', clase: 'practica',
}

/** Dibujo + color de un evento de la agenda. */
export function aspectoEvento(e: { titulo?: string | null; tipo?: string | null; color?: string | null }): { icono: IconoId; color: string } {
  const t = norm(`${e.titulo ?? ''} ${e.tipo ?? ''}`)
  const r = REGLAS.find(x => x.test(t))
  if (r) return { icono: r.icono, color: r.color }
  return { icono: POR_TIPO[e.tipo ?? ''] ?? 'estrella', color: e.color || 'azul' }
}

// ─── Los dibujos ──────────────────────────────────────────────────────────────

const TRAZO = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const DIBUJOS: Record<IconoId, React.ReactNode> = {
  // Adulto y niño: Domingos en Familia.
  familia: (
    <>
      <circle cx="8.5" cy="5.8" r="2.6" {...TRAZO} />
      <path d="M4.2 20v-4.6a4.3 4.3 0 0 1 8.6 0V20" {...TRAZO} />
      <circle cx="17" cy="10.5" r="2" {...TRAZO} />
      <path d="M13.9 20v-3.3a3.1 3.1 0 0 1 6.2 0V20" {...TRAZO} />
    </>
  ),
  // Banderín con destello: días de fiesta y puentes.
  fiesta: (
    <>
      <path d="M4 20.5 10.5 9l4.5 4.5z" {...TRAZO} />
      <path d="M12.4 11.2 18 5.6" {...TRAZO} />
      <circle cx="19.6" cy="4" r="1.6" fill="currentColor" />
      <path d="M15 3.4v2M20.6 9.4h-2M17.4 8.2l1.2 1.2" {...TRAZO} />
    </>
  ),
  // Cabeza zombie con puntos de sutura: Noche de Halloween.
  zombie: (
    <>
      <path d="M12 2.8c4.3 0 7.2 2.9 7.2 7v5.6c0 3.3-3.2 5.8-7.2 5.8s-7.2-2.5-7.2-5.8V9.8c0-4.1 2.9-7 7.2-7z" {...TRAZO} />
      <circle cx="9" cy="11" r="1.5" fill="currentColor" />
      <circle cx="15.2" cy="11.4" r="1" fill="currentColor" />
      <path d="M8.2 16.6h7.6M10 15.4v2.4M12.6 15.4v2.4" {...TRAZO} />
      <path d="M13.4 5.6l2.2 2.2M14.3 4.9l-.8.8M15.9 6.5l-.8.8" {...TRAZO} />
    </>
  ),
  // Nuestra nave con el arco de entrada: Días Sin Cole en la instalación.
  instalacion: (
    <>
      <path d="M2.6 11.2 12 4.4l9.4 6.8" {...TRAZO} />
      <path d="M4.9 10.6V20h14.2v-9.4" {...TRAZO} />
      <path d="M9.6 20v-4.2a2.4 2.4 0 0 1 4.8 0V20" {...TRAZO} />
      <path d="M2.6 20h18.8" {...TRAZO} />
    </>
  ),
  // Calabaza: talleres infantiles de temporada.
  calabaza: (
    <>
      <path d="M12 6.4c-.6-1.6-.2-2.8 1.6-3.4" {...TRAZO} />
      <path d="M12 6.4c-4 0-6.9 3.1-6.9 7.4S8 21 12 21s6.9-2.9 6.9-7.2S16 6.4 12 6.4z" {...TRAZO} />
      <path d="M8.6 12h2.6l-1.3 2.3zM12.8 12h2.6l-1.3 2.3z" fill="currentColor" />
      <path d="M8.9 16.6c1.8 1.2 4.4 1.2 6.2 0" {...TRAZO} />
    </>
  ),
  campamento: (
    <>
      <path d="M12 3.6 3.2 20.4h17.6z" {...TRAZO} />
      <path d="M12 10.4V20.4" {...TRAZO} />
      <path d="M8.6 20.4 12 14l3.4 6.4" {...TRAZO} />
    </>
  ),
  taller: (
    <>
      <path d="M14.4 3.8l5.8 5.8-9.7 9.7H4.7v-5.8z" {...TRAZO} />
      <path d="M11.9 6.3l5.8 5.8" {...TRAZO} />
      <path d="M3 21h18" {...TRAZO} />
    </>
  ),
  gala: (
    <path d="M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" {...TRAZO} />
  ),
  cumple: (
    <>
      <path d="M4.4 20.4v-5.6a2.2 2.2 0 0 1 2.2-2.2h10.8a2.2 2.2 0 0 1 2.2 2.2v5.6z" {...TRAZO} />
      <path d="M3.2 20.4h17.6M12 12.6V8.8" {...TRAZO} />
      <path d="M12 7.4c.9-.7 1.1-1.6.6-2.6-.9.6-1.4 1.5-.6 2.6z" fill="currentColor" />
    </>
  ),
  practica: (
    <path d="M3.2 10v4M6.4 7.2v9.6M17.6 7.2v9.6M20.8 10v4M6.4 12h11.2" {...TRAZO} />
  ),
  // Regalo con lazo: La Fábrica de Papá Noel.
  regalo: (
    <>
      <path d="M4 10.5h16v9.3a1.2 1.2 0 0 1-1.2 1.2H5.2A1.2 1.2 0 0 1 4 19.8z" {...TRAZO} />
      <path d="M2.8 7.3h18.4v3.2H2.8z" {...TRAZO} />
      <path d="M12 7.3V21" {...TRAZO} />
      <path d="M12 7.3c-1.3-2.8-4.6-4-5.6-2.2-.9 1.7 1.8 2.2 5.6 2.2zM12 7.3c1.3-2.8 4.6-4 5.6-2.2.9 1.7-1.8 2.2-5.6 2.2z" {...TRAZO} />
    </>
  ),
  estrella: (
    <path d="M12 3.4l2.3 5.5 5.9.5-4.5 3.9 1.4 5.8L12 16l-5.1 3.1 1.4-5.8-4.5-3.9 5.9-.5z" {...TRAZO} />
  ),
}

/**
 * Pegatinas propias de Planeta Movimiento (redondas, fondo transparente).
 * Donde hay pegatina se usa ella; el resto de actividades sigue con su dibujo.
 */
export const PEGATINAS: Partial<Record<IconoId, string>> = {
  regalo: '/fotos/pegatinas/fabrica-papa-noel.webp',
  zombie: '/fotos/pegatinas/halloween.webp',
  fiesta: '/fotos/pegatinas/dia-festivo.webp',
  instalacion: '/fotos/pegatinas/dia-sin-cole.webp',
  familia: '/fotos/pegatinas/domingos-en-familia.webp',
}

export const tienePegatina = (nombre: IconoId) => Boolean(PEGATINAS[nombre])

export function IconoAgenda({ nombre, className = 'w-5 h-5' }: { nombre: IconoId; className?: string }) {
  const pegatina = PEGATINAS[nombre]
  if (pegatina) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={pegatina} alt="" aria-hidden="true" loading="lazy" className={`${className} object-contain drop-shadow-md`} />
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {DIBUJOS[nombre] ?? DIBUJOS.estrella}
    </svg>
  )
}
