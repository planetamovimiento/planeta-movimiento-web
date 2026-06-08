// ─────────────────────────────────────────────────────────────────────────────
// Índice de fotos por servicio. GENERADO por scripts/optimizar-fotos.mjs.
// No editar a mano: vuelve a ejecutar `node scripts/optimizar-fotos.mjs`.
// ─────────────────────────────────────────────────────────────────────────────

export const FOTOS: Record<string, string[]> = {
  'campamento-navidad': ['/fotos/campamento-navidad/1.webp', '/fotos/campamento-navidad/2.webp', '/fotos/campamento-navidad/3.webp', '/fotos/campamento-navidad/4.webp'],
  'campamento-semana-santa': ['/fotos/campamento-semana-santa/1.webp', '/fotos/campamento-semana-santa/2.webp', '/fotos/campamento-semana-santa/3.webp'],
  'campamento-verano': ['/fotos/campamento-verano/1.webp', '/fotos/campamento-verano/2.webp', '/fotos/campamento-verano/3.webp'],
  'campamentos': ['/fotos/campamentos/1.webp', '/fotos/campamentos/2.webp', '/fotos/campamentos/3.webp', '/fotos/campamentos/4.webp', '/fotos/campamentos/5.webp', '/fotos/campamentos/6.webp', '/fotos/campamentos/7.webp', '/fotos/campamentos/8.webp', '/fotos/campamentos/9.webp', '/fotos/campamentos/10.webp'],
  'circo-inclusivo': ['/fotos/circo-inclusivo/1.webp', '/fotos/circo-inclusivo/2.webp', '/fotos/circo-inclusivo/3.webp', '/fotos/circo-inclusivo/4.webp'],
  'cumpleanos': ['/fotos/cumpleanos/1.webp', '/fotos/cumpleanos/2.webp', '/fotos/cumpleanos/3.webp', '/fotos/cumpleanos/4.webp', '/fotos/cumpleanos/5.webp', '/fotos/cumpleanos/6.webp', '/fotos/cumpleanos/7.webp'],
  'escuela-bienestar': ['/fotos/escuela-bienestar/1.webp', '/fotos/escuela-bienestar/2.webp', '/fotos/escuela-bienestar/3.webp'],
  'escuela-infantil': ['/fotos/escuela-infantil/1.webp', '/fotos/escuela-infantil/2.webp', '/fotos/escuela-infantil/3.webp', '/fotos/escuela-infantil/4.webp', '/fotos/escuela-infantil/5.webp', '/fotos/escuela-infantil/6.webp', '/fotos/escuela-infantil/7.webp', '/fotos/escuela-infantil/8.webp', '/fotos/escuela-infantil/9.webp'],
  'eventos': ['/fotos/eventos/1.webp', '/fotos/eventos/2.webp', '/fotos/eventos/3.webp', '/fotos/eventos/4.webp'],
  'excursiones': ['/fotos/excursiones/1.webp', '/fotos/excursiones/2.webp', '/fotos/excursiones/3.webp'],
  'extraescolares': ['/fotos/extraescolares/1.webp', '/fotos/extraescolares/2.webp'],
  'gimnasia-acrobatica': ['/fotos/gimnasia-acrobatica/1.webp', '/fotos/gimnasia-acrobatica/2.webp', '/fotos/gimnasia-acrobatica/3.webp', '/fotos/gimnasia-acrobatica/4.webp'],
  'monitor-juvenil': ['/fotos/monitor-juvenil/1.webp', '/fotos/monitor-juvenil/2.webp', '/fotos/monitor-juvenil/3.webp', '/fotos/monitor-juvenil/4.webp', '/fotos/monitor-juvenil/5.webp', '/fotos/monitor-juvenil/6.webp'],
  'talleres': ['/fotos/talleres/1.webp', '/fotos/talleres/2.webp', '/fotos/talleres/3.webp', '/fotos/talleres/4.webp', '/fotos/talleres/5.webp', '/fotos/talleres/6.webp', '/fotos/talleres/7.webp', '/fotos/talleres/8.webp', '/fotos/talleres/9.webp', '/fotos/talleres/10.webp', '/fotos/talleres/11.webp', '/fotos/talleres/12.webp', '/fotos/talleres/13.webp'],
  'telas-aereas': ['/fotos/telas-aereas/1.webp', '/fotos/telas-aereas/2.webp', '/fotos/telas-aereas/3.webp'],
}

/** Primera foto (principal) de un servicio, o '' si no hay. */
export function fotoPrincipal(slug: string): string {
  return FOTOS[slug]?.[0] ?? ''
}

/** Todas las fotos de un servicio. */
export function fotosDe(slug: string): string[] {
  return FOTOS[slug] ?? []
}
