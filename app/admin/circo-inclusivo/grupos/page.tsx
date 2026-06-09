import { requireSeccion } from '@/lib/admin/auth'
import { getGrupos, getParticipantes } from '@/lib/circo-inclusivo/data'
import { AdminHeader } from '@/components/admin/ui'
import CircoNav from '../CircoNav'
import GruposClient from './GruposClient'

export const dynamic = 'force-dynamic'

export default async function GruposPage() {
  const admin = await requireSeccion('circo-inclusivo')
  const [grupos, participantes] = await Promise.all([getGrupos(), getParticipantes()])
  const conteo: Record<string, number> = {}
  participantes.forEach(p => { if (p.grupo_id) conteo[p.grupo_id] = (conteo[p.grupo_id] || 0) + 1 })

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>🤸</span> Circo Inclusivo · Grupos</span>}
        subtitulo="Grupos de trabajo, horarios y entidades colaboradoras"
      />
      <CircoNav />
      <GruposClient grupos={grupos} conteo={conteo} puedeGestionar={admin.role === 'principal'} />
    </>
  )
}
