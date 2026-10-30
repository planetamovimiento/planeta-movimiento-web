import Link from 'next/link'
import { TEXTO } from '@/lib/autorizaciones/documento'
import AutorizacionPublica from './AutorizacionPublica'

export const metadata = {
  title: 'Autorización de imágenes de menores — Planeta Movimiento',
  description: 'Autoriza en línea el uso de fotos y vídeos de los menores en las actividades de Planeta Movimiento.',
  robots: { index: false, follow: false },
}

// Enlace para mandar a las familias de cualquier actividad (ocio, eventos…).
// ?actividad=Campamento%20de%20Navidad rellena la actividad.
export default async function AutorizacionPage({ searchParams }: { searchParams: Promise<{ actividad?: string }> }) {
  const { actividad = '' } = await searchParams
  return (
    <main className="bg-pm-bg min-h-screen">
      <section className="bg-pm-navy text-white py-12 border-t-4 border-pm-red">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <nav className="text-sm text-gray-400 mb-4 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>›</span>
            <span className="text-white">Autorización de imágenes</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black mb-2">{TEXTO.titulo}</h1>
          <p className="text-white/70 text-sm">
            Léela, marca lo que autorizas y fírmala aquí mismo. Sin imprimir nada: te llegará el justificante por correo.
            {actividad && <><br />Actividad: <b className="text-white">{actividad.slice(0, 120)}</b></>}
          </p>
        </div>
      </section>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-8">
          <AutorizacionPublica actividad={actividad.slice(0, 120)} />
        </div>
        <p className="text-xs text-gray-400 mt-4">
          ¿Eres socio del Club Origen? También puedes firmarla desde el <Link href="/familias" className="underline">Portal de Familias</Link>.
        </p>
      </div>
    </main>
  )
}
