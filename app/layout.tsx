import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FooterGate from '@/components/layout/FooterGate'
import { Analytics } from '@vercel/analytics/next'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, NEGOCIO_JSONLD, SITE_NAV_JSONLD } from '@/lib/seo'
import DecoracionTemporada from '@/components/layout/Temporada'
import { scriptTemporada } from '@/lib/temporada'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Planeta Movimiento — Educación, deporte y ocio en Cuenca',
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ['educación Cuenca', 'deporte Cuenca', 'ocio Cuenca', 'campamentos Cuenca', 'cumpleaños Cuenca', 'extraescolares Cuenca', 'actividades para niños Cuenca', 'club deportivo Cuenca', 'Planeta Movimiento'],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: SITE_NAME,
    url: SITE_URL,
    title: 'Planeta Movimiento — Educación, deporte y ocio en Cuenca',
    description: SITE_DESCRIPTION,
    // La imagen la genera app/opengraph-image.tsx (texto siempre actualizado).
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planeta Movimiento — Educación, deporte y ocio en Cuenca',
    description: SITE_DESCRIPTION,
  },
  // El icono de la pestaña lo toma Next de app/icon.png y app/apple-icon.png (el logo).
}

export const viewport: Viewport = {
  themeColor: '#0F1A3D',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // suppressHydrationWarning: el script de temporada marca <html> antes de que cargue React.
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Temporada (Halloween / Navidad) según la fecha: colores desde el primer fotograma */}
        <script dangerouslySetInnerHTML={{ __html: scriptTemporada() }} />
      </head>
      <body className={inter.className}>
        {/* Datos estructurados del negocio (ficha local para Google) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(NEGOCIO_JSONLD) }}
        />
        {/* Navegación principal (refuerza las secciones clave para los sitelinks) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_NAV_JSONLD) }}
        />
        <Navbar />
        {children}
        <FooterGate><Footer /></FooterGate>
        {/* Murciélagos en Halloween, nieve y luces en Navidad (solo web pública) */}
        <DecoracionTemporada />
        {/* Analítica web cookieless (sin banner de cookies) */}
        <Analytics />
      </body>
    </html>
  )
}
