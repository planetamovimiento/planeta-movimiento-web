// ─────────────────────────────────────────────────────────────────────────────
// Configuración SEO central. La URL del sitio apunta ya al DOMINIO REAL, para que
// canonical, sitemap, Open Graph y datos estructurados sean correctos desde el
// primer día tras la migración (la versión .vercel.app va con noindex de todas formas).
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_URL = 'https://planetamovimiento.com'
export const SITE_NAME = 'Planeta Movimiento'
export const SITE_DESCRIPTION =
  'Centro de educación, deporte y ocio en Cuenca. Club deportivo, cumpleaños, campamentos, eventos, talleres, excursiones y formación para todas las edades.'

/** Datos del negocio para el Schema.org (ficha local en Google). */
export const NEGOCIO_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'SportsActivityLocation',
  '@id': `${SITE_URL}/#negocio`,
  name: SITE_NAME,
  alternateName: 'Club Deportivo Origen · Planeta Movimiento',
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/og.png`,
  telephone: '+34657604665',
  email: 'info@planetamovimiento.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Polígono Los Palancares, 8',
    postalCode: '16004',
    addressLocality: 'Cuenca',
    addressRegion: 'Cuenca',
    addressCountry: 'ES',
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '10:00', closes: '13:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '16:00', closes: '21:00' },
  ],
  sameAs: [
    'https://www.instagram.com/planeta_movimiento',
    'https://www.tiktok.com/@escuela_superheroes',
    'https://www.youtube.com/channel/UCb2-jHfrTbpEBeh9fE95L8A',
    'https://es-es.facebook.com/planetamovimiento/',
  ],
  areaServed: { '@type': 'City', name: 'Cuenca' },
  priceRange: '€€',
}

/**
 * Navegación principal del sitio (Schema). Refuerza ante Google cuáles son las
 * secciones más importantes — señal que ayuda a los enlaces de sitio (sitelinks).
 * Orden = prioridad: Campamentos, Cumpleaños, Club Origen, Más Actividades.
 */
export const SITE_NAV_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Servicios principales de Planeta Movimiento',
  itemListElement: [
    { '@type': 'SiteNavigationElement', position: 1, name: 'Campamentos', description: 'Campamentos de Verano, Navidad y Semana Santa', url: `${SITE_URL}/servicios/campamentos` },
    { '@type': 'SiteNavigationElement', position: 2, name: 'Cumpleaños', description: 'Cumpleaños infantiles y celebraciones temáticas', url: `${SITE_URL}/servicios/cumpleanos` },
    { '@type': 'SiteNavigationElement', position: 3, name: 'Club Deportivo Origen', description: 'Acrobacia, circo, telas aéreas y artes marciales', url: `${SITE_URL}/club` },
    { '@type': 'SiteNavigationElement', position: 4, name: 'Más Actividades', description: 'Catálogo completo de actividades y servicios', url: `${SITE_URL}/actividades` },
    { '@type': 'SiteNavigationElement', position: 5, name: 'Ocio', url: `${SITE_URL}/ocio` },
    { '@type': 'SiteNavigationElement', position: 6, name: 'Educación', url: `${SITE_URL}/educacion` },
  ],
}

/** Construye el Schema de migas de pan (BreadcrumbList) para una página. */
export function breadcrumbsJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  }
}
