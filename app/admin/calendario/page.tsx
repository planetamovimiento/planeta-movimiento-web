import { requireSeccion, can } from '@/lib/admin/auth'
import { getEventosCalendario } from '@/lib/calendario/data'
import { getAsignacionesCalendario } from '@/lib/calendario/asignaciones'
import { getMonitores } from '@/lib/monitores/data'
import { AdminHeader } from '@/components/admin/ui'
import CalendarioClient from './CalendarioClient'

export const dynamic = 'force-dynamic'

export default async function CalendarioPage() {
  const admin = await requireSeccion('calendario')
  const [{ eventos, ok }, asignaciones, monitoresTodos] = await Promise.all([
    getEventosCalendario(), getAsignacionesCalendario(), getMonitores(),
  ])
  // Solo nombre e id: no hace falta mandar más datos del monitor al navegador.
  const monitores = monitoresTodos
    .filter(m => m.estado !== 'inactivo')
    .map(m => ({ id: m.id, nombre: `${m.nombre} ${m.apellidos}`.trim() || m.email }))

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
          monitores={monitores}
          asignaciones={asignaciones}
          puedeEditar={admin ? can.edit(admin.role) : false}
          gestionOk={ok}
        />
      </div>
    </>
  )
}
