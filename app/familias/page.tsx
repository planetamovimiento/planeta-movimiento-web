import { requireFamilia } from '@/lib/familias/auth'
import { getAlumnosDeFamilia } from '@/lib/familias/data'
import { getTemporadaActiva } from '@/lib/config/store'
import { temporadaDisplay } from '@/lib/club/constants'
import { getAvisosActivos } from '@/lib/familias/avisos'
import { AvisosClub } from '@/components/familias/AvisosClub'
import { CabeceraFamilia } from '@/components/familias/CabeceraFamilia'
import PanelesHijos from './PanelesHijos'

export const dynamic = 'force-dynamic'

export default async function FamiliasDashboard() {
  const familia = await requireFamilia()
  const [alumnos, tempRaw, avisos] = await Promise.all([
    getAlumnosDeFamilia(familia.id), getTemporadaActiva(), getAvisosActivos(),
  ])
  const saludo = familia.nombre ? familia.nombre.split(' ')[0] : ''

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      <CabeceraFamilia saludo={saludo} numeroSocio={familia.numero_socio} temporada={temporadaDisplay(tempRaw)} nParticipantes={alumnos.length} />

      <AvisosClub avisos={avisos} />

      {alumnos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
          Todavía no hay participantes vinculados a tu cuenta. Contacta con el Club Deportivo Origen.
        </div>
      ) : (
        <PanelesHijos alumnos={alumnos} />
      )}
    </div>
  )
}
