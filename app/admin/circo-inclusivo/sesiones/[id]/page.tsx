import { notFound } from 'next/navigation'
import { requireSeccion, can } from '@/lib/admin/auth'
import { AdminHeader } from '@/components/admin/ui'
import { getSesion, getGrupos, getParticipantes, getEvalsDeSesion } from '@/lib/circo-inclusivo/data'
import CircoNav from '../../CircoNav'
import EvaluarSesionClient from './EvaluarSesionClient'

export const dynamic = 'force-dynamic'

export default async function EvaluarSesionPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireSeccion('circo-inclusivo')
  const { id } = await params
  const sesion = await getSesion(id)
  if (!sesion) notFound()

  const [grupos, todos, evals] = await Promise.all([getGrupos(), getParticipantes(), getEvalsDeSesion(id)])
  const grupo = grupos.find(g => g.id === sesion.grupo_id) ?? null
  // Participantes del grupo de la sesión (activos); si la sesión no tiene grupo, todos los activos.
  const participantes = todos.filter(p => p.estado === 'activo' && (!sesion.grupo_id || p.grupo_id === sesion.grupo_id))

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>🤸</span> Evaluación de sesión</span>}
        subtitulo={grupo ? grupo.nombre : 'Circo Inclusivo'}
      />
      <CircoNav />
      <EvaluarSesionClient
        sesion={sesion}
        grupoNombre={grupo?.nombre ?? null}
        participantes={participantes}
        evalsIniciales={evals}
        puedeEvaluar={can.edit(admin.role)}
      />
    </>
  )
}
