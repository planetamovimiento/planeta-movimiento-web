import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTallerBySlug } from '@/lib/talleres/store'
import { estadoTallerMeta } from '../config'
import { TarjetaTaller } from '../TalleresClient'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const t = await getTallerBySlug(slug)
  if (!t) return { title: 'Taller intensivo · Club Deportivo Origen' }
  return {
    title: `${t.nombre} — Talleres Intensivos | Club Deportivo Origen`,
    description: (t.subtitulo || t.descripcion || '').slice(0, 160),
  }
}

export default async function DetalleTallerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = await getTallerBySlug(slug)
  // No público: archivado, borrador → 404.
  if (!t || t.archivado || estadoTallerMeta(t.estado).seccion === 'oculto') notFound()

  return (
    <main className="bg-pm-bg min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
            <Link href="/" className="hover:text-pm-red">Inicio</Link><span>›</span>
            <Link href="/club" className="hover:text-pm-red">Club Deportivo Origen</Link><span>›</span>
            <Link href="/club/talleres-intensivos" className="hover:text-pm-red">Talleres Intensivos</Link><span>›</span>
            <span className="text-pm-navy font-semibold">{t.nombre}</span>
          </nav>
        </div>
      </div>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        <div>
          <div className="text-xs font-black text-pm-red uppercase tracking-widest mb-1">{t.disciplina || 'Taller intensivo'}</div>
          <h1 className="text-3xl font-black text-pm-navy leading-tight">{t.nombre}</h1>
          {t.subtitulo && <p className="text-gray-500 mt-1">{t.subtitulo}</p>}
        </div>

        {t.descripcion && <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{t.descripcion}</p>}

        <TarjetaTaller taller={t} />

        <div>
          <Link href="/club/talleres-intensivos" className="text-sm font-bold text-pm-navy hover:text-pm-red">← Ver todos los talleres intensivos</Link>
        </div>
      </section>
    </main>
  )
}
