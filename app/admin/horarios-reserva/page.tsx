import Link from 'next/link'
import { requireSeccion, can, getAdminUser } from '@/lib/admin/auth'
import { getServicios } from '@/lib/servicios/store'
import { getHorarios } from '@/lib/reservas/horarios'
import { AdminHeader } from '@/components/admin/ui'
import HorariosReservaClient from './HorariosReservaClient'

export const dynamic = 'force-dynamic'

export default async function HorariosReservaPage() {
  await requireSeccion('servicios')
  const admin = await getAdminUser()

  const servicios = (await getServicios())
    .filter(s => s.botonAccion === 'reserva')
    .map(s => ({ id: s.id, nombre: s.nombre, icon: s.icon }))

  const horarios = await getHorarios(servicios.map(s => s.id))

  return (
    <>
      <AdminHeader titulo="Horarios de reserva" subtitulo="Franjas horarias y plazas de cada servicio reservable online" />
      <div className="p-6 lg:p-8 space-y-6">
        <Link href="/admin/servicios" className="inline-block text-sm text-gray-500 hover:text-pm-red">← Servicios</Link>
        <HorariosReservaClient
          servicios={servicios}
          horarios={horarios}
          puedeEditar={admin ? can.edit(admin.role) : false}
        />
      </div>
    </>
  )
}
