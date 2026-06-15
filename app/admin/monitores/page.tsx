import { requireSeccion, can } from '@/lib/admin/auth'
import { AdminHeader } from '@/components/admin/ui'
import {
  getMonitores, getMonitorPorEmail, getActividades, getFichajes, getFichajeAbierto,
  getCarpetas, getTodosDocumentos,
} from '@/lib/monitores/data'
import MonitorPortal from './MonitorPortal'
import MonitoresAdmin from './MonitoresAdmin'

export const dynamic = 'force-dynamic'

export default async function MonitoresPage({ searchParams }: { searchParams: Promise<{ ver?: string }> }) {
  const admin = await requireSeccion('monitores')
  const { ver } = await searchParams
  const [carpetas, documentos] = await Promise.all([getCarpetas(), getTodosDocumentos()])

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
    const [actividades, fichajes, abierto, equipo] = await Promise.all([
      getActividades({ monitorId: mon.id }), getFichajes(mon.id), getFichajeAbierto(mon.id), getMonitores(),
    ])
    return <MonitorPortal monitor={mon} equipo={equipo} actividades={actividades} fichajes={fichajes} abierto={abierto} carpetas={carpetas} documentos={documentos} />
  }

  const [monitores, actividades, fichajes] = await Promise.all([getMonitores(), getActividades(), getFichajes()])

  // ── Vista previa: un admin ve el portal tal y como lo ve un monitor concreto ──
  if (ver) {
    const mon = monitores.find(m => m.id === ver)
    if (mon) {
      const acts = actividades.filter(a => a.monitor_id === mon.id)
      const fich = fichajes.filter(f => f.monitor_id === mon.id)
      const abierto = fich.find(f => !f.salida) ?? null
      return <MonitorPortal monitor={mon} equipo={monitores} actividades={acts} fichajes={fich} abierto={abierto} carpetas={carpetas} documentos={documentos} preview />
    }
  }

  // ── Vista de administración del equipo ──
  return (
    <MonitoresAdmin
      monitores={monitores} actividades={actividades} fichajes={fichajes}
      carpetas={carpetas} documentos={documentos}
      puedeBorrar={can.manageUsers(admin.role)} puedeEditar={can.edit(admin.role)}
    />
  )
}
