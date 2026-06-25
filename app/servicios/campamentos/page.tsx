import { getCampamentosConfig } from '@/lib/campamentos/store'
import { getOcupacionCampamentos } from '@/lib/reservas/aforo'
import CampamentosPageClient from './CampamentosPageClient'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbsJsonLd } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Campamentos de Verano, Navidad y Semana Santa en Cuenca | Planeta Movimiento',
  description:
    'Campamentos urbanos en Cuenca con la Escuela de Superhéroes: Verano, Navidad y Semana Santa. Días sueltos o semanas completas, horario ampliado y descuento de hermanos.',
  alternates: { canonical: '/servicios/campamentos' },
}

export default async function CampamentosPage() {
  const [cfg, ocupacion] = await Promise.all([getCampamentosConfig(), getOcupacionCampamentos()])
  return (
    <>
      <JsonLd data={breadcrumbsJsonLd([{ name: 'Inicio', path: '/' }, { name: 'Ocio', path: '/ocio' }, { name: 'Campamentos', path: '/servicios/campamentos' }])} />
      <CampamentosPageClient cfg={cfg} ocupacion={ocupacion} />
    </>
  )
}
