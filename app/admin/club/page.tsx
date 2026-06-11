import { requireSeccion, can } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminHeader } from '@/components/admin/ui'
import { TEMPORADA_ACTUAL, type Alumno, type Grupo, type EstadoGeneral, type EstadoPago } from '@/lib/club/constants'
import ClubInscripcionesClient from './ClubInscripcionesClient'

type SubRow = {
  id: string; nombre: string | null; email: string | null; telefono: string | null
  mensaje: string | null; datos: Record<string, unknown> | null; created_at: string
}
type GestionRow = {
  submission_id: string; grupo: string | null; estado_general: string | null; temporada: string | null
  pagos: Record<string, string> | null; observaciones: string | null; fecha_alta: string | null; fecha_baja: string | null
  observaciones_familia: string | null; foto_url: string | null; horario: string | null
}

async function safe<T>(fn: () => Promise<{ data: T[] | null; error: unknown }>): Promise<{ rows: T[]; ok: boolean }> {
  try {
    const { data, error } = await fn()
    if (error) return { rows: [], ok: false }
    return { rows: data ?? [], ok: true }
  } catch {
    return { rows: [], ok: false }
  }
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

export default async function ClubPage() {
  const admin = await requireSeccion('club')
  const db = createAdminClient()

  const [subsRes, gestionRes, gruposRes] = await Promise.all([
    safe<SubRow>(() => db.from('form_submissions').select('id, nombre, email, telefono, mensaje, datos, created_at')
      .eq('tipo', 'inscripcion_club').order('created_at', { ascending: false }).limit(2000) as never),
    safe<GestionRow>(() => db.from('club_gestion').select('*') as never),
    safe<Grupo>(() => db.from('club_grupos').select('*').order('orden', { ascending: true }) as never),
  ])

  const gestionMap = new Map(gestionRes.rows.map(g => [g.submission_id, g]))

  const alumnos: Alumno[] = subsRes.rows.map(s => {
    const d = (s.datos ?? {}) as Record<string, unknown>
    const g = gestionMap.get(s.id)
    const completo = str(s.nombre)
    const nombre = str(d.nombre) || completo.split(' ')[0] || ''
    const apellidos = str(d.apellidos) || completo.split(' ').slice(1).join(' ')
    return {
      id: s.id,
      nombre,
      apellidos,
      nombreCompleto: completo || `${nombre} ${apellidos}`.trim(),
      actividad: str(d.actividad),
      fechaNacimiento: str(d.fechaNacimiento),
      tutorLegal: str(d.tutorLegal),
      nivel: str(d.nivel),
      telefono: str(s.telefono),
      email: str(s.email),
      mensaje: str(s.mensaje),
      created_at: s.created_at,
      grupo: g?.grupo ?? str(d.nivel),
      estado_general: (g?.estado_general as EstadoGeneral) ?? 'pendiente',
      temporada: g?.temporada ?? TEMPORADA_ACTUAL,
      pagos: (g?.pagos as Record<string, EstadoPago>) ?? {},
      observaciones: g?.observaciones ?? '',
      observaciones_familia: g?.observaciones_familia ?? '',
      foto_url: g?.foto_url ?? '',
      horario: g?.horario ?? '',
      fecha_alta: g?.fecha_alta ?? null,
      fecha_baja: g?.fecha_baja ?? null,
    }
  })

  return (
    <>
      <AdminHeader
        titulo="Inscripciones · Club Deportivo Origen"
        subtitulo="Gestión manual de alumnos: grupos, temporada y estado mensual de pago"
      />
      <div className="p-4 lg:p-6">
        <ClubInscripcionesClient
          alumnos={alumnos}
          grupos={gruposRes.rows}
          puedeEditar={admin ? can.edit(admin.role) : false}
          gestionOk={gestionRes.ok}
        />
      </div>
    </>
  )
}
