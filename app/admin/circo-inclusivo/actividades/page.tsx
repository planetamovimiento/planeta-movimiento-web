import { requireSeccion } from '@/lib/admin/auth'
import { getActividades, getParticipantes } from '@/lib/circo-inclusivo/data'
import { AdminHeader } from '@/components/admin/ui'
import CircoNav from '../CircoNav'
import ActividadesClient from './ActividadesClient'

export const dynamic = 'force-dynamic'

export default async function ActividadesPage() {
  const admin = await requireSeccion('circo-inclusivo')
  const [actividades, participantes] = await Promise.all([getActividades(), getParticipantes()])
  const conteo: Record<string, number> = {}
  participantes.forEach(p => { if (p.actividad) conteo[p.actividad] = (conteo[p.actividad] || 0) + 1 })

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>🤸</span> Circo Inclusivo · Actividades</span>}
        subtitulo="Tipos de actividad disponibles para asignar a los participantes"
      />
      <CircoNav />
      <ActividadesClient actividades={actividades} conteo={conteo} puedeGestionar={admin.role === 'principal'} />
    </>
  )
}
