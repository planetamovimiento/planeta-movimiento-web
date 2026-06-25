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
  // Servicios prioritarios (más peso para favorecer los sitelinks).
  const PRIORITARIOS = new Set(['campamentos', 'cumpleanos'])
  const perfiles = ['2-5-anos', '6-15-anos', 'adultos', 'ayuntamientos', 'empresas']

  return [
    p('/', 1.0, 'weekly'),
    // ── Secciones prioritarias ──
    p('/club', 0.9, 'weekly'),
    p('/actividades', 0.9, 'weekly'),
    // ── Resto de secciones ──
    p('/ocio', 0.8, 'weekly'),
    p('/educacion', 0.8, 'weekly'),
    p('/empresas', 0.8, 'weekly'),
    ...servicios.map(s => p(`/servicios/${s}`, PRIORITARIOS.has(s) ? 0.9 : 0.8, 'monthly')),
    ...perfiles.map(s => p(`/actividades/${s}`, 0.6, 'monthly')),
    p('/club/talleres-intensivos', 0.7, 'monthly'),
    p('/colchonetas', 0.7, 'monthly'),
    p('/planeta-tdah', 0.6, 'monthly'),
    p('/terminos-y-condiciones', 0.2, 'yearly'),
    p('/politica-privacidad', 0.2, 'yearly'),
    p('/politica-cookies', 0.2, 'yearly'),
  ]
}
