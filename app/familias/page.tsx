import Link from 'next/link'
import { requireFamilia } from '@/lib/familias/auth'
import { getAlumnosDeFamilia } from '@/lib/familias/data'
import { Avatar } from './ui'

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
      </p>

      {alumnos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
          Todavía no hay alumnos vinculados a tu cuenta. Contacta con el Club Deportivo Origen.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {alumnos.map(a => (
            <Link key={a.id} href={`/familias/alumno/${a.id}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-pm-red/30 transition-all">
              <Avatar foto={a.foto_url} nombre={a.nombre} size="md" />
              <div className="min-w-0 flex-1">
                <div className="font-black text-pm-navy truncate">{a.nombre} {a.apellidos}</div>
                <div className="text-sm text-gray-500 truncate">{a.actividad || 'Club Deportivo Origen'}</div>
                {a.grupo && <div className="text-xs text-gray-400 truncate">{a.grupo}</div>}
              </div>
              <span className="text-pm-red font-bold text-sm group-hover:translate-x-0.5 transition-transform">Ver →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
