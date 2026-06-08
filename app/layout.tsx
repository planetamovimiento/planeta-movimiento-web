import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FooterGate from '@/components/layout/FooterGate'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, NEGOCIO_JSONLD } from '@/lib/seo'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Planeta Movimiento — Circo, deporte y ocio en Cuenca',
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ['circo Cuenca', 'acrobacia Cuenca', 'telas aéreas', 'campamentos Cuenca', 'cumpleaños Cuenca', 'extraescolares', 'club deportivo', 'gimnasia acrobática', 'Planeta Movimiento'],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: SITE_NAME,
    url: SITE_URL,
    title: 'Planeta Movimiento — Circo, deporte y ocio en Cuenca',
    description: SITE_DESCRIPTION,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planeta Movimiento — Circo, deporte y ocio en Cuenca',
    description: SITE_DESCRIPTION,
    images: ['/og.png'],
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
        <Navbar />
        {children}
        <FooterGate><Footer /></FooterGate>
      </body>
    </html>
  )
}
