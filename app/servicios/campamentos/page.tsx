import { getCampamentosConfig } from '@/lib/campamentos/store'
import { getOcupacionCampamentos } from '@/lib/reservas/aforo'
import CampamentosPageClient from './CampamentosPageClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Campamentos — Escuela de Superhéroes | Planeta Movimiento',
  description:
    'Campamentos de Navidad, Semana Santa y verano en Cuenca. Días sueltos o semanas completas, horario ampliado y descuento de hermanos.',
}

export default async function CampamentosPage() {
  const [cfg, ocupacion] = await Promise.all([getCampamentosConfig(), getOcupacionCampamentos()])
  return <CampamentosPageClient cfg={cfg} ocupacion={ocupacion} />
}
