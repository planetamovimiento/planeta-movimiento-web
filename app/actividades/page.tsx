import ActividadesUI from './ActividadesUI'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbsJsonLd } from '@/lib/seo'

export const metadata = {
  title: 'Más Actividades — Catálogo completo de servicios en Cuenca | Planeta Movimiento',
  description:
    'Todas las actividades de Planeta Movimiento en Cuenca: campamentos, cumpleaños, clases de circo y acrobacia, excursiones, extraescolares, eventos y formación. Encuentra la tuya por perfil.',
  alternates: { canonical: '/actividades' },
}

export default function ActividadesPage() {
  return (
    <>
      <JsonLd data={breadcrumbsJsonLd([{ name: 'Inicio', path: '/' }, { name: 'Más Actividades', path: '/actividades' }])} />
      <ActividadesUI />
    </>
  )
}
