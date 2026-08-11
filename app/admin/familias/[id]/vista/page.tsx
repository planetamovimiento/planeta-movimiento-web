import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireSeccion } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAlumnosDeFamilia } from '@/lib/familias/data'
import { getAvisosActivos } from '@/lib/familias/avisos'
import { getTemporadaActiva } from '@/lib/config/store'
import { temporadaDisplay } from '@/lib/club/constants'
import { CabeceraFamilia } from '@/components/familias/CabeceraFamilia'
import { AvisosClub } from '@/components/familias/AvisosClub'
import { FichaParticipante } from '@/components/familias/FichaParticipante'

export const dynamic = 'force-dynamic'

// "Ver como familia": previsualización de SOLO LECTURA con los mismos componentes
// del portal público. NO crea una sesión del usuario ni usa sus credenciales;
// es una vista administrativa. Punto 22/23.
export default async function VistaComoFamiliaPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSeccion('familias')
  const { id } = await params

  const db = createAdminClient()
  const { data: fam } = await db.from('club_familias').select('id, nombre, email, numero_socio').eq('id', id).maybeSingle()
  if (!fam) notFound()

  const [alumnos, avisos, tempRaw] = await Promise.all([
    getAlumnosDeFamilia(id), getAvisosActivos(), getTemporadaActiva(),
  ])
  const saludo = (fam.nombre as string | null)?.split(' ')[0] || ''

  return (
    <div className="min-h-screen bg-pm-bg">
      {/* Banner de previsualización (no forma parte del portal real) */}
      <div className="bg-amber-500 text-white text-center text-sm font-bold py-2 px-4 sticky top-0 z-10">
        Vista previa como familia · {fam.email} — solo lectura, no es una sesión real
        <Link href="/admin/familias" className="underline ml-3 font-semibold">Volver al admin</Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <CabeceraFamilia saludo={saludo} numeroSocio={fam.numero_socio as string | null} temporada={temporadaDisplay(tempRaw)} nParticipantes={alumnos.length} />
        <AvisosClub avisos={avisos} />

        {alumnos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
            Esta familia no tiene participantes vinculados.
          </div>
        ) : (
          <div className="space-y-4">
            {alumnos.map(a => (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                <FichaParticipante alumno={a} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
