import { redirect } from 'next/navigation'

// /campamento sin más: a la página general de campamentos.
export default function CampamentoSinTipo() {
  redirect('/servicios/campamentos')
}
