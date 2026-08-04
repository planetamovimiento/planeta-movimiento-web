import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const runtime = 'edge'
export const alt = 'Gimnasia acrobática y trampolín | Planeta Movimiento'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return ogImage({ titulo: 'Gimnasia acrobática', subtitulo: 'Trampolín y acrobacia' })
}
