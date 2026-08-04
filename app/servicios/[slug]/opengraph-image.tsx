import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'
import { SERVICIOS_DATA } from './page'

export const alt = 'Servicio de Planeta Movimiento'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const servicio = SERVICIOS_DATA[slug]
  return servicio
    ? ogImage({ titulo: servicio.nombre, subtitulo: 'Cuenca' })
    : ogImage({ titulo: 'Planeta Movimiento', subtitulo: 'Educación · Deporte · Ocio', kicker: 'CUENCA' })
}
