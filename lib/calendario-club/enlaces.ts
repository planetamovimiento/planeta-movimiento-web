// ─────────────────────────────────────────────────────────────────────────────
// Enlace de apuntarse de un evento del calendario. Si el evento no trae uno
// puesto a mano en el panel, se deduce del título: los eventos en el centro
// (Días Sin Cole, Domingos en Familia, Mañanas Mágicas y Noche de Halloween)
// siempre llevan a su pestaña de la web para reservar.
// ─────────────────────────────────────────────────────────────────────────────

const norm = (s: string) =>
  (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const REGLAS: { test: (t: string) => boolean; url: string }[] = [
  { test: t => t.includes('sin cole'), url: '/servicios/eventos#dias-sin-cole' },
  { test: t => t.includes('domingo'), url: '/servicios/eventos#domingos-en-familia' },
  { test: t => t.includes('manana magica') || t.includes('mananas magicas'), url: '/servicios/eventos#mananas-magicas' },
  { test: t => t.includes('halloween') && t.includes('infantil'), url: '/servicios/eventos#taller-infantil' },
  { test: t => t.includes('taller infantil') || t.includes('talleres infantiles'), url: '/servicios/eventos#taller-infantil' },
  { test: t => t.includes('halloween'), url: '/servicios/eventos#halloween' },
  { test: t => t.includes('practica libre'), url: '/servicios/eventos#practica-libre' },
  { test: t => t.includes('campamento'), url: '/servicios/campamentos' },
  { test: t => t.includes('cumplea'), url: '/servicios/cumpleanos' },
  { test: t => t.includes('intensivo'), url: '/club/talleres-intensivos' },
]

/** URL de apuntarse: la del evento si la tiene; si no, la que toque por su título. */
export function enlaceDeEvento(evento: { url?: string | null; titulo?: string | null; actividad?: string | null }): string {
  const manual = (evento.url || '').trim()
  if (manual) return manual
  const texto = norm(`${evento.titulo ?? ''} ${evento.actividad ?? ''}`)
  return REGLAS.find(r => r.test(texto))?.url ?? ''
}
