import { requireSeccion, can } from '@/lib/admin/auth'
import { AdminHeader } from '@/components/admin/ui'
import { getAjustesNavidad, getPases, getReservasNavidad, resumirNavidad } from '@/lib/navidad/store'
import NavidadClient from './NavidadClient'

export const dynamic = 'force-dynamic'

export default async function NavidadAdminPage() {
  const admin = await requireSeccion('navidad')
  const [cfg, pases, reservas] = await Promise.all([getAjustesNavidad(), getPases(), getReservasNavidad()])
  const resumen = resumirNavidad(pases, reservas)

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>🎅</span> Fábrica de Papá Noel</span>}
        subtitulo="Entradas, pases y aforo del evento de Navidad"
      />
      <div className="p-4 lg:p-6">
        <NavidadClient
          cfg={cfg}
          pases={pases}
          reservas={reservas}
          resumen={resumen}
          puedeEditar={can.edit(admin.role)}
          migracionPendiente={pases.length === 0}
        />
      </div>
    </>
  )
}
