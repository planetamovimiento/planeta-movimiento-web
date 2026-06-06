import { getAdminUser, can } from '@/lib/admin/auth'
import { getRows } from '@/lib/admin/data'
import { AdminHeader, SetupNotice, Metric } from '@/components/admin/ui'
import FormulariosClient from '../formularios/FormulariosClient'

export default async function ClubPage() {
  const admin = await getAdminUser()
  const { rows, ok } = await getRows('form_submissions')

  // Solo solicitudes del Club Deportivo Origen
  const club = (rows as Record<string, unknown>[]).filter(r => r.tipo === 'inscripcion_club')
  const nuevas = club.filter(r => r.estado === 'nueva').length

  return (
    <>
      <AdminHeader
        titulo="Club Deportivo Origen · Solicitudes"
        subtitulo="Inscripciones y solicitudes de las actividades del club — gestión manual"
      />
      <div className="p-6 lg:p-8 space-y-6">
        {!ok && <SetupNotice />}

        <div className="bg-pm-navy text-white rounded-2xl p-5 flex items-start gap-4">
          <span className="text-3xl">🏅</span>
          <div className="text-sm">
            <div className="font-black mb-1">Área del Club Deportivo Origen</div>
            <p className="text-white/60 leading-relaxed">
              Estas solicitudes son de las actividades del club (gimnasia acrobática, aéreos, escuela infantil,
              jiu-jitsu, bienestar, circo inclusivo). <strong className="text-white">No son ventas</strong>: se gestionan
              manualmente dando de alta al alumno tras contactar con la familia.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Metric label="Solicitudes nuevas" valor={nuevas} tono="red" />
          <Metric label="Total solicitudes club" valor={club.length} tono="navy" />
        </div>

        <FormulariosClient rows={club as never} puedeEditar={admin ? can.edit(admin.role) : false} />
      </div>
    </>
  )
}
