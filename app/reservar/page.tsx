import { getServicios } from '@/lib/servicios/store'
import type { ServicioReserva } from '@/lib/reservas/monto'
import ReservaWizard from './ReservaWizard'

export const dynamic = 'force-dynamic'

export default async function ReservarPage() {
  // Servicios reservables reales (catálogo + ediciones del panel).
  const servicios: ServicioReserva[] = (await getServicios())
    .filter(s => s.botonAccion === 'reserva' && s.estado === 'activo')
    .map(s => ({
      id: s.id,
      nombre: s.nombre,
      icon: s.icon,
      descripcionCorta: s.descripcionCorta,
      precio: s.precio,
      precioDesde: s.precioDesde,
      fianza: s.fianza,
      edad: s.edad,
      horarios: s.horarios,
    }))

  return <ReservaWizard servicios={servicios} />
}
