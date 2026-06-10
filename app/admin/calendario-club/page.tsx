import { requireSeccion, can } from '@/lib/admin/auth'
import { getEventos, getExcepciones, getTipos, getClubGrupos } from '@/lib/calendario-club/data'
import { ACTIVIDADES_CLUB, GRUPOS_BASE, TEMPORADAS } from '@/lib/club/constants'
import { AdminHeader } from '@/components/admin/ui'
import CalendarioClubClient from './CalendarioClubClient'

export const dynamic = 'force-dynamic'

const uniq = (arr: (string | null)[]) => Array.from(new Set(arr.filter(Boolean) as string[]))

export default async function CalendarioClubPage() {
  const admin = await requireSeccion('calendario-club')
  const [eventos, excepciones, tipos, clubGrupos] = await Promise.all([
    getEventos(), getExcepciones(), getTipos(), getClubGrupos(),
  ])

  const grupos = uniq([...GRUPOS_BASE, ...clubGrupos, ...eventos.map(e => e.grupo)])
  const actividades = uniq([...ACTIVIDADES_CLUB, ...eventos.map(e => e.actividad)])
  const monitores = uniq(eventos.map(e => e.monitor))
  const ubicaciones = uniq(eventos.map(e => e.ubicacion))

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>🗓️</span> Calendario Club</span>}
        subtitulo="Planificación de clases, festivos, eventos y campamentos del Club Deportivo Origen"
      />
      <CalendarioClubClient
        eventos={eventos}
        excepciones={excepciones}
        tipos={tipos}
        actividades={actividades}
        grupos={grupos}
        monitores={monitores}
        ubicaciones={ubicaciones}
        temporadas={[...TEMPORADAS]}
        puedeEditar={can.edit(admin.role)}
        esPrincipal={admin.role === 'principal'}
      />
    </>
  )
}
