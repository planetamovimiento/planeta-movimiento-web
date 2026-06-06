// ─────────────────────────────────────────────────────────────────────────────
// Índice de fotos por servicio (generadas por scripts/optimizar-fotos.mjs)
// Para añadir más: deja las originales en /Imagenes_web/<carpeta> y vuelve a
// ejecutar el script. Luego añade aquí el slug con sus rutas.
// ─────────────────────────────────────────────────────────────────────────────

export const FOTOS: Record<string, string[]> = {
  'gimnasia-acrobatica': ['/fotos/gimnasia-acrobatica/1.webp', '/fotos/gimnasia-acrobatica/2.webp', '/fotos/gimnasia-acrobatica/3.webp', '/fotos/gimnasia-acrobatica/4.webp'],
  'telas-aereas': ['/fotos/telas-aereas/1.webp', '/fotos/telas-aereas/2.webp', '/fotos/telas-aereas/3.webp'],
  'talleres': ['/fotos/talleres/1.webp', '/fotos/talleres/2.webp', '/fotos/talleres/3.webp', '/fotos/talleres/4.webp', '/fotos/talleres/5.webp', '/fotos/talleres/6.webp', '/fotos/talleres/7.webp', '/fotos/talleres/8.webp', '/fotos/talleres/9.webp', '/fotos/talleres/10.webp'],
}

/** Primera foto (principal) de un servicio, o '' si no hay. */
export function fotoPrincipal(slug: string): string {
  return FOTOS[slug]?.[0] ?? ''
}

/** Todas las fotos de un servicio. */
export function fotosDe(slug: string): string[] {
  return FOTOS[slug] ?? []
}
