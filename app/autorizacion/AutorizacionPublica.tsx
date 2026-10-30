'use client'

import FormAutorizacion from '@/components/autorizaciones/FormAutorizacion'
import { firmarAutorizacionPublica } from './actions'

export default function AutorizacionPublica({ actividad }: { actividad: string }) {
  return <FormAutorizacion actividadInicial={actividad} onFirmar={firmarAutorizacionPublica} />
}
