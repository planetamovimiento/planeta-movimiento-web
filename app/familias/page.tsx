import { requireFamilia } from '@/lib/familias/auth'
import { getAlumnosDeFamilia } from '@/lib/familias/data'
import { getTemporadaActiva } from '@/lib/config/store'
import { temporadaDisplay } from '@/lib/club/constants'
import PanelesHijos from './PanelesHijos'

export const dynamic = 'force-dynamic'

export default async function FamiliasDashboard() {
  const familia = await requireFamilia()
  const [alumnos, tempRaw] = await Promise.all([getAlumnosDeFamilia(familia.id), getTemporadaActiva()])
  const saludo = familia.nombre ? familia.nombre.split(' ')[0] : ''

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      {/* Cabecera de bienvenida */}
      <div className="rounded-3xl bg-gradient-to-br from-pm-navy to-pm-navy-md text-white p-6 sm:p-7 mb-6">
        <div className="text-xs font-black uppercase tracking-widest text-white/50 mb-1">Portal de Familias</div>
        <h1 className="text-2xl sm:text-3xl font-black leading-tight">Hola{saludo ? `, ${saludo}` : ''}</h1>
        <div className="flex flex-wrap gap-2 mt-4">
          {familia.numero_socio && (
            <span className="bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-bold">Socio {familia.numero_socio}</span>
          )}
          <span className="bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-bold">Temporada {temporadaDisplay(tempRaw)}</span>
          <span className="bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-bold">
            {alumnos.length} {alumnos.length === 1 ? 'participante' : 'participantes'}
          </span>
        </div>
      </div>

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
