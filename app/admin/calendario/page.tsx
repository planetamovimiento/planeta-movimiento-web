import { requireSeccion, can } from '@/lib/admin/auth'
import { getEventosCalendario } from '@/lib/calendario/data'
import { AdminHeader } from '@/components/admin/ui'
import CalendarioClient from './CalendarioClient'

export const dynamic = 'force-dynamic'

export default async function CalendarioPage() {
  const admin = await requireSeccion('calendario')
  const { eventos, ok } = await getEventosCalendario()

  const servicios = Array.from(new Set(eventos.map(e => e.servicio).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'))

  return (
    <>
      <AdminHeader
        titulo="Calendario y disponibilidad"
        subtitulo="Reservas, campamentos, eventos del centro y actividades de todo el año"
      />
      <div className="p-4 lg:p-6">
        <CalendarioClient
          eventos={eventos}
          servicios={servicios}
          puedeEditar={admin ? can.edit(admin.role) : false}
          gestionOk={ok}
        />
      </div>
    </>
  )
}
