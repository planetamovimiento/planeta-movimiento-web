import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const runtime = 'edge'
export const alt = 'Escuela Infantil | Planeta Movimiento'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return ogImage({ titulo: 'Escuela Infantil', subtitulo: 'Grupos de 3 a 5 años' })
}
