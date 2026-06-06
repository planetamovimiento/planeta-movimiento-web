import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FooterGate from '@/components/layout/FooterGate'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Planeta Movimiento — Centro de circo y acrobacia en Cuenca',
  description: 'Actividades de circo, acrobacia y movimiento para todas las edades en Cuenca. Cumpleaños, campamentos, club y más.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Navbar />
        {children}
        <FooterGate><Footer /></FooterGate>
      </body>
    </html>
  )
}
