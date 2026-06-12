import { getServicios } from '@/lib/servicios/store'
import { getHorarios } from '@/lib/reservas/horarios'
import { getReservadosPorServicio } from '@/lib/reservas/disponibilidad'
import { getEventoCentro, getMananaMagica } from '@/lib/eventos/store'
import { getCampamentosConfig } from '@/lib/campamentos/store'
import { getOcupacionFecha, getOcupacionCampamentos } from '@/lib/reservas/aforo'
import type { ServicioReserva } from '@/lib/reservas/monto'
import ReservaWizard from './ReservaWizard'

export const dynamic = 'force-dynamic'

export default async function ReservarPage() {
  // Servicios reservables reales (catálogo + ediciones del panel).
  const lista = (await getServicios()).filter(s => s.botonAccion === 'reserva' && s.estado === 'activo')
  const servicios: ServicioReserva[] = lista.map(s => ({
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

  // Horarios (franjas + plazas) y ocupación actual de cada servicio.
  const ids = servicios.map(s => s.id)
  const [horarios, reservados, diasSinCole, domingos, mananaMagica, campamentos, ocupacionDSC, ocupacionDomingos, ocupacionMM, ocupacionCampamentos] = await Promise.all([
    getHorarios(ids),
    getReservadosPorServicio(lista.map(s => ({ id: s.id, nombre: s.nombre }))),
    getEventoCentro('dias-sin-cole'),
    getEventoCentro('domingos'),
    getMananaMagica(),
    getCampamentosConfig(),
    getOcupacionFecha('dias-sin-cole'),
    getOcupacionFecha('domingos'),
    getOcupacionFecha('manana-magica'),
    getOcupacionCampamentos(),
  ])

  return (
    <ReservaWizard
      servicios={servicios}
      horarios={horarios}
      reservados={reservados}
      diasSinCole={diasSinCole}
      domingos={domingos}
      mananaMagica={mananaMagica}
      campamentos={campamentos}
      ocupacionDSC={ocupacionDSC}
      ocupacionDomingos={ocupacionDomingos}
      ocupacionMM={ocupacionMM}
      ocupacionCampamentos={ocupacionCampamentos}
    />
  )
}
