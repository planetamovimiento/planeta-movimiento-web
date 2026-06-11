import { requireFamilia } from '@/lib/familias/auth'
import { getAlumnosDeFamilia } from '@/lib/familias/data'
import PanelesHijos from './PanelesHijos'

export const dynamic = 'force-dynamic'

export default async function FamiliasDashboard() {
  const familia = await requireFamilia()
  const alumnos = await getAlumnosDeFamilia(familia.id)
  const saludo = familia.nombre ? `Hola, ${familia.nombre.split(' ')[0]}` : 'Hola'

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-black text-pm-navy">{saludo} 👋</h1>
      <p className="text-gray-500 text-sm mb-6">
        Aquí tienes la información de {alumnos.length === 1 ? 'tu hij@' : 'tus hij@s'} en el Club Deportivo Origen.
        Pulsa en cada panel para ver todos los detalles.
      </p>

      {alumnos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
          Todavía no hay alumnos vinculados a tu cuenta. Contacta con el Club Deportivo Origen.
        </div>
      ) : (
        <PanelesHijos alumnos={alumnos} />
      )}
    </div>
  )
}
