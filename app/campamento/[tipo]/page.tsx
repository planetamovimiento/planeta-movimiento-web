import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCampamentosConfig } from '@/lib/campamentos/store'
import { getOcupacionCampamentos } from '@/lib/reservas/aforo'
import { campamentoDeSlug, SLUG_CAMPAMENTO, type CampamentoId } from '@/lib/campamentos/editable'
import CampamentosPageClient from '@/app/servicios/campamentos/CampamentosPageClient'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbsJsonLd } from '@/lib/seo'

// ─────────────────────────────────────────────────────────────────────────────
// Dirección propia de cada campamento (para QR y carteles):
//   /campamento/navidad · /campamento/semana-santa · /campamento/verano
// Es la misma página de campamentos con ese campamento ya abierto.
// ─────────────────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic'

const NOMBRE: Record<CampamentoId, string> = {
  navidad: 'Campamento de Navidad',
  semanasanta: 'Campamento de Semana Santa',
  verano: 'Campamento de Verano',
}

export async function generateMetadata({ params }: { params: Promise<{ tipo: string }> }): Promise<Metadata> {
  const id = campamentoDeSlug((await params).tipo)
  if (!id) return {}
  return {
    title: `${NOMBRE[id]} en Cuenca | Planeta Movimiento`,
    description: `${NOMBRE[id]} de la Escuela de Superhéroes en Cuenca: elige los días, horario ampliado y reserva online.`,
    alternates: { canonical: `/campamento/${SLUG_CAMPAMENTO[id]}` },
  }
}

export default async function CampamentoPage({ params }: { params: Promise<{ tipo: string }> }) {
  const id = campamentoDeSlug((await params).tipo)
  if (!id) notFound()

  const [cfg, ocupacion] = await Promise.all([getCampamentosConfig(), getOcupacionCampamentos()])
  return (
    <>
      <JsonLd data={breadcrumbsJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Campamentos', path: '/servicios/campamentos' },
        { name: NOMBRE[id], path: `/campamento/${SLUG_CAMPAMENTO[id]}` },
      ])} />
      <CampamentosPageClient cfg={cfg} ocupacion={ocupacion} inicial={id} />
    </>
  )
}
