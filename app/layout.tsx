import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FooterGate from '@/components/layout/FooterGate'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, NEGOCIO_JSONLD, SITE_NAV_JSONLD } from '@/lib/seo'

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
  icons: { icon: '/favicon.ico', apple: '/logo.png' },
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
    <html lang="es">
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
      </body>
    </html>
  )
}
