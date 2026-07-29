import { requireSeccion, can } from '@/lib/admin/auth'
import { getParticipantes, getGrupos, getActividades } from '@/lib/circo-inclusivo/data'
import { AdminHeader } from '@/components/admin/ui'
import CircoNav from './CircoNav'
import ParticipantesClient from './ParticipantesClient'

export const dynamic = 'force-dynamic'

export default async function CircoInclusivoPage() {
  const admin = await requireSeccion('circo-inclusivo')
  const [participantes, grupos, actividades] = await Promise.all([
    getParticipantes(), getGrupos(), getActividades(),
  ])
  // Gestor y principal pueden crear/editar participantes; solo el principal borra.
  const puedeGestionar = can.edit(admin.role)
  const puedeEliminar = admin.role === 'principal'

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>🤸</span> Circo Inclusivo</span>}
        subtitulo="Seguimiento de participantes de circo adaptado, psicomotricidad y grupos especiales"
      />
      <CircoNav />
      <ParticipantesClient
        participantes={participantes}
        grupos={grupos}
        actividades={actividades}
        puedeGestionar={puedeGestionar}
        puedeEliminar={puedeEliminar}
      />
    </>
  )
}
