import { getMananaMagica, getEventoCentro } from '@/lib/eventos/store'
import EventosPageClient from './EventosPageClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Eventos y celebraciones — Planeta Movimiento',
  description:
    'Animación profesional para tus eventos y experiencias especiales en nuestro centro: Días Sin Cole, Domingos en Familia, Mañanas Mágicas y Noche de Halloween.',
}

export default async function EventosPage() {
  const [mananaMagica, diasSinCole, domingos, halloween] = await Promise.all([
    getMananaMagica(),
    getEventoCentro('dias-sin-cole'),
    getEventoCentro('domingos'),
    getEventoCentro('halloween'),
  ])
  return <EventosPageClient mananaMagica={mananaMagica} diasSinCole={diasSinCole} domingos={domingos} halloween={halloween} />
}
