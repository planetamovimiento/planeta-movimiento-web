import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

// Imagen que se muestra al compartir la portada. Las páginas de servicio tienen
// la suya propia (su opengraph-image.tsx) para que cada URL se vea relacionada.

export const runtime = 'edge'
export const alt = 'Planeta Movimiento — Educación, deporte y ocio en Cuenca'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return ogImage({ titulo: 'Planeta Movimiento', subtitulo: 'Educación · Deporte · Ocio', kicker: 'CUENCA' })
}
