import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireFamilia } from '@/lib/familias/auth'
import { getAlumnoDeFamilia } from '@/lib/familias/data'
import { FichaParticipante } from '@/components/familias/FichaParticipante'

export const dynamic = 'force-dynamic'

export default async function AlumnoFamiliaPage({ params }: { params: Promise<{ id: string }> }) {
  const familia = await requireFamilia()
  const { id } = await params
  // getAlumnoDeFamilia valida en el servidor que el alumno pertenece a la familia:
  // cambiar el id en la URL a otro alumno devuelve null → notFound.
  const a = await getAlumnoDeFamilia(familia.id, id)
  if (!a) notFound()

  // Línea de socio: no tiene ficha; su información vive en su inscripción del club.
  if (a.soloSocio) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <Link href="/familias" className="text-sm text-gray-500 hover:text-pm-red">← Volver a mis participantes</Link>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="font-black text-pm-navy text-lg">{a.nombre} {a.apellidos}</div>
          <p className="text-sm text-gray-500 mt-1">Participante añadido en el alta de socio.</p>
          <span className="inline-block mt-3 text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-3 py-1">⭐ Socio</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <Link href="/familias" className="text-sm text-gray-500 hover:text-pm-red">← Volver a mis participantes</Link>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <FichaParticipante alumno={a} />
      </div>
    </div>
  )
}
