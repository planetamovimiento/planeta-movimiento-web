import { getCampamentosConfig } from '@/lib/campamentos/store'
import CampamentosPageClient from './CampamentosPageClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Campamentos — Escuela de Superhéroes | Planeta Movimiento',
  description:
    'Campamentos de Navidad, Semana Santa y verano en Cuenca. Días sueltos o semanas completas, horario ampliado y descuento de hermanos.',
}

export default async function CampamentosPage() {
  const cfg = await getCampamentosConfig()
  return <CampamentosPageClient cfg={cfg} />
}
