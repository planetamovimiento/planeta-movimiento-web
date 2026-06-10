import { notFound } from 'next/navigation'
import ActividadesUI, { type CatId } from '../ActividadesUI'

// Mapea el slug de la URL (/actividades/<slug>) a la pestaña de perfil.
const SLUG_TO_CAT: Record<string, CatId> = {
  '2-5-anos': '2-5',
  '6-15-anos': '6-15',
  'adultos': '+16',
  'ayuntamientos': 'ayto',
  'empresas': 'empresa',
}

const TITULOS: Record<string, string> = {
  '2-5-anos': 'Actividades de 2 a 5 años',
  '6-15-anos': 'Actividades de 6 a 15 años',
  'adultos': 'Actividades para mayores de 16 años',
  'ayuntamientos': 'Actividades para Ayuntamientos',
  'empresas': 'Actividades para Empresas',
}

export function generateStaticParams() {
  return Object.keys(SLUG_TO_CAT).map(perfil => ({ perfil }))
}

export async function generateMetadata({ params }: { params: Promise<{ perfil: string }> }) {
  const { perfil } = await params
  const t = TITULOS[perfil]
  return t ? { title: `${t} — Planeta Movimiento` } : {}
}

export default async function ActividadesPerfilPage({ params }: { params: Promise<{ perfil: string }> }) {
  const { perfil } = await params
  const cat = SLUG_TO_CAT[perfil]
  if (!cat) notFound()
  return <ActividadesUI initialCat={cat} />
}
