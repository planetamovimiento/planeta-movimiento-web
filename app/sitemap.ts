import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const p = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  ): MetadataRoute.Sitemap[number] => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency, priority })

  const servicios = [
    'gimnasia-acrobatica', 'telas-aereas', 'escuela-infantil', 'escuela-bienestar',
    'jiu-jitsu', 'circo-inclusivo', 'cumpleanos', 'campamentos', 'eventos',
    'talleres', 'excursiones', 'extraescolares', 'monitor-juvenil', 'piea', 'licitaciones',
  ]

  return [
    p('/', 1.0, 'weekly'),
    p('/club', 0.9, 'weekly'),
    p('/ocio', 0.9, 'weekly'),
    p('/educacion', 0.9, 'weekly'),
    p('/empresas', 0.9, 'weekly'),
    p('/actividades', 0.7, 'weekly'),
    ...servicios.map(s => p(`/servicios/${s}`, 0.8, 'monthly')),
    p('/club/talleres-intensivos', 0.7, 'monthly'),
    p('/colchonetas', 0.7, 'monthly'),
    p('/planeta-tdah', 0.6, 'monthly'),
    p('/reservar', 0.6, 'monthly'),
    p('/terminos-y-condiciones', 0.2, 'yearly'),
    p('/politica-privacidad', 0.2, 'yearly'),
    p('/politica-cookies', 0.2, 'yearly'),
  ]
}
