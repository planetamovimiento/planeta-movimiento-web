// ─────────────────────────────────────────────────────────────────────────────
// Configuración SEO central. La URL del sitio apunta ya al DOMINIO REAL, para que
// canonical, sitemap, Open Graph y datos estructurados sean correctos desde el
// primer día tras la migración (la versión .vercel.app va con noindex de todas formas).
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_URL = 'https://planetamovimiento.com'
export const SITE_NAME = 'Planeta Movimiento'
export const SITE_DESCRIPTION =
  'Centro de circo, acrobacia y movimiento en Cuenca. Club deportivo, cumpleaños, campamentos, eventos, talleres, excursiones y formación para todas las edades.'

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
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '13:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '16:00', closes: '21:00' },
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
