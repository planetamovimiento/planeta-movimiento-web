import { requireSeccion, can } from '@/lib/admin/auth'
import { AdminHeader } from '@/components/admin/ui'
import {
  getMonitores, getMonitorPorEmail, getActividades, getFichajes, getFichajeAbierto,
  getCarpetas, getTodosDocumentos, getMovimientos, sinDatosSensibles,
} from '@/lib/monitores/data'
import { actividadesAutomaticas, getReglasMonitores, CATEGORIAS_EMPRESA } from '@/lib/monitores/reglas'
import { ACTIVIDADES_CLUB } from '@/lib/club/constants'
import MonitorPortal from './MonitorPortal'
import MonitoresAdmin from './MonitoresAdmin'

export const dynamic = 'force-dynamic'

/**
 * Ventana del calendario automático: desde el 1 de enero del año pasado (para
 * que cuadren las horas acumuladas) hasta el final del año que viene.
 */
function ventana(): { desde: string; hasta: string } {
  const y = new Date().getFullYear()
  return { desde: `${y - 1}-01-01`, hasta: `${y + 1}-12-31` }
}

const porFecha = <T extends { fecha: string; hora_inicio: string }>(a: T, b: T) =>
  (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio)

export default async function MonitoresPage() {
  const admin = await requireSeccion('monitores')
  const [carpetas, documentos] = await Promise.all([getCarpetas(), getTodosDocumentos()])
  const { desde, hasta } = ventana()

  // ── Vista del propio monitor ──
  if (admin.role === 'monitor') {
    const mon = await getMonitorPorEmail(admin.email)
    if (!mon) {
      return (
        <>
          <AdminHeader titulo="Monitores" subtitulo="Portal del monitor" />
          <div className="p-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 max-w-lg text-sm text-amber-800">
              <div className="font-black mb-1">Cuenta sin ficha de monitor</div>
              Tu cuenta <strong>{admin.email}</strong> tiene acceso pero aún no está vinculada a una
              ficha de monitor. Pide a un administrador que la cree con este mismo correo.
            </div>
          </div>
        </>
      )
    }
    // Lo asignado a mano + lo que le toca por sus reglas.
    const [manuales, automaticas, fichajes, abierto, equipo] = await Promise.all([
      getActividades({ monitorId: mon.id }), actividadesAutomaticas(desde, hasta, mon.id),
      getFichajes(mon.id), getFichajeAbierto(mon.id), getMonitores(),
    ])
    const actividades = [...manuales, ...automaticas].sort(porFecha)
    return <MonitorPortal monitor={mon} equipo={equipo.map(sinDatosSensibles)} actividades={actividades} fichajes={fichajes} abierto={abierto} carpetas={carpetas} documentos={documentos} />
  }

  const [monitoresRaw, movimientos, manuales, automaticas, fichajes, reglas] = await Promise.all([
    getMonitores(), getMovimientos(), getActividades(), actividadesAutomaticas(desde, hasta), getFichajes(), getReglasMonitores(),
  ])
  // Los datos laborales (nacimiento, Seguridad Social, DNI) solo salen del servidor
  // para quien puede editar fichas; en modo lectura ni se envían al navegador.
  const monitores = can.edit(admin.role) ? monitoresRaw : monitoresRaw.map(sinDatosSensibles)
  const actividades = [...manuales, ...automaticas].sort(porFecha)

  // ── Vista de administración del equipo ──
  return (
    <MonitoresAdmin
      monitores={monitores} movimientos={movimientos} actividades={actividades} fichajes={fichajes}
      carpetas={carpetas} documentos={documentos}
      reglas={reglas} categoriasEmpresa={CATEGORIAS_EMPRESA} actividadesClub={ACTIVIDADES_CLUB}
      puedeBorrar={can.manageUsers(admin.role)} puedeEditar={can.edit(admin.role)}
    />
  )
}
