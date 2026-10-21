import { getServicios } from '@/lib/servicios/store'
import { getHorarios, getHorarioServicio } from '@/lib/reservas/horarios'
import { getCumpleanosOcupados } from '@/lib/cumpleanos/disponibilidad'
import { diasCancelados } from '@/lib/calendario-club/data'
import { getReservadosPorServicio } from '@/lib/reservas/disponibilidad'
import { getEventoCentro, getMananaMagica } from '@/lib/eventos/store'
import { getCampamentosConfig } from '@/lib/campamentos/store'
import { getOcupacionFecha, getOcupacionCampamentos } from '@/lib/reservas/aforo'
import type { ServicioReserva } from '@/lib/reservas/monto'
import ReservaWizard from './ReservaWizard'

export const dynamic = 'force-dynamic'

export default async function ReservarPage() {
  // Servicios reservables reales (catálogo + ediciones del panel).
  const todos = await getServicios()
  const lista = todos.filter(s => s.botonAccion === 'reserva' && s.estado === 'activo')
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

  // "Animación en tu evento": el servicio 'eventos' (botonAccion 'presupuesto') cobra online
  // con su calculadora, así que lo añadimos como opción del asistente.
  const eventosSvc = todos.find(s => s.id === 'eventos' && s.estado === 'activo')
  if (eventosSvc) {
    servicios.push({
      id: 'eventos',
      nombre: 'Animación en tu evento',
      icon: eventosSvc.icon,
      descripcionCorta: 'Bodas, comuniones y fiestas a domicilio. Packs desde 150 € + IVA. Calcula y reserva.',
      precio: null,
      precioDesde: null,
      fianza: eventosSvc.fianza,
      edad: 'Desde 3-4 años',
      horarios: '',
    })
  }

  // Horarios (franjas + plazas) y ocupación actual de cada servicio.
  const ids = servicios.map(s => s.id)
  const [
    horarios, reservados, diasSinCole, domingos, mananaMagica, campamentos,
    ocupacionDSC, ocupacionDomingos, ocupacionMM, ocupacionCampamentos,
    halloween, tallerInfantil, practicaLibre, cumpleOcupados, cumpleFranjas,
  ] = await Promise.all([
    getHorarios(ids),
    getReservadosPorServicio(lista.map(s => ({ id: s.id, nombre: s.nombre }))),
    getEventoCentro('dias-sin-cole'),
    getEventoCentro('domingos').then(async d => ({ ...d, diasCancelados: await diasCancelados(/domingos? en familia/i) })),
    getMananaMagica(),
    getCampamentosConfig(),
    getOcupacionFecha('dias-sin-cole'),
    getOcupacionFecha('domingos'),
    getOcupacionFecha('manana-magica'),
    getOcupacionCampamentos(),
    getEventoCentro('halloween'),
    getEventoCentro('talleres-infantiles'),
    getEventoCentro('practica-libre'),
    getCumpleanosOcupados(),
    getHorarioServicio('cumpleanos'),
  ])

  // Fondo de cada tarjeta: la misma foto o cartel que enseña la página del
  // servicio, y el precio real que se configura en el panel de cada evento.
  const eur = (n: number) => `${String(Math.round(n * 100) / 100).replace('.', ',')} €`
  const aspecto: Record<string, { imagen?: string; precioTexto?: string }> = {
    cumpleanos: { imagen: '/fotos/cumpleanos/1.webp' },
    campamentos: { imagen: '/fotos/campamentos/1.webp' },
    eventos: { imagen: '/fotos/eventos/1.webp' },
    'manana-magica': { imagen: mananaMagica.imagen, precioTexto: `${eur(mananaMagica.precio)} / niño` },
    'dias-sin-cole': {
      imagen: diasSinCole.imagen || '/fotos/eventos-centro/dias-sin-cole.webp',
      precioTexto: `${eur(diasSinCole.precio)}${diasSinCole.ivaIncluido ? '' : ' + IVA'} / niño`,
    },
    domingos: { imagen: domingos.imagen || '/fotos/eventos-centro/domingos.webp', precioTexto: `${eur(domingos.precio)} / niño` },
    halloween: {
      imagen: halloween.imagen || '/fotos/eventos-centro/halloween.webp',
      precioTexto: halloween.precio > 0 ? `${eur(halloween.precio)} / niño` : undefined,
    },
    'talleres-infantiles': { imagen: tallerInfantil.imagen, precioTexto: `${eur(tallerInfantil.precio)} / niño` },
    'practica-libre': {
      imagen: practicaLibre.imagen,
      precioTexto: `Clase ${eur(practicaLibre.precio)} · Bono ${eur(practicaLibre.precioBono)}`,
    },
  }
  const conAspecto = servicios.map(s => ({ ...s, ...(aspecto[s.id] ?? {}) }))

  return (
    <ReservaWizard
      servicios={conAspecto}
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
      halloween={halloween}
      tallerInfantil={tallerInfantil}
      practicaLibre={practicaLibre}
      cumpleOcupados={cumpleOcupados}
      cumpleFranjas={cumpleFranjas}
    />
  )
}
