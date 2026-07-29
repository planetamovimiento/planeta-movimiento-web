import { requireSeccion, can } from '@/lib/admin/auth'
import { AdminHeader } from '@/components/admin/ui'
import { getSesiones, getGrupos, getEvaluacionesConteo, haySesiones } from '@/lib/circo-inclusivo/data'
import CircoNav from '../CircoNav'
import SesionesClient from './SesionesClient'

export const dynamic = 'force-dynamic'

export default async function SesionesPage() {
  const admin = await requireSeccion('circo-inclusivo')
  const migrado = await haySesiones()
  const [sesiones, grupos, conteo] = migrado
    ? await Promise.all([getSesiones(), getGrupos(), getEvaluacionesConteo()])
    : [[], await getGrupos(), {}]

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>🤸</span> Circo Inclusivo · Sesiones</span>}
        subtitulo="Jornadas del programa: crea la sesión y evalúa a los participantes"
      />
      <CircoNav />
      <SesionesClient
        sesiones={sesiones}
        grupos={grupos}
        conteo={conteo}
        migrado={migrado}
        puedeGestionar={can.edit(admin.role)}
        puedeEliminar={admin.role === 'principal'}
      />
    </>
  )
}
