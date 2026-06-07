import { redirect } from 'next/navigation'

// Talleres Intensivos ahora se gestiona desde Servicios.
export default function TalleresIntensivosRedirect() {
  redirect('/admin/servicios/talleres-intensivos')
}
